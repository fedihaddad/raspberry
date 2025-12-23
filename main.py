from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
import sqlite3
import json
import os
from datetime import datetime

# ========================================
# CONFIGURATION
# ========================================

app = FastAPI(title="Smart School Announcements")

# Enable CORS (allow access from anywhere)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join("data", "announcements.db")

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

# ========================================
# DATABASE UTILS
# ========================================

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_type ON announcements(type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON announcements(timestamp DESC)")
    conn.commit()
    conn.close()

# Initialize DB on start
init_db()

# ========================================
# MODELS
# ========================================

class AnnouncementModel(BaseModel):
    type: str
    id: Optional[int] = None
    timestamp: Optional[str] = None
    # We accept any other fields dynamically
    class Config:
        extra = "allow"

# ========================================
# API ROUTES
# ========================================

@app.get("/api/announcements")
async def get_announcements():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM announcements ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            # Parse the JSON data stored in the 'data' column
            item = json.loads(row["data"])
            # Ensure ID and timestamp from DB are authoritative
            item["id"] = row["id"]
            item["timestamp"] = row["timestamp"]
            results.append(item)
        
        conn.close()
        return results
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return []

@app.post("/api/announcements")
async def create_announcement(announcement: Dict[Any, Any] = Body(...)):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        atype = announcement.get("type", "other")
        timestamp = announcement.get("timestamp", datetime.now().isoformat())
        
        # Store the whole object as JSON
        data_json = json.dumps(announcement)
        
        cursor.execute(
            "INSERT INTO announcements (type, data, timestamp) VALUES (?, ?, ?)",
            (atype, data_json, timestamp)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        
        print(f"✅ Created announcement #{new_id} ({atype})")
        return {"success": True, "id": new_id, "message": "Announcement created"}
    except Exception as e:
        print(f"❌ CREATE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/announcements")
async def update_announcement(announcement: Dict[Any, Any] = Body(...)):
    if "id" not in announcement:
        raise HTTPException(status_code=400, detail="Missing ID")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        aid = announcement["id"]
        atype = announcement.get("type", "other")
        timestamp = announcement.get("timestamp", datetime.now().isoformat())
        data_json = json.dumps(announcement)
        
        cursor.execute(
            "UPDATE announcements SET type = ?, data = ?, timestamp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (atype, data_json, timestamp, aid)
        )
        conn.commit()
        conn.close()
        
        print(f"✅ Updated announcement #{aid}")
        return {"success": True, "message": "Announcement updated"}
    except Exception as e:
        print(f"❌ UPDATE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/announcements")
async def delete_announcement(id: int):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM announcements WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        
        print(f"🗑️ Deleted announcement #{id}")
        return {"success": True, "message": "Announcement deleted"}
    except Exception as e:
        print(f"❌ DELETE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# STATIC FILES (FRONTEND)
# ========================================

# Serve static files (HTML, CSS, JS) from current directory
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Run on all interfaces (0.0.0.0) port 8000
    print("🚀 Starting Smart School Server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
