import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly ConfigService: ConfigService) { }

    async generateAccessToken(payload: any): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.ConfigService.get<string>('jwt.accessToken.secret'),
            expiresIn: this.ConfigService.get<string>('jwt.accessToken.expiresIn'),
        });
    }

    async generateRefreshToken(payload: any): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.ConfigService.get<string>('jwt.refreshToken.secret'),
            expiresIn: this.ConfigService.get<string>('jwt.refreshToken.expiresIn'),
        });
    }

    async verifyAccessToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token, {
            secret: this.ConfigService.get<string>('jwt.accessToken.secret'),
        });
    }

    async verifyRefreshToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.ConfigService.get<string>('jwt.refreshToken.secret'),
            });

        } catch (error) {
            return null
        }
    }

    async generateHashedPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.ConfigService.get<number>('bcrypt.saltRounds') || 10);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
