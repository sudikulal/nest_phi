import {
    IsString,
    IsNotEmpty,
    ValidateIf,
    IsBoolean,
} from 'class-validator';

export class LoginDto {
    @IsBoolean()
    new_register: boolean;

    @ValidateIf((o) => !o.email || o.new_register)
    @IsString({ message: 'Username must be a string' })
    @IsNotEmpty({ message: 'Username must not be empty' })
    username?: string;

    @ValidateIf((o) => !o.username || o.new_register)
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email must not be empty' })
    email?: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
