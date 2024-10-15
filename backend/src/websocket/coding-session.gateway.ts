import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/auth/guards/websocket-auth-guard';
import { SessionService } from 'src/session/session.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
require('dotenv').config();

interface OnlineUsers {
  [sessionId: string]: string[]; // sessionId -> array of usernames
}

@WebSocketGateway({
  cors: {
    origin: [process.env.REACT_URL, 'http://localhost:3001'],
  },
})
export class CodingSessionGateway {
  @WebSocketServer()
  server: Server;

  private onlineUsers: OnlineUsers = {}; // In-memory store for online users
  private sessionCode: Map<string, string> = new Map(); // sessionId -> code
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map(); // sessionId -> timeout for cache cleanup
  private readonly CACHE_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes of inactivity

  constructor(
    private readonly sessionService: SessionService,
    private jwtService: JwtService,
    private userService: UserService,
    // private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const sessionId = client.handshake.query.sessionId as string;
    const token = client.handshake.query.token;
    const user = await this.getUserFromToken(token);
    const username = user.username;

    const sessionParticipant = await this.sessionService.getSessionParticipant(
      sessionId,
      username,
    );

    if (sessionParticipant?.kicked) {
      client.emit('user-kicked');
      return; // Prevent further actions for this client
    }

    // Clear the previous timeout for this session if a user connects
    if (this.sessionTimeouts.has(sessionId)) {
      clearTimeout(this.sessionTimeouts.get(sessionId));
      this.sessionTimeouts.delete(sessionId);
    }

    try {
      await this.sessionService.joinSession(user, sessionId);
    } catch (err) {
      console.log('Error while saving participant:', err);
    }

    // Ensure the session exists in the onlineUsers object
    if (!this.onlineUsers[sessionId]) {
      this.onlineUsers[sessionId] = [];
    }

    // Add user to the session's online user list if they're not already there
    if (!this.onlineUsers[sessionId].includes(username)) {
      this.onlineUsers[sessionId].push(username);
    }

    // Add the user to the session room
    client.join(sessionId);

    // Notify the newly joined user of all currently online users in the session
    client.emit('online-users', this.onlineUsers[sessionId]);

    // Notify other users in the session that this user is now online
    client.to(sessionId).emit('user-online', { username });

    // Send the current code to the newly connected user
    let currentCode: string;
    currentCode = this.sessionCode.get(sessionId); /// Default code if none exists
    if (!currentCode) {
      // If there is current code for this session in cache load it from db
      currentCode = (await this.sessionService.findOneBySessionId(sessionId))
        .code?.code;
    }

    // Send the latest code to the new usr
    client.emit('code-update', currentCode);

    this.resetSessionCacheTimeout(sessionId);

    console.log(`User ${username} connected to session ${sessionId}`);
  }

