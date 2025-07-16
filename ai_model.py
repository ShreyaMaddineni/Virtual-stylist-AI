from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = request.files['image']
    # In real use: pass image to ML model
    # For now, return mock result
    result = {
        "top": "Black Blazer",
        "bottom": "Formal Trousers",
        "accessories": ["Watch", "Heels"]
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=8000, debug=True)

