import { Injectable } from '@nestjs/common';
import { PeerServer } from 'peer';

@Injectable()
export class PeerServerService {
  private peerServer: any;

  enablePeerServer() {
    this.peerServer = PeerServer({
      port: 3002,
      path: '/myapp',
    });

    this.peerServer.on('connection', (client) => {
      console.log(`Client connected: ${client.id}`);
    });

    this.peerServer.on('disconnect', (client) => {
      console.log(`Client disconnected: ${client.id}`);
    });

    console.log('PeerJS server running on port 3002');
  }
}
