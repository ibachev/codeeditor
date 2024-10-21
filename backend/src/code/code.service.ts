import { Injectable } from '@nestjs/common';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from './entities/code.entity';
import { Repository } from 'typeorm';
import { SessionService } from 'src/session/session.service';
import { PistonService } from './piston.service';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepository: Repository<Code>,
    private readonly sessionService: SessionService,
    private readonly pistonService: PistonService,
  ) {}

  async saveCode(createCodeDto: CreateCodeDto, sessionId: string) {
    const code = await this.codeRepository.findOne({
      where: { session: { sessionId: sessionId } },
      relations: ['session'],
    });

    if (!code) {
      const session = await this.sessionService.findOneBySessionId(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const newCode = this.codeRepository.create({
        code: createCodeDto.code,
        session,
      });

      return await this.codeRepository.save(newCode);
    }

    // If code exists, update it
    code.code = createCodeDto.code;
    return await this.codeRepository.save(code);
  }

  async runCode(createCodeDto: CreateCodeDto, sessionId: string) {
    try {
      const result = await this.pistonService.executeCode(
        createCodeDto.language,
        createCodeDto.code,
      );
      const outputResult = result.run.output.trim();
      const code = await this.saveCode(createCodeDto, sessionId);

      code.result = outputResult;
      await this.codeRepository.save(code);

      return { result: outputResult };
    } catch (err) {
      console.log('Error while running code. Error: ', err);
    }
  }

  async findAll() {
    return await this.codeRepository.find({ relations: ['session'] });
  }

  findOne(id: number) {
    return `This action returns a #${id} code`;
  }

  update(id: number, updateCodeDto: UpdateCodeDto) {
    console.log(updateCodeDto);
    return `This action updates a #${id} code`;
  }

  remove(id: number) {
    return `This action removes a #${id} code`;
  }
}
