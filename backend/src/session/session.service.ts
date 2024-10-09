import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { User } from '../user/entities/user.entity';
import { SessionParticipant } from './entities/session-participants.entity';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(SessionParticipant)
    private readonly sessionParticipantRepository: Repository<SessionParticipant>,
  ) {}

  async createSession(
    creator: User,
    createSessionDto: CreateSessionDto,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      creator,
      name: createSessionDto.name,
    });
    session.participants = [];
    return await this.sessionRepository.save(session);
  }

  async joinSession(user: User, sessionId: string): Promise<any> {
    const session = await this.findOneBySessionId(sessionId);

    if (session.creator.id === user.id) {
      return;
    }

    // Check if the user is already a participant
    let participant = session.participants.find((p) => p.user.id === user.id);

    if (participant) {
      participant.online = true; // Set online status
      await this.sessionParticipantRepository.save(participant); // Update existing participant
    } else {
      // Create new participant
      participant = this.sessionParticipantRepository.create({
        session,
        user,
        online: true, // Set online status
      });
      await this.sessionParticipantRepository.save(participant);
    }

    return { sessionId, username: user.username };
  }

  async leaveSession(username: string, sessionId: string): Promise<any> {
    const session = await this.findOneBySessionId(sessionId);
    const participant = session.participants.find(
      (p) => p.user.username === username,
    );
    if (participant) {
      participant.online = false;
    }
  }

  async getSessionParticipants(sessionId: string): Promise<any> {
    const session = await this.findOneBySessionId(sessionId);
    return session.participants;
  }

  async kickUserFromSession(
    creator: User,
    sessionId: string,
    userId: number,
  ): Promise<Session> {
    const session = await this.findOneBySessionId(sessionId);

    // Check if the user attempting to kick is the session creator
    if (session.creator.id !== creator.id) {
      throw new ForbiddenException(
        'Only the session creator can kick participants.',
      );
    }

    // Find the session participant to kick
    const participant = session.participants.find((p) => p.user.id === userId);

    if (!participant) {
      throw new NotFoundException('User not found in session.');
    }

    participant.kicked = true;

    await this.sessionParticipantRepository.save(participant);

    return session;
  }

  async getSessionParticipant(sessionId: string, username: string) {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, participants: { user: { username } } },
      relations: ['participants', 'code'],
    });

    return session?.participants[0];
  }

  async updateParticipantKickStatus(
    sessionId: string,
    username: string,
    kicked: boolean,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, participants: { user: { username } } },
      relations: ['participants'],
    });

    if (!session || session.participants.length === 0) {
      throw new Error('Session or participant not found');
    }

    const participant = session.participants[0];

    participant.kicked = kicked;

    await this.sessionParticipantRepository.save(participant);
  }

  async updateParticipantMuteStatus(
    sessionId: string,
    username: string,
    muted: boolean,
  ): Promise<SessionParticipant> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, participants: { user: { username } } },
      relations: ['participants'],
    });

    if (!session || session.participants.length === 0) {
      throw new Error('Session or participant not found');
    }

    const participant = session.participants[0];
    participant.muted = muted;

    return await this.sessionParticipantRepository.save(participant);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepository.find({ relations: ['creator'] });
  }

  async findOneBySessionId(id: string): Promise<Session> {
    return this.sessionRepository.findOne({
      where: { sessionId: id },
      relations: ['participants', 'code'],
    });
  }

  async findParticipantsBySessionId(id: string): Promise<SessionParticipant[]> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId: id },
      relations: ['participants'],
    });
    return session?.participants || []; // Return participants or an empty array if not found
  }

  async getSessionsByUser(
    userId: number,
  ): Promise<{ created: Session[]; joined: Session[] }> {
    const createdSessions = await this.sessionRepository.find({
      where: { creator: { id: userId } },
      relations: ['participants', 'participants.user'],
    });

    const joinedSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user') // Join to get user details
      .where('participant.userId = :userId', { userId })
      .getMany();

    return {
      created: createdSessions,
      joined: joinedSessions,
    };
  }

  async updateSession(id: number, isLocked: boolean): Promise<Session> {
    await this.sessionRepository.update(id, {
      isLocked,
      updatedAt: new Date(),
    });
    return this.findOneBySessionId(id.toString());
  }

  async deleteSession(id: number): Promise<void> {
    await this.sessionRepository.delete(id);
  }
}
