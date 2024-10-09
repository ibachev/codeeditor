import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CodeService } from './code.service';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save/:id')
  saveCode(@Body() createCodeDto: CreateCodeDto, @Param('id') id: string) {
    return this.codeService.saveCode(createCodeDto, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('run/:id')
  runCode(@Body() createCodeDto: CreateCodeDto, @Param('id') id: string) {
    return this.codeService.runCode(createCodeDto, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCodeDto: UpdateCodeDto) {
    return this.codeService.update(+id, updateCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codeService.remove(+id);
  }
}
