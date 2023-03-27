import { Injectable } from '@nestjs/common';

import type { Response, Request } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse as parseSFC } from '@vue/compiler-sfc';
import { compile as parseDOM } from '@vue/compiler-dom';

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

function fetchSfcScrit(contennt: string, url: string) {
  const _script = contennt.replace('export default', 'const __script = ');
  return rewriteImport(`
    import { render as _render } from '${url}?type=template'
    ${rewriteImport(_script)}


    __script.render = _render;

    export default __script;
  `);
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
  async fetchVueSfc(url: string, query: Request['query'], res: Response) {
    console.log('url: string, res: Response ---------', url, query);

    const p = join(__dirname, '../', url.split('?')[0]);
    const sfcRes = parseSFC(await readFile(p, 'utf-8'));
    let body;

    if (query.type === 'template') {
      body = rewriteImport(
        parseDOM(sfcRes.descriptor.template.content, { mode: 'module' }).code,
      );
    } else {
      body = fetchSfcScrit(sfcRes.descriptor.script.content, url);
    }
    res.setHeader('Content-Type', 'text/javascript');
    res.send(body);
    return res;
  }
}
