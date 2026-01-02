# 🖥️ Raspberry Pi Auto-Start Kiosk Mode Setup
## Automatically Start Server + Open Browser on Boot

---

## 🎯 What This Does:

When Raspberry Pi boots up, it will automatically:
1. ✅ Start Python server (`main.py`)
2. ✅ Open Chromium browser in full screen
3. ✅ Display `http://localhost:8000/index.html`
4. ✅ Hide mouse cursor
5. ✅ Disable screen sleep

---

## 📋 Step 1: Auto-Start Python Server

### Create systemd service:

```bash
sudo nano /etc/systemd/system/smartschool.service
```

### Paste this (adjust path if needed):

```ini
[Unit]
Description=Smart School Display Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart_screen/raspberry
ExecStart=/usr/bin/python3 /home/pi/smart_screen/raspberry/main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable smartschool
sudo systemctl start smartschool

# Check if it's running
sudo systemctl status smartschool
```

---

## 🖱️ Step 2: Enable Auto-Login (Required for Kiosk)

```bash
sudo raspi-config
```

Navigate to:
- **1. System Options** → **S5. Boot / Auto Login** → **B4. Desktop Autologin**

Or manually:

```bash
sudo nano /etc/lightdm/lightdm.conf
```

Find and uncomment/edit:
```ini
autologin-user=pi
```

---

## 🌐 Step 3: Install Required Packages

```bash
# Install Chromium if not already installed
sudo apt update
sudo apt install -y chromium-browser unclutter xdotool

# unclutter = hides mouse cursor
# xdotool = keyboard/mouse automation
```

---

## 🚀 Step 4: Create Kiosk Start Script

```bash
nano /home/pi/kiosk.sh
```

### Paste this script:

```bash
#!/bin/bash

# Wait for network and server to be ready
sleep 10

# Disable screen blanking and power saving
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor
unclutter -idle 0.5 -root &

# Start Chromium in kiosk mode
/usr/bin/chromium-browser --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  http://localhost:8000/index.html
```

### Make it executable:

```bash
chmod +x /home/pi/kiosk.sh
```

---

## ⚙️ Step 5: Auto-Start Kiosk on Desktop Load

### Edit autostart file:

```bash
mkdir -p /home/pi/.config/lxsession/LXDE-pi
nano /home/pi/.config/lxsession/LXDE-pi/autostart
```

### Add these lines:

```bash
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash

# Disable screen sleep
@xset s off
@xset -dpms
@xset s noblank

# Start kiosk
@/home/pi/kiosk.sh
```

---

## 🔄 Step 6: Reboot and Test

```bash
sudo reboot
```

**What should happen:**
1. Raspberry Pi boots
2. Auto-login to desktop
3. Python server starts in background
4. Chromium opens in full screen after 10 seconds
5. Shows your announcement display

---

## 🛠️ Troubleshooting

### Server not starting?

```bash
# Check server status
sudo systemctl status smartschool

# View logs
sudo journalctl -u smartschool -f
```

### Browser not opening?

```bash
# Test script manually (from desktop)
bash /home/pi/kiosk.sh

# Check if Chromium is installed
which chromium-browser
```

### Wrong URL or path?

Edit the kiosk script:
```bash
nano /home/pi/kiosk.sh
# Change the URL at the bottom
```

---

## 🎨 Advanced Options

### Option 1: Use Your Raspberry Pi IP Instead

If you want to access from another device on network:

```bash
# Find your Pi's IP
hostname -I
# Example: 192.168.1.100

# Edit kiosk.sh and change URL to:
http://192.168.1.100:8000/index.html
```

### Option 2: Refresh Page Every Hour

Add to `kiosk.sh` before the chromium command:

```bash
# Auto-refresh every hour using cron
(crontab -l 2>/dev/null; echo "0 * * * * DISPLAY=:0 xdotool key F5") | crontab -
```

### Option 3: Touch Screen Support

If using touch screen:

```bash
sudo apt install -y matchbox-keyboard
```

Add to autostart:
```bash
@matchbox-keyboard
```

---

## 🔐 Security Tips

### Exit Kiosk Mode (Emergency)

Press: **Alt + F4** or **Ctrl + W**

### Add Exit Button (Optional)

Create a script:
```bash
nano /home/pi/exit-kiosk.sh
```

Paste:
```bash
#!/bin/bash
pkill chromium
```

Make executable:
```bash
chmod +x /home/pi/exit-kiosk.sh
```

Run when needed:
```bash
bash /home/pi/exit-kiosk.sh
```

---

## 📊 Status Check Commands

```bash
# Check if server is running
sudo systemctl status smartschool

# Restart server
sudo systemctl restart smartschool

# Stop kiosk mode
pkill chromium

# Start kiosk mode manually
bash /home/pi/kiosk.sh

# View server logs
sudo journalctl -u smartschool -n 50
```

---

## 🔄 Update Your Display Content

Just update files and restart:

```bash
cd /home/pi/smart_screen/raspberry
git pull
sudo systemctl restart smartschool
# Browser will auto-reload on server restart
```

---

## ⚡ Quick Setup (All Commands at Once)

Copy and paste this entire block:

```bash
# 1. Create service
sudo tee /etc/systemd/system/smartschool.service > /dev/null <<EOF
[Unit]
Description=Smart School Display Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart_screen/raspberry
ExecStart=/usr/bin/python3 /home/pi/smart_screen/raspberry/main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 2. Enable service
sudo systemctl daemon-reload
sudo systemctl enable smartschool
sudo systemctl start smartschool

# 3. Install packages
sudo apt update
sudo apt install -y chromium-browser unclutter xdotool

# 4. Create kiosk script
cat > /home/pi/kiosk.sh <<'EOF'
#!/bin/bash
sleep 10
xset s off
xset -dpms
xset s noblank
unclutter -idle 0.5 -root &
/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk --disable-session-crashed-bubble --disable-features=TranslateUI --check-for-update-interval=31536000 http://localhost:8000/index.html
EOF

chmod +x /home/pi/kiosk.sh

# 5. Create autostart
mkdir -p /home/pi/.config/lxsession/LXDE-pi
cat > /home/pi/.config/lxsession/LXDE-pi/autostart <<'EOF'
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@xset s off
@xset -dpms
@xset s noblank
@/home/pi/kiosk.sh
EOF

echo "✅ Setup complete! Reboot now:"
echo "sudo reboot"
```

---

## 🎉 Done!

Your Raspberry Pi is now a **dedicated announcement display kiosk**!

**On every boot:**
- ✅ Server starts automatically
- ✅ Browser opens in full screen
- ✅ Display ready in ~30 seconds

**To stop/exit:**
- Press **Alt+F4** to close browser
- Run `sudo systemctl stop smartschool` to stop server
