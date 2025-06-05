import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # DON'T CHANGE THIS !!!

from flask import Flask, jsonify
from flask_cors import CORS
from src.routes.crypto import crypto_bp

# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(crypto_bp, url_prefix='/api/crypto')

# Root route
@app.route('/')
def index():
    return jsonify({
        'status': 'ok',
        'message': 'Crypto Arbitrage Scanner API is running'
    })

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
