# 🏫 Smart School Announcements System
# نظام الإعلانات المدرسية الذكي

A modern digital signage system for schools, designed to display announcements, absences, exams, and flash messages on a Raspberry Pi screen.
نظام عرض رقمي للمدارس لعرض الإعلانات، الغيابات، الامتحانات والرسائل العاجلة على شاشة راسبيري باي.

## ✨ Features
*   **Arabic Interface (RTL)**: Fully localized for Arabic users.
*   **Real-time Display**: Shows time, date, and rotating announcements.
*   **Flash Popups**: Urgent messages overlay (omdha).
*   **Admin Panel**: Easy-to-use interface (`/add.html`) to manage content.
*   **FastAPI Backend**: Robust Python backend using SQLite.

---

## 🚀 Installation Guide for Raspberry Pi

### 1. Prerequisites
Open a terminal on your Raspberry Pi and make sure your system is up to date:
```bash
sudo apt update
sudo apt upgrade
sudo apt install git python3-pip
```

### 2. Clone the Repository
Download the project code from GitHub:
```bash
cd ~
git clone https://github.com/fedihaddad/raspberry.git ras
cd ras
```

### 3. Install Dependencies
Install the required Python libraries (FastAPI and Uvicorn):
```bash
pip3 install fastapi uvicorn
```
*(If you get an error about "externally managed environment", try adding `--break-system-packages` or assume they are already installed if using a specific OS image).*

### 4. Run the Server
Start the application server:
```bash
python3 main.py
```
You should see: `🚀 Starting Smart School Server on http://0.0.0.0:8000`

### 5. Open in Kiosk Mode (Full Screen)
To display the announcements on the screen automatically:
1.  Open Chromium Browser.
2.  Go to: `http://localhost:8000`
3.  Press **F11** for full screen.

**Automatic Kiosk Mode Command:**
You can run this command to launch it directly in Kiosk mode:
```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars --check-for-update-interval=31536000 http://localhost:8000
```

---

## 🛠️ Usage

### Display Screen (Main)
*   URL: `http://localhost:8000`
*   Displays rotating announcements.
*   Shows popup "Flash" messages when active.

### Admin Panel (Management)
*   URL: `http://localhost:8000/login.html`
*   **Default Login**:
    *   User: `admin`
    *   Pass: `admin123`
*   Use this panel to Add, Edit, or Delete announcements.

---

## 🔄 Updating
To get the latest version from GitHub:
```bash
cd ~/ras
git pull
# Restart the server if 'main.py' was updated
```
