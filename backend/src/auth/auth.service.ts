import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

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

  async login(loginUserDto: LoginUserDto, res: Response) {
    const user = await this.userService.findByUsername(loginUserDto.username);
    if (
      user &&
      (await bcrypt.compare(loginUserDto.password, user.passwordHash))
    ) {
      const tokens = await this.getTokens(user.id, user.username);
      await this.updateRefreshToken(user.id, tokens.refreshToken); // Store the hashed refresh token
      this.setRefreshTokenCookie(tokens.refreshToken, res); // Set the refresh token in a cookie
      return { accessToken: tokens.accessToken };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async getTokens(userId: number, username: string) {
    const payload = { sub: userId, username };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateUserRefreshToken(userId, hashedRefreshToken);
  }

  setRefreshTokenCookie(refreshToken: string, res: Response) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  async validateRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userService.findById(payload.sub);

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }

  async refreshTokens(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.validateRefreshToken(refreshToken);
    const tokens = await this.getTokens(user.id, user.username);

    // Update the refresh token and set it in the cookie
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    this.setRefreshTokenCookie(tokens.refreshToken, res);

    return { accessToken: tokens.accessToken };
  }

  async logout(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  async removeRefreshToken(userId: number) {
    await this.userService.updateUserRefreshToken(userId, null);
  }
}
