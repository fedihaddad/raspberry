# 🌐 Cloudflare Tunnel Setup Guide
## Access Your Smart School Display from Anywhere

---

## 📋 Prerequisites

1. **A domain name** (You can buy one for ~$10/year from Namecheap, GoDaddy, etc.)
   - Or use a free subdomain from FreeDNS if you don't want to buy one
2. **Cloudflare account** (Free) - Sign up at https://cloudflare.com
3. **Your Raspberry Pi connected to internet**

---

## 🚀 Step 1: Add Your Domain to Cloudflare

1. Go to https://dash.cloudflare.com
2. Click **"Add a Site"**
3. Enter your domain (e.g., `myschool.com`)
4. Choose **Free Plan**
5. Update your domain's nameservers at your registrar to Cloudflare's nameservers
   - They'll show you exactly which nameservers to use
   - This usually takes 5-60 minutes to activate

---

## 🔧 Step 2: Install Cloudflared on Raspberry Pi

**SSH into your Raspberry Pi** and run:

```bash
# Download cloudflared for ARM64
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64

# Make it executable
chmod +x cloudflared-linux-arm64

# Move to system path
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared

# Verify installation
cloudflared --version
```

---

## 🔑 Step 3: Authenticate with Cloudflare

```bash
# This will open a browser login
cloudflared tunnel login
```

**Important:** 
- If you're on SSH, it will show a URL
- Copy that URL and open it on your computer/phone
- Login to Cloudflare and authorize
- The cert file will be saved automatically on the Pi

---

## 🛠️ Step 4: Create Your Tunnel

```bash
# Create a tunnel named "smart-school"
cloudflared tunnel create smart-school

# It will show a tunnel ID like: abc123-def456-ghi789
# Write down this ID!
```

---

## 🌍 Step 5: Create DNS Record

Replace `YOUR_TUNNEL_ID` and `yourdomain.com`:

```bash
# Create DNS record pointing to your tunnel
cloudflared tunnel route dns smart-school school.yourdomain.com
```

This creates a subdomain `school.yourdomain.com` pointing to your Pi.

---

## ⚙️ Step 6: Create Configuration File

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared

# Create config file
sudo nano /etc/cloudflared/config.yml
```

**Paste this** (replace `YOUR_TUNNEL_ID` and `yourdomain.com`):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/pi/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: school.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## 🔄 Step 7: Create Auto-Start Service

```bash
# Create systemd service
sudo nano /etc/systemd/system/cloudflared.service
```

**Paste this:**

```ini
[Unit]
Description=Cloudflare Tunnel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
ExecStart=/usr/local/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## ✅ Step 8: Enable and Start the Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Start the tunnel now
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared
```

You should see **"active (running)"** in green! ✅

---

## 🎉 Step 9: Test Your Connection

1. On your **phone or any device**, go to: `https://school.yourdomain.com`
2. You should see your Smart School Display!
3. Try from **4G/5G** (not WiFi) to confirm it works from anywhere

---

## 📱 Step 10: Make Your Python Server Auto-Start Too

```bash
# Create service for your Python app
sudo nano /etc/systemd/system/smartschool.service
```

**Paste:**

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

**Enable it:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable smartschool
sudo systemctl start smartschool
sudo systemctl status smartschool
```

---

## 🔍 Troubleshooting

### Check tunnel status:
```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f
```

### Check Python server:
```bash
sudo systemctl status smartschool
sudo journalctl -u smartschool -f
```

### Restart everything:
```bash
sudo systemctl restart cloudflared
sudo systemctl restart smartschool
```

### Test tunnel manually:
```bash
cloudflared tunnel --config /etc/cloudflared/config.yml run
```

---

## 🎯 Summary

After this setup:

✅ **URL:** `https://school.yourdomain.com` (permanent, never changes)  
✅ **Auto-starts** when Raspberry Pi boots  
✅ **Access from anywhere** - home, 4G, school WiFi, anywhere!  
✅ **Automatic HTTPS** (secure)  
✅ **Free forever**  

---

## 📝 Quick Commands Reference

```bash
# Check if services are running
sudo systemctl status cloudflared
sudo systemctl status smartschool

# Restart services
sudo systemctl restart cloudflared
sudo systemctl restart smartschool

# View logs
sudo journalctl -u cloudflared -f
sudo journalctl -u smartschool -f

# Stop services
sudo systemctl stop cloudflared
sudo systemctl stop smartschool
```

---

## 🆘 Need Help?

1. **Tunnel not connecting?** Check DNS propagation at https://dnschecker.org
2. **404 error?** Make sure Python server is running on port 8000
3. **Certificate issues?** Rerun `cloudflared tunnel login`

---

**🎊 Congratulations! Your school display is now accessible from anywhere in the world!**
