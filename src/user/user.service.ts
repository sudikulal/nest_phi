import { HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInterface } from './interfaces/user.interface';
import { UserDbService } from 'src/db/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { randomUUID } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { ALLOW_MULTI_LOGIN, TTL } from '../global/constant';

@Injectable()
export class UserService {
    constructor(
        private readonly userDbService: UserDbService,
        private readonly authService: AuthService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly ConfigService: ConfigService,
    ) { }
    async login(user: LoginInterface) {
        const { username, email, password } = user;

        const query = {};

        if (username) {
            query['name'] = username;
        } else if (email) {
            query['email'] = email;
        } else {
            throw new HttpException('Username or email must be provided', 401);
        }

        const userData = await this.userDbService.findUser(query, {
            id: true,
            password: true,
        });

        if (!userData) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isPasswordValid = await this.authService.comparePassword(
            password,
            userData.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const refreshTokenJti = randomUUID();

        const refreshToken = await this.authService.generateRefreshToken({
            userId: userData.id,
            refreshTokenJti,
        });

        if (!ALLOW_MULTI_LOGIN) {
            await this.cacheManager.del(userData.id.toString());
        }

        await this.userDbService.updateUser(userData.id, {
            refresh_jti: refreshTokenJti,
        });

        return {
            userId: userData.id,
            refreshToken,
        };
    }

    async register(user: LoginInterface) {
        const { username, email, password } = user;

        const isUserExists = await this.userDbService.findUser(
            {
                OR: [{ name: username }, { email: email }],
            },
            { id: true, name: true, email: true },
        );

        if (isUserExists) {
            if (isUserExists.name === username) {
                throw new HttpException('Username already exists', 409);
            }
            if (isUserExists.email === email) {
                throw new HttpException('Email already exists', 409);
            }
        }
        const hashedPassword = this.authService.generateHashedPassword(password);
        const refreshTokenJti = randomUUID();
        const userData = await this.userDbService.createUser({
            name: username!,
            email: email!,
            password: await hashedPassword,
            refresh_jti: refreshTokenJti,
        });

        const refreshToken = await this.authService.generateRefreshToken({
            userId: userData.id,
            refreshTokenJti,
        });

        return {
            userId: userData.id,
            refreshToken,
        };
    }

    async generateAccessToken(refreshToken: string) {
        const payload = await this.authService.verifyRefreshToken(refreshToken);
        if (!payload || !payload.userId) {
            throw new UnauthorizedException('Invalid Refresh Token');
        }

        const accessTokenJti = randomUUID();
        const accessToken = await this.authService.generateAccessToken({
            userId: payload.userId,
            accessTokenJti,
        });

        if (!ALLOW_MULTI_LOGIN) {
            const refreshTokenJti = payload.refreshTokenJti;

            const isValid = await this.userDbService.findUser(
                { id: payload.userId, refresh_jti: refreshTokenJti },
                { id: true },
            );

            if (!isValid) {
                throw new UnauthorizedException('Invalid Refresh Token');
            }


            await this.cacheManager.set(
                payload.userId,
                accessTokenJti,
                TTL.JTI_EXPIRATION,
            );
        }

        return {
            userId: payload.userId,
            accessToken,
        };
    }
}
