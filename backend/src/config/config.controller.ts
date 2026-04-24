import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  findOne() {
    return this.configService.findOne();
  }

  @Post()
  update(@Body() body: any) {
    return this.configService.update(body);
  }
}
