import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post("/Login")
    login(@Body() body: LoginDto) {
        const { username, email, password, new_register } = body;
        if (new_register) this.userService.register({ username, email, password });
        else this.userService.login({ username, email, password });
        return "Login successful!";
    }
}
