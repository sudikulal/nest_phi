import {
    IsString,
    IsNotEmpty,
    ValidateIf,
    IsBoolean,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
    @Type(() => Boolean)
    @IsBoolean({ message: 'new_register must be a boolean value' })
    new_register: boolean;

    @ValidateIf((o) => o.new_register || !o.email)
    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username must not be empty' })
    username?: string;

    @ValidateIf((o) => o.new_register || !o.username)
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email must not be empty' })
    email?: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

}
