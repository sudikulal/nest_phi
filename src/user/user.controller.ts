import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { LoginDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post("/Login")
    login(@Body() body: LoginDto) {
        const { username, email, password, new_register } = body;
        return new_register
            ? this.userService.register({ username, email, password })
            : this.userService.login({ username, email, password });
    }
}
