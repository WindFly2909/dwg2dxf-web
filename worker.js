// Chuyển DWG sang DXF bằng LibreDWG (WebAssembly) ngay trên máy người dùng.
// File không được gửi đi đâu. Mỗi lần chuyển dùng một worker mới để lỗi
// của bản WebAssembly không ảnh hưởng lần sau.
import createModule from './vendor/libredwg-web.js';

let modPromise = null;
function getModule() {
  if (!modPromise) {
    modPromise = createModule({
      locateFile: (name) => new URL('./vendor/' + name, import.meta.url).href,
      print: () => {},
      printErr: () => {},
    });
  }
  return modPromise;
}

self.onmessage = async (e) => {
  const { bytes } = e.data;
  const IN = '/in.dwg';
  const OUT = '/out.dxf';
  try {
    const mod = await getModule();
    self.postMessage({ type: 'ready' });
    mod.FS.writeFile(IN, new Uint8Array(bytes));
    const err = mod.dwg_write_dxf(IN, OUT);
    let out = null;
    if (mod.FS.analyzePath(OUT, false).exists) out = mod.FS.readFile(OUT);
    // Mã lỗi LibreDWG < 128 là lỗi không nghiêm trọng; vẫn dùng kết quả nếu có.
    if (!out || out.length === 0 || err >= 128) {
      self.postMessage({ type: 'error', code: 'convert', detail: String(err) });
      return;
    }
    self.postMessage({ type: 'done', dxf: out.buffer, warn: err }, [out.buffer]);
  } catch (ex) {
    self.postMessage({ type: 'error', code: 'crash', detail: String(ex && ex.message || ex) });
  }
};
