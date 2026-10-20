# Casario Landing

Express static server for the Casario landing page (`index.html`).

The app listens on `127.0.0.1:3000`. Public access goes through a Cloudflare Tunnel at `https://casario.ddsol.cl`, so the VPS does not need any inbound ports open.

## Local development

```bash
npm install
npm start
# open http://localhost:3000
```

Health check: `GET /healthz` returns `ok`.

## Server setup (Ubuntu LTS)

### 1. Install Node.js 24 LTS and git

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v
```

### 2. Create a system user

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin casario
```

### 3. Clone and install dependencies

```bash
sudo git clone <REPO_URL> /opt/casario-landing
cd /opt/casario-landing
sudo npm ci --omit=dev
sudo chown -R casario:casario /opt/casario-landing
```

### 4. Install the systemd service

```bash
sudo cp deploy/casario.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now casario
```

Verify:

```bash
systemctl status casario
curl -I http://127.0.0.1:3000/
```

## Cloudflare Tunnel setup

Follow Cloudflare's current install instructions for `cloudflared` on Debian/Ubuntu (see developers.cloudflare.com under Cloudflare Tunnel). Then:

```bash
cloudflared tunnel login
cloudflared tunnel create casario
cloudflared tunnel route dns casario casario.ddsol.cl
```

Create the config file from the example:

```bash
sudo mkdir -p /etc/cloudflared
sudo cp deploy/cloudflared-config.example.yml /etc/cloudflared/config.yml
sudo nano /etc/cloudflared/config.yml        # replace <TUNNEL_UUID> in both places
sudo mv ~/.cloudflared/<TUNNEL_UUID>.json /etc/cloudflared/
```

Install and start the tunnel as a service (`service install` reads `/etc/cloudflared/config.yml`):

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Verify: open `https://casario.ddsol.cl`.

## Updating

```bash
cd /opt/casario-landing
sudo -u casario git pull
sudo -u casario npm ci --omit=dev
sudo systemctl restart casario
```

## Troubleshooting

```bash
journalctl -u casario -f
journalctl -u cloudflared -f
```
