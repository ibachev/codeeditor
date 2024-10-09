import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/session/entities/session.entity';
import { SessionParticipant } from 'src/session/entities/session-participants.entity';
import { SessionModule } from 'src/session/session.module';
import { SessionService } from 'src/session/session.service';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    UserModule,
    SessionModule,
    TypeOrmModule.forFeature([User, Session, SessionParticipant]),
  ],
  providers: [SessionService, WebsocketGateway],

  exports: [WebsocketGateway],
})
export class WebsocketModule {}
