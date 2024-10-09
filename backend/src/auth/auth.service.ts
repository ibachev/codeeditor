import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    return this.userService.create({
      ...createUserDto,
      passwordHash,
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findByUsername(loginUserDto.username);
    if (
      user &&
      (await bcrypt.compare(loginUserDto.password, user.passwordHash))
    ) {
      const payload = { username: user.username, sub: user.id };
      return {
        token: this.jwtService.sign(payload),
      };
    }
    throw new Error('Invalid credentials');
  }
}
