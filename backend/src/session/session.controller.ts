import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { Session } from './entities/session.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-access-token.guard.ts';
import { SessionParticipant } from './entities/session-participants.entity';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createSession(
    @Request() req,
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<Session> {
    const user = req.user;
    return this.sessionService.createSession(user, createSessionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getSessionsByUser(
    @Request() req,
  ): Promise<{ created: Session[]; joined: Session[] }> {
    const userId = req.user.id;
    return this.sessionService.getSessionsByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/participants')
  async getSessionParticipants(@Param('id') id: string): Promise<any> {
    return this.sessionService.getSessionParticipants(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kick/:sessionId/:userId')
  async kickUser(
    @Param('sessionId') sessionId: string,
    @Param('userId') userId: number,
    @Request() req,
  ): Promise<any> {
    const user = req.user;
    return this.sessionService.kickUserFromSession(user, sessionId, userId);
  }

  @Get()
  findAll(): Promise<Session[]> {
    return this.sessionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Session> {
    return this.sessionService.findOneBySessionId(id);
  }

  @Get(':id/participants')
  async findParticipants(
    @Param('id') id: string,
  ): Promise<SessionParticipant[]> {
    return this.sessionService.findParticipantsBySessionId(id);
  }

  @Put(':id')
  updateSession(
    @Param('id') id: number,
    @Body() body: { isLocked: boolean },
  ): Promise<Session> {
    return this.sessionService.updateSession(id, body.isLocked);
  }

  @Delete(':id')
  deleteSession(@Param('id') id: number): Promise<void> {
    return this.sessionService.deleteSession(id);
  }
}
