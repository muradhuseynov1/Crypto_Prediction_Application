# API Keys Guide

A personal guide for obtaining, storing, and managing API keys for this project — locally and on GitHub.

---

## Required API Keys

| Key | Service | Where to Get |
|-----|---------|-------------|
| `BINANCE_API_KEY` | Binance | [API Management](https://www.binance.com/en/my/settings/api-management) |
| `BINANCE_API_SECRET` | Binance | Generated with the API key above |
| `NEWSAPI_KEY` | NewsAPI | [Register](https://newsapi.org/register) |
| `COINLAYER_API_KEY` | CoinLayer | [Sign Up](https://coinlayer.com/signup/free) (data pipeline only) |

---

## 1. Local Development — `.env` File

Store keys in a `.env` file in the project root. **Never commit this file.**

```bash
# Create from template
cp .env.example .env
```

Edit `.env`:
```env
BINANCE_API_KEY=abc123...
BINANCE_API_SECRET=xyz789...
NEWSAPI_KEY=def456...
COINLAYER_API_KEY=ghi012...
```

The `.gitignore` already excludes `.env`, so it won't be pushed to GitHub.

---

## 2. GitHub — Repository Secrets

For CI/CD pipelines or GitHub Actions, store keys as **repository secrets**:

### Steps:
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each key:
   - Name: `BINANCE_API_KEY` → Value: your actual key
   - Name: `BINANCE_API_SECRET` → Value: your actual secret
   - Name: `NEWSAPI_KEY` → Value: your actual key
   - Name: `COINLAYER_API_KEY` → Value: your actual key

### Using secrets in GitHub Actions:
```yaml
# .github/workflows/example.yml
env:
  BINANCE_API_KEY: ${{ secrets.BINANCE_API_KEY }}
  BINANCE_API_SECRET: ${{ secrets.BINANCE_API_SECRET }}
  NEWSAPI_KEY: ${{ secrets.NEWSAPI_KEY }}
```

### Important Notes:
- Secrets are **encrypted** and never visible in logs
- They are available only to **GitHub Actions workflows**, not in the repository code
- Anyone with **admin access** can add/update secrets
- Secrets are **not available** in pull requests from forks (security feature)

---

## 3. Environment Variables on Your Machine (Global)

If you want keys available globally (across all projects):

### Windows (PowerShell):
```powershell
# Set permanently for your user
[Environment]::SetEnvironmentVariable("BINANCE_API_KEY", "your_key", "User")
[Environment]::SetEnvironmentVariable("BINANCE_API_SECRET", "your_secret", "User")
[Environment]::SetEnvironmentVariable("NEWSAPI_KEY", "your_key", "User")
```

Restart your terminal. Verify:
```powershell
echo $env:BINANCE_API_KEY
```

### macOS/Linux (bash/zsh):
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export BINANCE_API_KEY="your_key"
export BINANCE_API_SECRET="your_secret"
export NEWSAPI_KEY="your_key"
```

Then reload:
```bash
source ~/.bashrc
```

---

## 4. Security Best Practices

- **Never commit API keys** to version control — use `.env` files and `.gitignore`
- **Rotate keys** if they are ever accidentally exposed
- **Use IP restrictions** on Binance API keys (Settings → API Management → Restrict to your IP)
- **Use read-only permissions** — the app only needs market data, not trading
- **GitHub secret scanning** — GitHub automatically scans for leaked secrets and will alert you
- If you accidentally push a key, consider it compromised: **revoke and regenerate immediately**
