import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
require('dotenv').config();

interface User {
  userId: string;
  socketId: string; // Keep track of the socket ID along with the user ID
}

@WebSocketGateway({
  cors: {
    origin: [process.env.REACT_URL, 'http://localhost:3001'],
  },
})
export class VideoCallGateway implements OnGatewayDisconnect {
  @WebSocketServer() server;

  // Store connected users by room
  private rooms = new Map<string, User[]>();
  private clientToRoomMap = new Map<string, string>(); // To track which room each client is in

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string; userId: string }) {
    const { roomId, userId } = payload;

    console.log('roomId:', roomId);
    console.log('userId:', userId);

    // Join the specified room
    client.join(roomId);
    this.clientToRoomMap.set(client.id, roomId); // Map the client ID to the room

    // Initialize room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }

    // Add user to the room's user list with socket ID
    const roomUsers = this.rooms.get(roomId);
    roomUsers.push({ userId, socketId: client.id });

    // Log the connected user
    console.log('user-connected:', userId);
    console.log('roomUsers:', roomUsers);

    // Emit to the room the connected user
    client.to(roomId).emit('user-connected', userId);
  }

  // Handle user disconnection
  async handleDisconnect(client: Socket) {
    const roomId = this.clientToRoomMap.get(client.id); // Find the room the user was in
    if (!roomId) return; // If the user was not in any room, no need to handle

    const roomUsers = this.rooms.get(roomId);
    if (!roomUsers) return;

    // Find the user based on the socket ID
    const userIndex = roomUsers.findIndex((u) => u.socketId === client.id);
    if (userIndex !== -1) {
      const user = roomUsers[userIndex];
      roomUsers.splice(userIndex, 1); // Remove the user from the list

      // Log the disconnected user
      console.log('user-disconnected:', user.userId);
      console.log('updatedRoomUsers:', roomUsers);

      // Emit to the room the disconnected user
      this.server.to(roomId).emit('user-disconnected', user.userId);

      // Clean up if the room is empty
      if (roomUsers.length === 0) {
        this.rooms.delete(roomId); // Delete room if empty
      }

      // Remove client-room mapping
      this.clientToRoomMap.delete(client.id);
    }
  }

  // Method to print users in a room
  printUsersInRoom(roomId: string) {
    if (this.rooms.has(roomId)) {
      const roomUsers = this.rooms.get(roomId);
      console.log(
        `Users in room ${roomId}:`,
        roomUsers.map((user) => user.userId),
      );
    } else {
      console.log(`No users in room ${roomId}`);
    }
  }
}
