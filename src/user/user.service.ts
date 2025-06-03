import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInterface } from './interfaces/user.interface';
import { UserDbService } from 'src/db/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
    constructor(private readonly userDbService: UserDbService, private readonly authService: AuthService) { }
    async login(user: LoginInterface) {
        const { username, email, password } = user;

        const query = {}

        if (username) {
            query['name'] = username;
        } else if (email) {
            query['email'] = email;
        } else {
            throw new HttpException("Username or email must be provided", 401);
        }

        const userData = await this.userDbService.findUser(query, { id: true, password: true });

        if (!userData) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        const isPasswordValid = await this.authService.comparePassword(password, userData.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        const refreshToken = await this.authService.generateRefreshToken({
            userId: userData.id,
            refreshTokenJti: randomUUID(),
        })

        return {
            userId: userData.id,
            refreshToken,
        }

    }

    async register(user: LoginInterface) {
        const { username, email, password } = user;

        const isUserExists = await this.userDbService.findUser({
            OR: [
                { name: username },
                { email: email }
            ]
        }, { id: true, name: true, email: true });

        if (isUserExists) {
            if (isUserExists.name === username) {
                throw new HttpException("Username already exists", 409);
            }
            if (isUserExists.email === email) {
                throw new HttpException("Email already exists", 409);
            }
        }
        const hashedPassword = this.authService.generateHashedPassword(password);
        const userData = await this.userDbService.createUser({
            name: username!,
            email: email!,
            password: await hashedPassword,
        })

        const refreshToken = await this.authService.generateRefreshToken({
            userId: userData.id,
            RefreshTokenJti: randomUUID(),
        })

        return {
            userId: userData.id,
            refreshToken,
        }
    }

    async generateAccessToken(refreshToken: string) {
        const payload = await this.authService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new UnauthorizedException("Invalid Refresh Token");
        }

        const accessToken = await this.authService.generateAccessToken({
            userId: payload.userId,
            accessTokenJti: randomUUID(),
        });

        return {
            userId: payload.userId,
            accessToken,
        }
    }
}
