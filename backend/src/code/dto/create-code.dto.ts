import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  language: string;
}
