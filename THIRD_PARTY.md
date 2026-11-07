# Thư viện bên thứ ba / Third-party software

## LibreDWG (bản WebAssembly `@mlightcad/libredwg-web`)

- Phiên bản: `@mlightcad/libredwg-web` 0.8.6 (npm)
- File trong trang: `vendor/libredwg-web.js`, `vendor/libredwg-web.wasm` (lấy nguyên từ thư mục `wasm/` của gói npm, không sửa)
  - SHA-256 `vendor/libredwg-web.js`: `e263ab8c8a00de0cc38fd259db5b0cdc4d7ef0f4b123dbe9a41de2da6f3311a4`
  - SHA-256 `vendor/libredwg-web.wasm`: `8f8dbfe1ba3a0ae9ceb8856ed2090c0f44decd9d7febde68016df8c1fca50f9b`
- Giấy phép: GNU General Public License v3.0 (xem `LICENSE`)
- Mã nguồn bản WebAssembly: https://github.com/mlightcad/libredwg-web
- Mã nguồn LibreDWG gốc: https://www.gnu.org/software/libredwg/ và https://github.com/LibreDWG/libredwg
- Bản quyền LibreDWG: Free Software Foundation, Inc.

Cách dựng lại file `.wasm` từ mã nguồn: xem mục "Build WebAssembly" trong README của
https://github.com/mlightcad/libredwg-web, hoặc cài gói npm cùng phiên bản:

```
npm install @mlightcad/libredwg-web@0.8.6
```
