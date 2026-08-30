---
name: open-files-in-web
description: เปิดไฟล์และ directory ใน web browser โดยใช้ open-web CLI
argument-hint: "[path-or-url]"
related:
  - open-web
  - open-in-devin
  - visualize-in-web
  - report-in-html
  - run-build
  - follow-runtime-bun
  - convert-to-git-submodules
---

## Goal

เปิดไฟล์ หรือ directory ใน web browser โดยแปลงเป็น `file://` URL หรือ render เป็น HTML ก่อน แล้วใช้ `open-web` CLI

## Scope

ใช้กับไฟล์ หรือ directory ที่ต้องการ preview ใน browser
รองรับ `file://` URL, ไฟล์ทั่วไป, markdown, และ code files
ต้อง build `open-web` CLI ก่อนใช้งานครั้งแรก
ไม่ใช่สำหรับเปิด website โดยตรง — ใช้ `/open-web` ถ้าต้องการเปิด URL ธรรมดา

## Execute

### 1. Prepare

> Goal: ตรวจสอบ workspace และ target

1. อ่าน `AGENTS.md` เพื่อทราบ conventions ของ project
2. ระบุ target: ไฟล์, directory, หรือ URL
3. ตรวจสอบว่า target มีอยู่จริงและเข้าถึงได
4. ตรวจสอบ `open-files-in-web/` มี CLI source ครบ

### 2. Build Open-Web CLI

> Goal: build CLI จาก submodule

1. cd เข้า `open-files-in-web/`
2. รัน `bun install` เพื่อติดตั้ง dependencies
3. รัน `bun run build` เพื่อสร้าง `dist/`
4. ถ้า build fail → ทำ `/resolve-errors` แล้ว retry สูงสุด 3 ครั้ง
5. cd กลับมา skills directory

### 3. Resolve Target

> Goal: แปลง target เป็น URL ที่ browser เปิดได้

1. ถ้า target เป็น URL (`http://`, `https://`, `file://`) → ใช้ได้เลย
2. ถ้า target เป็น absolute path → แปลงเป็น `file://` URL
3. ถ้า target เป็น relative path → resolve เป็น absolute ก่อน แล้วแปลงเป็น `file://`
4. ถ้า target เป็น markdown/code และต้องการ syntax highlight → ทำ `/visualize-in-web` หรือ `/report-in-html` ก่อนเพื่อ render เป็น HTML
5. ถ้า target เป็น directory → ใช้ `file://` URL โดยตรง หรือสร้าง directory index HTML

### 4. Open In Browser

> Goal: เปิด URL ใน browser

1. ใช้ `bun open-files-in-web/dist/presentation/cli/cli.js <url>` หรือ `bunx open-in-open-terminal <url>`
2. ถ้า CLI ไม่ทำงาน → ใช้ `open <url>` หรือ `start <url>` เป็น fallback
3. ตรวจสอบว่า browser เปิด URL ถูกต้อง

### 5. Verify And Report

> Goal: ยืนยันว่าเปิดสำเร็จและไม่มี error

1. ตรวจสอบ process exit code
2. ถ้ามี error → ทำ `/resolve-errors`
3. ทำ `/report-before-after` สรุป target และ URL ที่เปิด
4. ทำ `/suggest-next-action` เพื่อแนะนำขั้นตอนถัดไป

## Rules

### 1. Build First

- ต้อง build ก่อนใช้งานครั้งแรกหรือหลัง pull/clone
- `bun install` ต้องผ่านก่อน `bun run build`
- ถ้า submodule ยังไม่ initial → รัน `git submodule update --init --recursive`

### 2. URL Safety

- ตรวจสอบว่า path มีอยู่จริงก่อนแปลงเป็น `file://`
- ไม่เปิดไฟล์จาก system paths ที่เสี่ยงโดยไม่มี user confirmation
- ใช้ `file://` สำหรับ local files ไม่ส่ง path ให้ browser โดยตรงถ้าไม่จำเป็น

### 3. Fallback

- ถ้า CLI ยังไม่ build หรือ fail → ใช้ `open`, `start`, `xdg-open` เป็น fallback
- ถ้า file ไม่สามารถ render ได้ → เปิดดิบด้วย `file://`

### 4. Submodule

- `open-files-in-web` เป็น git submodule ของ `open-web` project
- ถ้า update submodule → รัน `git submodule update --remote open-files-in-web` แล้ว commit
- ไม่แก้ไข code ใน `open-files-in-web/` ผ่าน skill นี้โดยตรง ให้ใช้ `/deep-refactor` หรือ `/refactor` ถ้าต้องการ

## Expected Outcome

- Browser เปิด target ตามที่ต้องการ
- `open-web` CLI ทำงานได้
- ไม่มี broken references หลังการ build
- มีรายงาน target และ URL ที่ใช้เปิด
- มี next action ชัดเจนหลังใช้งาน
