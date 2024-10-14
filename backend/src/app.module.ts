import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { Code } from './code/entities/code.entity';
import { User } from './user/entities/user.entity';
import { SessionModule } from './session/session.module';
import { Session } from './session/entities/session.entity';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SessionParticipant } from './session/entities/session-participants.entity';
import { CodeModule } from './code/code.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      // commented for local db
      // ssl: {
      //   rejectUnauthorized: false,
      // },
    }),
    TypeOrmModule.forFeature([Code, User, Session, SessionParticipant]),
    AuthModule,
    UserModule,
    WebsocketModule,
    CodeModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
