# dwg2dxf-web

Trang web chuyển bản vẽ DWG sang DXF, chạy hoàn toàn trong trình duyệt bằng LibreDWG (WebAssembly).
File không được tải lên máy chủ nào. Dùng cho app Android "Quản lý công trình" (repo CongTrinhSnap):
app mở trang này bằng trình duyệt, người dùng chuyển và tải DXF về, rồi quay lại app chọn file DXF.

Trang: https://windfly2909.github.io/dwg2dxf-web/

## Cấu trúc

| File | Vai trò |
|---|---|
| `index.html`, `style.css`, `app.js` | Giao diện (tiếng Việt, tự chuyển tiếng Anh theo ngôn ngữ máy) |
| `worker.js` | Chạy LibreDWG trong Web Worker; mỗi lần chuyển dùng một worker mới |
| `sw.js` | Lưu trang vào bộ nhớ đệm để lần sau chạy khi không có mạng (đổi `VERSION` khi cập nhật) |
| `vendor/` | File WebAssembly của `@mlightcad/libredwg-web` 0.8.6, không sửa |
| `test/` | Script thử chuyển đổi bằng Node |

Không cần bước build. Đăng lên GitHub Pages từ nhánh `main`, thư mục gốc.

## Hỗ trợ

- DWG 2004, 2007, 2010, 2013, 2018: đã thử 60 file trong `test/test-data` của LibreDWG và 5 file `example_*`, chuyển được hết; 59/60 DXF đọc lại sạch bằng ezdxf (1 file có đối tượng Surface 3D lỗi ma trận).
- DWG R14, 2000: bản WebAssembly hiện tại bị lỗi khi ghi DXF cho hai phiên bản này; trang báo lỗi và hướng dẫn lưu lại ở bản mới hơn.
- Kết quả là DXF dạng văn bản (ASCII), cùng phiên bản với DWG gốc.

## Cập nhật LibreDWG

```
npm install @mlightcad/libredwg-web@<phiên bản>
cp node_modules/@mlightcad/libredwg-web/wasm/libredwg-web.{js,wasm} vendor/
node test/convert.mjs <thư mục DWG mẫu>
```

Rồi cập nhật phiên bản và SHA-256 trong `THIRD_PARTY.md`, đổi `VERSION` trong `sw.js`.

## Giấy phép

GNU GPL v3 (xem `LICENSE`), vì trang dùng LibreDWG (GPLv3). App Android chỉ mở trang bằng trình duyệt,
không nhúng mã của trang.
