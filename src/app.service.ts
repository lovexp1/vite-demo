import { Injectable } from '@nestjs/common';

import type { Response } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';

/** 重写裸模块路径 */
function rewriteImport(body) {
  return body.replace(
    / from ["'](.*)["']/g,
    (str: string, matchesStr: string) => {
      if (/^(\.\/|\.\.\/|\/)/.test(matchesStr)) return str;
      return ` from '/@modules/${matchesStr}'`;
    },
  );
}

@Injectable()
export class AppService {
  /** 加载裸模块 */
  async fetchBareModule(url: string, res: Response) {
    const moduleName = url.replace('/@modules/', '');
    const prefix = join(__dirname, '../node_modules', moduleName);
    const module = JSON.parse(
      await readFile(join(prefix, 'package.json'), 'utf-8'),
    );
    const body = await readFile(join(prefix, module.module), 'utf-8');
    res.setHeader('Content-Type', 'text/javascript');
    res.send(rewriteImport(body));
    return res;
  }
  /** 加载js模块 */
  async fetchJsModule(url: string, res: Response) {
    const body = rewriteImport(
      await readFile(join(__dirname, '../', url), 'utf-8'),
    );
    res.setHeader('Content-Type', 'text/javascript');
    res.send(body);
    return res;
  }
  /** 加载首页html文件 */
  async fetchIndex(url: string, res: Response) {
    const body = await readFile(
      join(__dirname, '../public/index.html'),
      'utf-8',
    );
    res.setHeader('Content-Type', 'text/html');
    res.send(body);
    return res;
  }
}
