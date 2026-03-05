"""CSV Feature Engineering Script

Adds technical features (returns, volatility, sentiment, cyclical time)
to the sentiment-enriched dataset for LSTM model training.

Usage:
    python scripts/csv_preprocess.py
"""
import pandas as pd
import numpy as np

df = pd.read_csv("crypto_news_price_sentiment.csv", parse_dates=["timestamp"])
df["timestamp"] = df["timestamp"].dt.floor("min")

k = 60
df = df.sort_values(["coin", "timestamp"])
df["future_close"] = df.groupby("coin")["close"].shift(-k)
df["pct_return_60m"] = df["future_close"] / df["close"] - 1
df = df.dropna(subset=["pct_return_60m"])

df["sentiment_num"] = df["sentiment_label"].map(
    {"positive": 1, "neutral": 0, "negative": -1}
) * df["sentiment_score"]

for n in (5, 15, 30):
    df[f"ret_{n}m"] = df.groupby("coin")["close"].pct_change(n)
    df[f"vol_{n}m"] = df.groupby("coin")["close"].rolling(n).std().reset_index(0, drop=True)

df["hour"] = df["timestamp"].dt.hour
df["sin_hour"] = np.sin(2 * np.pi * df["hour"] / 24)
df["cos_hour"] = np.cos(2 * np.pi * df["hour"] / 24)

df.to_csv("crypto_news_features.csv", index=False)
print("Feature-enhanced dataset saved to crypto_news_features.csv")