  async handleDisconnect(client: Socket) {
    const sessionId = client.handshake.query.sessionId as string;
    const token = client.handshake.query.token;
    const user = await this.getUserFromToken(token);
    const username = user.username;

    this.resetSessionCacheTimeout(sessionId);

    // Remove the user from the session's online user list
    if (this.onlineUsers[sessionId]) {
      this.onlineUsers[sessionId] = this.onlineUsers[sessionId].filter(
        (username) => username !== user.username,
      );

      // If no users are left in the session, you can delete the session entry
      if (this.onlineUsers[sessionId].length === 0) {
        delete this.onlineUsers[sessionId];
      }
    }

    // Notify other users that the user has gone offline
    this.server.to(sessionId).emit('user-offline', { username });

    console.log(`User ${username} disconnected from session ${sessionId}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('code-update')
  handleCodeUpdate(client: Socket, newCode: string): void {
    const sessionId = client.handshake.query.sessionId as string;

    this.sessionCode.set(sessionId, newCode);

    // Reset the session cache cleanup timeout since activity occurred
    this.resetSessionCacheTimeout(sessionId);

    // Broadcast the new code to all users in the same session
    client.to(sessionId).emit('code-update', newCode);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('user-typing')
  async handleUserTyping(client: Socket): Promise<void> {
    const sessionId = client.handshake.query.sessionId as string;
    const token = client.handshake.query.token;
    const user = await this.getUserFromToken(token);
    const username = user.username;
    const sessionParticipant = await this.sessionService.getSessionParticipant(
      sessionId,
      username,
    );
    if (!sessionParticipant?.muted) {
      this.server.to(sessionId).emit('update-user-typing', username);
    }
  }

  @SubscribeMessage('language-update')
  async handleLanguageUpdate(client: Socket, language: string): Promise<void> {
    const sessionId = client.handshake.query.sessionId as string;

    this.server.to(sessionId).emit('language-update', language);
  }

  @SubscribeMessage('result-update')
  async handleResultUpdate(client: Socket, language: string): Promise<void> {
    const sessionId = client.handshake.query.sessionId as string;

    this.server.to(sessionId).emit('result-update', language);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('toggleMute')
  async handleToggleMute(client: Socket, username: string): Promise<void> {
    const sessionId = client.handshake.query.sessionId as string;
    const token = client.handshake.query.token;
    const user = await this.getUserFromToken(token);
    const currentUsername = user.username;
    // Retrieve the participant details
    const sessionParticipant = await this.sessionService.getSessionParticipant(
      sessionId,
      username,
    );

    // Toggle the mute status
    const newMuteStatus = !sessionParticipant.muted;

    // Update the participant's mute status in the database
    await this.sessionService.updateParticipantMuteStatus(
      sessionId,
      username,
      newMuteStatus,
    );

    // Broadcast the toggle mute action to all other clients in the session
    client.to(sessionId).emit('mute-status-changed', {
      username,
      muted: newMuteStatus,
      initiatedBy: currentUsername,
    });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('toggleKickStatus')
  async handleToggleKick(client: Socket, username: string): Promise<void> {
    const sessionId = client.handshake.query.sessionId as string;
    const token = client.handshake.query.token;
    const user = await this.getUserFromToken(token);
    const currentUsername = user.username;

    // Retrieve the participant details
    const sessionParticipant = await this.sessionService.getSessionParticipant(
      sessionId,
      username,
    );

    const newKickStatus = !sessionParticipant.kicked;

    // Update the participant's kick status in the database
    await this.sessionService.updateParticipantKickStatus(
      sessionId,
      username,
      newKickStatus,
    );

    // Broadcast the toggle kick action to all other clients in the session
    this.server.to(sessionId).emit('kick-status-changed', {
      username,
      kicked: newKickStatus,
      initiatedBy: currentUsername,
    });
  }

  @SubscribeMessage('toggle-lock-status')
  async handleToggleLockStatus(client: Socket): Promise<void> {
    const sessionId = client.handshake.query.sessionId as string;

    // Retrieve the participant details
    const session = await this.sessionService.findOneBySessionId(sessionId);
    session.isLocked = !session.isLocked;

    await this.sessionService.updateSession(session.id, session.isLocked);

    this.server.to(sessionId).emit('lock-status-updated', session.isLocked);
  }

  async getUserFromToken(token: string | string[]): Promise<User> {
    const tokenString = Array.isArray(token) ? token[0] : token;

    if (!tokenString) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(tokenString, {
        secret: process.env.JWT_SECRET,
      });
      const userId = decoded.sub;
      const user = await this.userService.findById(userId);

      return user;
    } catch (err) {
      console.log('error reading token:', err);
    }
  }

  // Function to reset or start a session cache timeout
  private resetSessionCacheTimeout(sessionId: string) {
    if (this.sessionTimeouts.has(sessionId)) {
      clearTimeout(this.sessionTimeouts.get(sessionId));
    }

    const timeout = setTimeout(() => {
      this.sessionCode.delete(sessionId); // Clear the cache
      this.sessionTimeouts.delete(sessionId); // Clean up the timeout reference
      console.log(`Cache for session ${sessionId} cleared due to inactivity.`);
    }, this.CACHE_EXPIRATION_TIME);

    this.sessionTimeouts.set(sessionId, timeout);
  }
}
