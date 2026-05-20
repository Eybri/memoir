import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { LettersService } from './letters.service';

import { Letter } from '../schemas/letter.schema';

@Controller('letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Get()
  findAll() {
    return this.lettersService.findAll();
  }

  @Post()
  create(@Body() body: Partial<Letter>) {
    return this.lettersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<Letter>) {
    return this.lettersService.update(id, body);
  }
}
