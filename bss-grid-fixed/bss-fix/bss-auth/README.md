# 🐝 Bee Swarm Farm Tracker Dashboard

ระบบ dashboard สำหรับติดตาม progress การฟาร์ม Bee Swarm Simulator

## การติดตั้ง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## การตั้งค่า

แก้ไข `.env.local`:
```
RSKD_API_KEY=your-secret-key
RSKD_ADMIN_USER=admin
RSKD_ADMIN_PASSWORD=your-password
```

## Lua Script

แก้ไข `bss_tracker.lua`:
```lua
local API_URL = "http://YOUR_SERVER:3000/api/update"
local API_KEY = "your-secret-key"  -- ต้องตรงกับ RSKD_API_KEY
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/update | รับข้อมูลจาก Lua script |
| GET | /api/stats | ดึงข้อมูลทั้งหมด |
| GET | /api/stream | SSE realtime |
| GET/POST | /api/config | ตั้งค่า |
| GET | /api/summary | สรุปยอดรวม |

## Deploy บน Railway

1. Push โค้ดขึ้น GitHub
2. ไป railway.app → New Project → Deploy from GitHub
3. เพิ่ม Environment Variables จาก `.env.local`
4. แก้ `API_URL` ใน `bss_tracker.lua` เป็น URL ของ Railway
