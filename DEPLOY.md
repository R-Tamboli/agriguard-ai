# AgriGuard AI ko public kaise karein

## Demo link banane ke liye

Apne Windows PC par PowerShell mein chalayein.

```powershell
cd "C:\Users\rehan\Downloads\agriguard-ai"
npm.cmd run build
Set-Content -Path .\dist\_redirects -Value '/* /index.html 200' -Encoding ascii
```

Apne Netlify account mein sign in karke **dist** folder ko upload box mein drag karein. Jo HTTPS link milega, use phone par khol kar **हिन्दी** aur **English** dono check karein. Redirect rule se Crop Doctor jaise page ka link seedha kholne ya refresh karne par bhi page khulega. Is demo mein homepage, dashboard aur language switch chalenge. AI se jawab paane ke liye neeche wala setup karein. [Netlify Drop](https://app.netlify.com/drop)

## Crop Doctor aur Farm Chat ke saath poori website

Is tareeke mein ek Ubuntu server par website, Node API, Python classifier aur Ollama saath chalte hain. Deploy hone ke baad aap apna PC band kar sakte hain. Neeche ke commands ek **naye Ubuntu 24.04 VPS** ke liye hain.

### 1. Server aur website ka naam taiyar karein

- Apne hosting account mein Ubuntu 24.04 VPS banayein. Chhote CPU demo ke liye **4 vCPU, 16 GB RAM aur 40 GB disk** ek shuruaati configuration hai. Ek saath kai AI requests ki gati hardware par depend karegi. Plan lene se pehle monthly cost dekhein.
- Apne domain ki DNS settings mein ek **A record** banayein. Jaise, `farm` ko server ke public IPv4 address par point karne se `farm.aapkadomain.in` milega. Neeche `farm.example.com` ki jagah apna asli naam daalein.
- Provider ke firewall mein website ke liye **80 aur 443** kholein, aur apne IP se SSH ke liye **22**. API (3000) aur Ollama (11434) ko private rakhein.

### 2. Apne Windows PC se files bhejein

Is setup mein GitHub par push karna zaroori nahi hai. Ye commands current website, backend aur trained model bhejte hain. `ubuntu@YOUR_SERVER_IP` ko hosting provider ke diye hue SSH username aur IP se badlein. Agar provider ne SSH key di hai, to `scp` aur `ssh` mein `-i "C:\path\to\your-key"` lagayein.

Public version ke liye Settings mein photo ki jaankari bhi sahi karein. Abhi woh kehti hai ki photo device par rehti hai. Hosted version mein sahi line hogi **“फोटो की जाँच एग्रीगार्ड के सर्वर पर होती है।”** aur **“AgriGuard processes your photo on its server.”** Ye text `src/pages/Settings.jsx` mein hai.

```powershell
cd "C:\Users\rehan\Downloads\agriguard-ai"
$env:VITE_API_URL = ""
npm.cmd run build
$release = Join-Path $env:TEMP "agriguard-release.tgz"
tar.exe -czf $release dist server.mjs package.json package-lock.json predict_plantvillage.py requirements-ml.txt models/plantvillage_mobilenet_v3_small.pt
scp.exe $release ubuntu@YOUR_SERVER_IP:~/agriguard-release.tgz
ssh.exe ubuntu@YOUR_SERVER_IP
```

### 3. Ubuntu server par app aur model install karein

Ab ye commands **SSH wali Ubuntu terminal** mein chalayein. Shuru mein apna asli domain likhein. Dataset ki saari photos training ke liye hoti hain. Photo classify karne ke liye trained model archive mein pehle se hai.

```bash
DOMAIN=farm.example.com
sudo apt-get update
sudo apt-get install -y curl ca-certificates python3-venv libgomp1 zstd caddy
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/agriguard-node-setup.sh
sudo bash /tmp/agriguard-node-setup.sh
sudo apt-get install -y nodejs

sudo mkdir -p /opt/agriguard
sudo chown "$USER":"$(id -gn)" /opt/agriguard
tar -xzf ~/agriguard-release.tgz -C /opt/agriguard
cd /opt/agriguard
npm ci --omit=dev
python3 -m venv .venv
.venv/bin/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r requirements-ml.txt

curl -fsSL https://ollama.com/install.sh -o /tmp/agriguard-ollama-setup.sh
sh /tmp/agriguard-ollama-setup.sh
sudo systemctl enable --now ollama
ollama pull qwen2.5vl:3b
```

### 4. Backend ko restart ke baad bhi chalu rakhein

Ussi SSH terminal mein poora block paste karein. Ye service Python classifier ko Linux ka sahi path deti hai.

```bash
sudo tee /etc/systemd/system/agriguard.service >/dev/null <<EOF
[Unit]
Description=AgriGuard API
After=network.target ollama.service

[Service]
DynamicUser=yes
WorkingDirectory=/opt/agriguard
ExecStart=/usr/bin/node /opt/agriguard/server.mjs
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=FRONTEND_ORIGIN=https://$DOMAIN
Environment=PYTHON_EXECUTABLE=/opt/agriguard/.venv/bin/python
Environment=PLANTVILLAGE_DIR=/opt/agriguard/data/color
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now agriguard
curl -fsS http://127.0.0.1:3000/api/health
```

Output mein `"ok":true` dikhna chahiye. Crop Doctor mein **54,305 images aur 38 categories** wala dataset count bhi dikhana hai to `mkdir -p /opt/agriguard/data` chalayein. Phir apne PC ki **alag PowerShell window** se ye folder copy karein. Is bade upload ki zaroorat sirf dataset ki ginti aur category list ke liye hai.

```powershell
scp.exe -r "C:\Users\rehan\Downloads\PlantVillage-Dataset-master\raw\color" ubuntu@YOUR_SERVER_IP:/opt/agriguard/data/
```

### 5. Domain par HTTPS chalu karein

SSH terminal par neeche ka block chalayein. Ye naye VPS ki default Caddy configuration set karta hai. `/api` requests backend ko milengi, aur baaki links website ko. Caddy aapke domain ke liye HTTPS certificate khud lega.

```bash
sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
$DOMAIN {
    handle /api/* {
        reverse_proxy 127.0.0.1:3000 {
            flush_interval -1
        }
    }
    handle {
        root * /opt/agriguard/dist
        encode zstd gzip
        try_files {path} /index.html
        file_server
    }
}
EOF
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
sudo systemctl reload caddy
curl -fsS "https://$DOMAIN/api/health"
```

Apne phone par mobile data se apna HTTPS link kholein. **हिन्दी** chunein, Farm Chat mein ek sawaal bhejein aur Crop Doctor mein ek saaf patte ki photo se poora result dekhein. Health check Ollama ki availability batata hai. Photo wala test Python classifier ko bhi check karta hai.

Agar website khul jaaye lekin AI jawab na de, server par `sudo journalctl -u agriguard -n 40` aur `ollama list` dekhein. Agar HTTPS link hi na khule, domain ka A record, firewall ke ports 80/443 aur `sudo journalctl -u caddy -n 40` check karein.
