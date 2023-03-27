import { Controller, Get, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('*')
  async getHello(@Res() res: Response, @Req() req: Request) {
    const { url, query } = req;
    if (url === '/') return this.appService.fetchIndex(url, res);
    if (url.endsWith('.js')) return this.appService.fetchJsModule(url, res);
    if (url.startsWith('/@modules/'))
      return this.appService.fetchBareModule(url, res);
    if (url.indexOf('.vue') !== -1) return this.appService.fetchVueSfc(url, query, res);

    res.send();
    return res;
  }
}
