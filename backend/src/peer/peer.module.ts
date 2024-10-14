import { Module } from '@nestjs/common';
import { PeerServerService } from './peer.service';

@Module({
  providers: [PeerServerService],
  exports: [PeerServerService],
})
export class PeerModule {}
