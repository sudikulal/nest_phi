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

        const hashedPassword = await this.authService.generateHashedPassword(password)

        const query = {
            password: hashedPassword,
        }

        if (username) {
            query['username'] = username;
        } else if (email) {
            query['email'] = email;
        } else {
            throw new Error("Username or email must be provided");
        }

        const userData = await this.userDbService.findUser(query, { id: true });

        if (!userData) {
            throw new Error("Invalid Credentials");
        }

        const refreshToken = await this.authService.generateRefreshToken({
            userId: userData.id,
            RefreshTokenJti: randomUUID(),
        })

        const accessToken = await this.authService.generateAccessToken({
            userId: userData.id,
        });

        return {
            userId: userData.id,
            accessToken,
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

        const accessToken = await this.authService.generateAccessToken({
            userId: userData.id,
        });

        return {
            userId: userData.id,
            accessToken,
            refreshToken,
        }
    }
}
