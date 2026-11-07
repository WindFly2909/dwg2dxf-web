const TEXT = {
  vi: {},
  en: {
    title: 'Convert DWG to DXF',
    subtitle: 'For the Construction Manager app. Files are converted on your device and never uploaded to any server.',
    step1: 'Choose the DWG file to convert.',
    step2: 'Wait for the conversion, then tap Download DXF.',
    step3: 'Go back to the app, tap Choose DXF file and pick the file you just downloaded (usually in the Download folder).',
    pick: 'Choose DWG file',
    download: 'Download DXF',
    again: 'Convert another file',
    helpTitle: 'Support and notes',
    help1: 'Supports DWG from AutoCAD 2004 and later (2004, 2007, 2010, 2013, 2018). Older DWG files may not convert.',
    help2: 'The first visit downloads about 3 MB. Later visits also work offline.',
    help3: 'Very large files may be slow on older phones. Keep the screen on until it finishes.',
    help4: 'If conversion fails, save the drawing as DXF or DWG 2013 from your CAD software, or open it with another app.',
    license: 'Open source under the GNU GPL v3. Uses the LibreDWG library.',
    source: 'Source code',
    licenseLink: 'License',
    thirdParty: 'Third-party libraries',
    loading: 'Loading the converter...',
    converting: 'Converting...',
    done: 'Done. Tap Download DXF, then go back to the app.',
    notDwg: 'This is not a DWG file. Please choose a .dwg file.',
    oldVersion: 'This drawing uses an old DWG version ({v}). It may not convert.',
    failed: 'Could not convert this file. Save it as DXF or DWG 2013 from your CAD software, or open it with another app.',
    failedOld: 'Could not convert this old DWG version ({v}). Save it as DWG 2013 or DXF from your CAD software, or open it with another app.',
    tooBig: 'This file is very large ({mb} MB). Conversion may be slow or run out of memory.',
    noWorker: 'This browser is too old. Please open the page in a recent Chrome.',
  },
};
const VI = {
  loading: 'Đang tải bộ chuyển đổi...',
  converting: 'Đang chuyển đổi...',
  done: 'Đã xong. Bấm Tải DXF về máy, rồi quay lại app.',
  notDwg: 'Đây không phải file DWG. Hãy chọn file .dwg.',
  oldVersion: 'Bản vẽ dùng DWG đời cũ ({v}), có thể không chuyển được.',
  failed: 'Không chuyển được file này. Hãy lưu lại thành DXF hoặc DWG 2013 từ phần mềm CAD, hoặc mở bằng ứng dụng khác.',
  failedOld: 'Không chuyển được DWG đời cũ ({v}). Hãy lưu lại thành DWG 2013 hoặc DXF từ phần mềm CAD, hoặc mở bằng ứng dụng khác.',
  tooBig: 'File rất lớn ({mb} MB), có thể chuyển chậm hoặc thiếu bộ nhớ.',
  noWorker: 'Trình duyệt quá cũ. Hãy mở trang bằng Chrome bản mới.',
};

const lang = (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
document.documentElement.lang = lang;
function t(key, vars) {
  let s = (lang === 'en' ? TEXT.en[key] : VI[key]) || VI[key] || TEXT.en[key] || key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}
if (lang === 'en') {
  document.title = TEXT.en.title;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const s = TEXT.en[el.dataset.i18n];
    if (s) el.textContent = s;
  });
}

const VERSIONS = {
  AC1012: 'R13', AC1014: 'R14', AC1015: '2000', AC1018: '2004',
  AC1021: '2007', AC1024: '2010', AC1027: '2013', AC1032: '2018',
};
const OLD = new Set(['AC1012', 'AC1014', 'AC1015']);

const $ = (id) => document.getElementById(id);
const fileInput = $('file');
const pickCard = $('pickCard');
const workCard = $('workCard');
const bar = $('bar');
const statusEl = $('status');
const dl = $('download');
let lastUrl = null;

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}

function reset() {
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastUrl = null;
  fileInput.value = '';
  dl.classList.add('hidden');
  workCard.classList.add('hidden');
  pickCard.classList.remove('hidden');
}
$('again').addEventListener('click', reset);

fileInput.addEventListener('change', async () => {
  const f = fileInput.files && fileInput.files[0];
  if (!f) return;
  pickCard.classList.add('hidden');
  workCard.classList.remove('hidden');
  dl.classList.add('hidden');
  $('fname').textContent = f.name;
  bar.classList.remove('off');

  if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
    bar.classList.add('off');
    setStatus(t('noWorker'), 'err');
    return;
  }

  const bytes = await f.arrayBuffer();
  const head = new TextDecoder('ascii').decode(new Uint8Array(bytes, 0, Math.min(6, bytes.byteLength)));
  if (!/^AC10\d\d$/.test(head)) {
    bar.classList.add('off');
    setStatus(t('notDwg'), 'err');
    return;
  }
  const ver = VERSIONS[head] || head;
  const isOld = OLD.has(head);
  const notes = [];
  if (isOld) notes.push(t('oldVersion', { v: ver }));
  const mb = Math.round(bytes.byteLength / 1048576);
  if (mb >= 60) notes.push(t('tooBig', { mb }));
  setStatus([t('loading')].concat(notes).join(' '));

  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  const finish = () => { worker.terminate(); bar.classList.add('off'); };
  worker.onerror = () => { finish(); setStatus(isOld ? t('failedOld', { v: ver }) : t('failed'), 'err'); };
  worker.onmessage = (e) => {
    const m = e.data;
    if (m.type === 'ready') {
      setStatus([t('converting')].concat(notes).join(' '));
    } else if (m.type === 'done') {
      finish();
      const blob = new Blob([m.dxf], { type: 'application/dxf' });
      lastUrl = URL.createObjectURL(blob);
      dl.href = lastUrl;
      dl.download = f.name.replace(/\.dwg$/i, '') + '.dxf';
      dl.classList.remove('hidden');
      setStatus(t('done'), 'ok');
    } else if (m.type === 'error') {
      finish();
      setStatus(isOld ? t('failedOld', { v: ver }) : t('failed'), 'err');
    }
  };
  worker.postMessage({ bytes }, [bytes]);
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
