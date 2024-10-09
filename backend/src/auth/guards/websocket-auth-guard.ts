import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('here');
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.query.token;

    const tokenString = Array.isArray(token) ? token[0] : token;

    if (!tokenString) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(tokenString, {
        secret: process.env.JWT_SECRET,
      }); // Verify the token
      const userId = decoded.sub;
      const user = await this.userService.findById(userId);

      client.user = user;
      return true; // Token is valid, allow connection
    } catch (err) {
      console.log('error reading token:', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
