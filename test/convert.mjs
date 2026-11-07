// Thử chuyển mọi file .dwg trong một thư mục bằng chính file vendor/ của trang.
// Dùng: node test/convert.mjs <thư mục DWG> [thư mục lưu DXF]
import createModule from '../vendor/libredwg-web.js';
import fs from 'fs';
import path from 'path';
const dir = process.argv[2];
const outDir = process.argv[3]; // tùy chọn: lưu DXF vào đây
for (const name of fs.readdirSync(dir).filter((n) => /\.dwg$/i.test(n)).sort()) {
  const mod = await createModule({ print() {}, printErr() {} });
  const t = Date.now();
  try {
    mod.FS.writeFile('/in.dwg', fs.readFileSync(path.join(dir, name)));
    const err = mod.dwg_write_dxf('/in.dwg', '/out.dxf');
    const out = mod.FS.analyzePath('/out.dxf', false).exists ? mod.FS.readFile('/out.dxf') : null;
    if (outDir && out) fs.writeFileSync(path.join(outDir, name.replace(/\.dwg$/i, '.dxf')), out);
    console.log(name, out && err < 128 ? `OK ${out.length} bytes, ${Date.now() - t} ms, code ${err}` : `FAIL code ${err}`);
  } catch (e) {
    console.log(name, 'CRASH', e.message);
  }
}
