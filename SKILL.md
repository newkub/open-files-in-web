---
name: open-files-in-web
description: เปิดไฟล์, directory, หรือ URL ใน web browser ด้วย open-in-open-terminal CLI พร้อม preview สวยงาม
argument-hint: "[path-or-url] | preview [path]"
related:
  - open-web
  - open-in-devin
  - idea-features
  - create-files-in-os-temp
  - visualize-in-web
  - report-in-html
  - create-mermaid-diagram
  - create-report-in-dot-devin
  - report-uxui-sketch
  - draw-svg-image
  - run-build
  - follow-runtime-bun
---

## Goal

เปิดไฟล์ หรือ directory หรือ URL ใน web browser โดยแปลง local path เป็น `file://` URL หรือ render เป็น HTML preview ก่อน

## Scope

- ใช้กับไฟล์, directory, หรือ URL ที่ต้องการ preview ใน browser
- รองรับ `file://` URL, ไฟล์ทั่วไป, markdown, code files, csv, json, html, image, pdf, และ directory
- ใช้ SolidJS + TanStack Solid Router previewer พร้อม TOC, syntax highlight, และ Noto Sans Thai
- สามารถ build เป็น standalone `.exe` ได้
- ไม่ใช่สำหรับเปิด website โดยตรง — ใช้ `/open-web` ถ้าต้องการเปิด URL ธรรมดา

## Execute

### 1. Prepare

> Goal: ตรวจสอบ workspace และ target

1. อ่าน `AGENTS.md` เพื่อทราบ conventions ของ project
2. ระบุ target: ไฟล์, directory, หรือ URL
3. ตรวจสอบว่า target มีอยู่จริงและเข้าถึงได
4. ตรวจสอบ `open-files-in-web/` มี CLI source ครบ

### 2. Build Open-Web CLI

> Goal: build CLI

1. cd เข้า `open-files-in-web/`
2. รัน `bun install` เพื่อติดตั้ง dependencies
3. รัน `bun run build` เพื่อสร้าง `dist/preview` และ `dist/presentation/cli/cli.js`
4. ถ้า build fail → ทำ `/resolve-errors` แล้ว retry สูงสุด 3 ครั้ง
5. cd กลับมา skills directory

### 3. Open URL Or Local Path

> Goal: เปิด URL, local file, หรือ directory ใน browser

1. ถ้า target เป็น URL (`http://`, `https://`, `file://`) → ใช้ได้เลย
2. ถ้า target เป็น absolute path → แปลงเป็น `file://` URL
3. ถ้า target เป็น relative path → resolve เป็น absolute ก่อน แล้วแปลงเป็น `file://`
4. ใช้ `bun dist/presentation/cli/cli.js <url-or-path>` หรือ `dist/open-in-open-terminal.exe <url-or-path>`

### 4. Preview Local Files

> Goal: render ไฟล์เป็น HTML preview ก่อนเปิด

1. ใช้ `bun dist/presentation/cli/cli.js preview <path>` หรือ `dist/open-in-open-terminal.exe preview <path>`
2. CLI จะสร้าง temp preview directory, copy assets, ฝัง metadata, สตาร์ท HTTP server บน `http://localhost:<port>/`, แล้วเปิด browser
3. ใช้ `--no-open` เพื่อสร้าง preview โดยไม่เปิด browser (เหมาะกับการทดสอบ)
4. รองรับ markdown, code, image, pdf, csv, json, html, และ directory
5. สำหรับ directory preview สามารถกดเปิดไฟล์ใน directory ได้ผ่านลิงก์ `/raw/<filename>`

### 5. Build Standalone .exe

> Goal: สร้าง executable สำหรับใช้โดยไม่ต้องมี bun

1. รัน `bun build --compile src/presentation/cli/cli.ts --outfile dist/open-in-open-terminal.exe`
2. ใช้ `.exe` เปิดไฟล์หรือ preview ได้ทันที

### 6. Verify And Report

> Goal: ยืนยันว่าเปิดสำเร็จและไม่มี error

1. ตรวจสอบ process exit code
2. ถ้ามี error → ทำ `/resolve-errors`
3. ทำ `/report-before-after` สรุป target และ URL ที่เปิด
4. ทำ `/suggest-next-action` เพื่อแนะนำขั้นตอนถัดไป

## Rules

### 1. Build First

- ต้อง build ก่อนใช้งานครั้งแรกหรือหลัง pull/clone
- `bun install` ต้องผ่านก่อน `bun run build`

### 2. URL Safety

- ตรวจสอบว่า path มีอยู่จริงก่อนแปลงเป็น `file://`
- ไม่เปิดไฟล์จาก system paths ที่เสี่ยงโดยไม่มี user confirmation
- ใช้ `file://` สำหรับ local files ไม่ส่ง path ให้ browser โดยตรงถ้าไม่จำเป็น

### 3. Fallback

- ถ้า CLI ยังไม่ build หรือ fail → ใช้ `open`, `start`, `xdg-open` เป็น fallback
- ถ้า file ไม่สามารถ render ได้ → เปิดดิบด้วย `file://`

### 4. Preview Output

- preview สร้างไฟล์ชั่วคราวใน `os.tmpdir()`
- สำหรับ compiled `.exe` จะหา preview assets จาก `dist/preview` ข้าง ๆ executable
- `preview` สตาร์ท HTTP server บน `http://localhost:<port>/` แล้วเปิด URL นั้น
- `--no-open` จะสร้าง preview แต่ไม่เปิด browser

## Expected Outcome

- Browser เปิด target ตามที่ต้องการ
- CLI และ `.exe` ทำงานได้
- ไม่มี broken references หลังการ build
- มีรายงาน target และ URL ที่ใช้เปิด
- มี next action ชัดเจนหลังใช้งาน
