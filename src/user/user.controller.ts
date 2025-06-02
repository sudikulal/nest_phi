import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { LoginDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post("/Login")
    async login(@Body() body: LoginDto) {
        try {
            const { username, email, password, new_register } = body;
            if (new_register) return await this.userService.register({ username, email, password });
            else return await this.userService.login({ username, email, password });
        } catch (error) {
            throw error
        }
    }
}
