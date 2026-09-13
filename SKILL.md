---
name: open-files-in-web
description: เปิดไฟล์, directory หรือ URL ใน web browser ด้วย CLI พร้อม preview
argument-hint: "[path-or-url] | preview [path]"
related:
  - open
  - open-in-devin
  - idea
  - create-files-in-os-temp
  - visualize-in-web
  - report
  - create-mermaid-diagram
  - create-report-in-dot-devin
  - report-uxui-sketch
  - draw-svg-image
  - run-build
---

## Goal

เปิดไฟล์ หรือ directory หรือ URL ใน web browser โดย local path จะถูกแปลงเป็น self-contained HTML preview แล้วเปิดด้วย `file://` โดยไม่ต้องสตาร์ท server เอง

## Scope

- ใช้กับไฟล์, directory, หรือ URL ที่ต้องการ preview ใน browser
- รองรับ `file://` URL, ไฟล์ทั่วไป, markdown, code files, csv, json, html, image, pdf, และ directory
- ใช้ SolidJS + TanStack Solid Router previewer พร้อม TOC, syntax highlight, และ Noto Sans Thai
- สามารถ build เป็น standalone `.exe` ได้
- มี global commands: `open-in-open-terminal`, `ofw`, `open-files` ใน `~/.bun/bin`
- ไม่ใช่สำหรับเปิด website โดยตรง — ใช้ `/open web` ถ้าต้องการเปิด URL ธรรมดา
- ดูเพิ่มเติมสำหรับ related skills: `/open-in-devin`, `/idea features`, `/create-files-in-os-temp`, `/visualize-in-web`, `/report html`, `/create-mermaid-diagram`, `/create-report-in-dot-devin`, `/report-uxui-sketch`, `/draw-svg-image`, `/run-build`

## Execute

### 1. Prepare

> Goal: ตรวจสอบ workspace และ target

1. อ่าน `AGENTS.md` เพื่อทราบ conventions ของ project
2. ระบุ target: ไฟล์, directory, หรือ URL
3. ตรวจสอบว่า target มีอยู่จริงและเข้าถึงได้
4. ตรวจสอบ `open-files-in-web/` มี CLI source ครบ

### 2. Build Open-Web CLI

> Goal: build CLI

1. cd เข้า `open-files-in-web/`
2. รัน `bun install` เพื่อติดตั้ง dependencies
3. รัน `bun run build` (=`build:preview` + `build:cli` + `build:compile`) เพื่อสร้าง `dist/preview`, `dist/presentation/cli/cli.js`, `dist/open-in-open-terminal.exe` และ `dist/ofw.exe`
4. ถ้า build fail → ทำ `/resolve-errors` แล้ว retry สูงสุด 3 ครั้ง
5. ใช้ `bun run verify` เพื่อรัน typecheck + test + build รวมครั้งเดียว (ตาม `package.json` scripts, verified 2026-09-12)
6. cd กลับมา skills directory

### 3. Open URL Or Local Path

> Goal: เปิด URL, local file, หรือ directory ใน browser

1. ถ้า target เป็น URL (`http://`, `https://`, `file://`) → เปิดด้วย browser โดยตรง
2. ถ้า target เป็น absolute/relative ไฟล์หรือ directory ที่มีอยู่จริง → สร้าง static HTML preview แล้วเปิดด้วย `file://`
3. ใช้คำสั่งใดคำสั่งหนึ่ง:
   - `bun dist/presentation/cli/cli.js <path-or-url>`
   - `dist/open-in-open-terminal.exe <path-or-url>`
   - `dist/ofw.exe <path-or-url>`
   - `ofw <path-or-url>` (global alias)
   - `open-files <path-or-url>` (global alias)
4. options จาก CLI (`commander` ^15.0.0, verified 2026-09-12): `-b, --browser <browser>` (`chrome`/`firefox`/`safari`/`edge`/`default`), `-s, --serve`, `--no-open`

### 4. Preview Local Files (Static-First)

> Goal: render ไฟล์เป็น HTML preview ก่อนเปิด

1. ใช้ bare argument หรือ explicit `preview` subcommand:
   - `ofw <path>`
   - `ofw preview <path>`
2. Default จะสร้าง single self-contained HTML file ใน temp directory, inline JS/CSS, embed image/pdf เป็น base64 data URL, แล้วเปิดด้วย `file://`
3. ไม่ต้องสตาร์ท HTTP server สำหรับการใช้งานทั่วไป
4. ใช้ `--serve` เพื่อเปิด HTTP server mode (สำหรับไฟล์ใหญ่หรือต้องการ raw access)
5. ใช้ `--no-open` เพื่อสร้าง preview โดยไม่เปิด browser
6. รองรับ markdown, code, image, pdf, csv, json, html, และ directory
7. สำหรับ directory preview สามารถกดเปิดไฟล์/โฟลเดอร์ย่อยได้ผ่าน hash-based navigation (`#/child/path`) ใน static mode

### 5. Build Standalone .exe

> Goal: สร้าง executable สำหรับใช้โดยไม่ต้องมี bun

1. `bun run build` จะสร้าง `dist/open-in-open-terminal.exe` และ `dist/ofw.exe` อัตโนมัติ
2. ใช้ `.exe` เปิดไฟล์หรือ preview ได้ทันที
3. compiled `.exe` จะหา preview assets จาก `dist/preview` ข้าง ๆ executable

### 6. Global Shims

> Goal: ให้เรียก CLI จากทุกที่ได้

1. `open-in-open-terminal.cmd`, `ofw.cmd`, `open-files.cmd` ถูกสร้างใน `~/.bun/bin/`
2. shims ชี้ไปยัง `dist/open-in-open-terminal.exe` หรือ `dist/ofw.exe` ใน `open-files-in-web/`
3. ตรวจสอบว่า `~/.bun/bin` อยู่ใน `PATH`

### 7. Verify And Report

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
- default คือ static single-file HTML (ไม่มี HTTP server)
- image/pdf ใน static mode จะถูก embed เป็น base64 data URL
- `--serve` จะสตาร์ท HTTP server บน `http://localhost:<port>/` แล้วเปิด URL นั้น
- `--no-open` จะสร้าง preview แต่ไม่เปิด browser

## Expected Outcome

- Browser เปิด target ตามที่ต้องการ
- CLI และ `.exe` ทำงานได้
- ไม่มี broken references หลังการ build
- มีรายงาน target และ URL ที่ใช้เปิด
- มี next action ชัดเจนหลังใช้งาน

