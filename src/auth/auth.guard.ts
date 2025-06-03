import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ALLOW_MULTI_LOGIN } from '../global/constant';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.headers.access_token;

        if (!token) {
            throw new UnauthorizedException('No access token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('jwt.accessToken.secret'),
            });

            if (!payload || !payload.userId) {
                throw new UnauthorizedException();
            }

            if (!ALLOW_MULTI_LOGIN) {
                const currentAccessToken = await this.cacheManager.get(payload.userId);

                if (!currentAccessToken || (payload.accessTokenJti !== currentAccessToken)) {
                    throw new UnauthorizedException();
                }
            }

            request['userObj'] = payload;
        } catch(error) {
            throw new UnauthorizedException('Invalid access token');
        }

        return true;
    }
}
