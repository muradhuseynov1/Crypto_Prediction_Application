from flask import Blueprint, json, jsonify, request, current_app
from flask_cors import cross_origin
from .models import db, User, Prediction
import os
from datetime import datetime
import pandas as pd
import numpy as np
from .utils import get_macd, fetch_news, get_current_price

main_bp = Blueprint('main', __name__)


@main_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    user = User(username=username, password=password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user_id': user.id}), 201


@main_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username, password=password).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'user_id': user.id}), 200


@main_bp.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    user_id = data.get('user_id')
    crypto_symbol = data.get('crypto_symbol')
    predicted_price = data.get('predicted_price')
    prediction_time = datetime.fromisoformat(data.get('prediction_time'))

    actual_price = get_current_price(crypto_symbol)

    accuracy = abs(predicted_price - actual_price) / actual_price
    points = max(0, min(100, int((1 - accuracy) * 100)))

    prediction = Prediction(
        user_id=user_id,
        crypto_symbol=crypto_symbol,
        predicted_price=predicted_price,
        actual_price=actual_price,
        prediction_time=prediction_time,
        points_earned=points
    )

    user = User.query.get(user_id)
    if user:
        user.points += points

    db.session.add(prediction)
    db.session.commit()

    return jsonify({
        'message': 'Prediction recorded',
        'actual_price': actual_price,
        'points_earned': points
    }), 201


@main_bp.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    users = User.query.order_by(User.points.desc()).limit(10).all()
    return jsonify([{
        'rank': idx + 1,
        'username': user.username,
        'points': user.points
    } for idx, user in enumerate(users)]), 200


@main_bp.route('/api/charts/<crypto_symbol>', methods=['GET'])
@cross_origin()
def get_charts(crypto_symbol):
    base = os.path.dirname(os.path.dirname(__file__))
    path = os.path.join(base, 'backend', 'data', 'crypto_news_price_ohlc_dataset.csv')

    df = pd.read_csv(path, parse_dates=['timestamp'])
    df = df[df['coin'] == crypto_symbol]

    if 'price_usd' in df.columns:
        df = df.rename(columns={'price_usd': 'price'})

    if 'volume_24h' in df.columns:
        df = df.rename(columns={'volume_24h': 'volume'})
    df['volume'] = df.get('volume', 0)
    df['sentiment'] = df.get('sentiment_num', 0)

    macd = get_macd(df)

    response_payload = {
        'historical_data': json.loads(
            df.to_json(orient='records', date_format='iso')
        ),
        'macd': {k: [float(x) for x in v] for k, v in macd.items()},
        'predictions': []
    }
    return jsonify(response_payload), 200


@main_bp.route('/api/market-overview', methods=['GET'])
@cross_origin()
def market_overview():
    """Return 24h price changes for all tracked coins."""
    try:
        from .utils import binance_client
        coins = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL']
        result = []
        for coin in coins:
            try:
                ticker = binance_client.get_ticker(symbol=f"{coin}USDT")
                result.append({
                    'symbol': coin,
                    'price': float(ticker['lastPrice']),
                    'change_24h': float(ticker['priceChangePercent'])
                })
            except Exception:
                result.append({
                    'symbol': coin,
                    'price': 0,
                    'change_24h': 0
                })
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"market_overview failed: {e}")
        return jsonify([]), 200


@main_bp.route('/api/news', methods=['GET'])
@cross_origin()
def get_news():
    try:
        news = fetch_news()
    except Exception as e:
        current_app.logger.error(f"fetch_news failed: {e}")
        news = []
    return jsonify(news), 200