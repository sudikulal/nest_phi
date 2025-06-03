import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { LoginDto } from './dto/user.dto';
import { UserService } from './user.service';
import { Public } from 'src/auth/auth.decorator';

@Controller('user')
@Public()
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post("/login")
    login(@Body() body: LoginDto) {
        const { username, email, password, new_register } = body;
        return new_register
            ? this.userService.register({ username, email, password })
            : this.userService.login({ username, email, password });
    }

    @Post("/accessToken")
    generateAccessToken(@Body('refreshToken') refreshToken: string) {
        if (!refreshToken) {
            throw new HttpException("refreshToken is required", 400);
        }
        return this.userService.generateAccessToken(refreshToken);
    }
}
