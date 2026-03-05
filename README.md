# CryptoPredict

AI-powered cryptocurrency analysis platform that combines **LSTM neural networks**, **FinBERT sentiment analysis**, and **real-time market data** to predict crypto price movements and let users test their market intuition.

---

## Features

- **Real-Time Dashboard** — Live OHLC charts with MACD indicators and sparklines for BTC, ETH, BNB, XRP & SOL
- **AI Price Prediction** — LSTM model trained on news sentiment and technical indicators to predict 60-minute price returns
- **FinBERT Sentiment Analysis** — Automatic sentiment scoring of crypto news headlines using a fine-tuned BERT model
- **Prediction Game** — Interactive click-to-predict game where users guess future prices and earn accuracy-based points
- **Leaderboard** — Compete with other players and track prediction accuracy rankings
- **Live News Feed** — Real-time cryptocurrency news with auto-rotation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Material UI 7, Recharts, Axios |
| **Backend** | Python, Flask, SQLAlchemy, Flask-CORS |
| **ML/AI** | PyTorch LSTM, FinBERT (HuggingFace), Scikit-learn GBR |
| **APIs** | Binance API (market data), NewsAPI (news) |
| **Database** | SQLite |

---

## Project Structure

```
Crypto_Prediction_Application/
├── app/                          # Flask backend
│   ├── __init__.py               # App factory with dotenv loading
│   ├── models.py                 # SQLAlchemy models (User, Prediction)
│   ├── routes.py                 # API endpoints
│   └── utils.py                  # LSTM model loading, Binance/NewsAPI clients
├── frontend/                     # React frontend
│   └── src/
│       ├── components/           # UI components
│       │   ├── Charts.js         # Main dashboard with charts & market data
│       │   ├── Home.js           # Landing page
│       │   ├── Login.js          # Authentication
│       │   ├── Register.js       # User registration
│       │   ├── QuizPage.js       # Interactive prediction game
│       │   ├── Leaderboard.js    # Points ranking
│       │   └── Navbar.js         # Navigation bar
│       ├── context/              # React context (auth state)
│       ├── utils/                # Client-side utilities
│       └── theme.js              # Shared MUI dark theme
├── scripts/                      # Data pipeline scripts
│   ├── build_dataset.py          # Fetch news + OHLC data from APIs
│   ├── csv_preprocess.py         # Feature engineering
│   ├── data_split.py             # Train GBR model
│   └── sentiment_scores.py       # FinBERT sentiment analysis
├── LSTM_model.py                 # LSTM model definition + training
├── run.py                        # Backend entry point
├── requirements.txt              # Python dependencies
└── .env.example                  # API key template
```

---

## Prerequisites

- **Python 3.8+**
- **Node.js 16+** and **npm**
- API keys for [Binance](https://www.binance.com/en/my/settings/api-management) and [NewsAPI](https://newsapi.org/)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/muradhuseynov1/Crypto_Prediction_Application.git
cd Crypto_Prediction_Application
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your actual API keys
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

---

## Running the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
python run.py
```
Backend runs at `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
Frontend runs at `http://localhost:3000`

---

## API Keys

Create a `.env` file in the project root (use `.env.example` as template):

```env
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
NEWSAPI_KEY=your_newsapi_key
COINLAYER_API_KEY=your_coinlayer_api_key
```

> See [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) for detailed instructions on obtaining keys and storing them securely.

---

## Data Pipeline

The ML models were trained on a custom dataset built from crypto news and price data. To rebuild from scratch:

```bash
# 1. Collect news + OHLC data
python scripts/build_dataset.py

# 2. Add FinBERT sentiment scores
python scripts/sentiment_scores.py

# 3. Engineer technical features
python scripts/csv_preprocess.py

# 4. Train GBR model
python scripts/data_split.py

# 5. Train LSTM model
python LSTM_model.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Register a new user |
| `POST` | `/api/login` | Authenticate user |
| `POST` | `/api/predict` | Submit a price prediction |
| `GET` | `/api/leaderboard` | Get top 10 players |
| `GET` | `/api/charts/<symbol>` | Historical OHLC + MACD data |
| `GET` | `/api/market-overview` | 24h price changes for all coins |
| `GET` | `/api/news` | Latest crypto news |

---

## License

MIT License — see [LICENSE](./LICENSE).

This project was built as part of the **Revolut** challenge during **HackUPC 2025** hackathon by Murad Hüseynov and Giorgia Barboni.
