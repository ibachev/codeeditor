import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './entities/code.entity';
import { PistonService } from './piston.service';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [SessionModule, TypeOrmModule.forFeature([Code])],
  controllers: [CodeController],
  providers: [CodeService, PistonService],
})
export class CodeModule {}
