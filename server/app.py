from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file.save('temp.wav')  # 一時保存

    # ★ここで機械学習モデルなどに渡して「ぼ・つ・ぱ・無音」に分類処理
    result = {
        'segments': [
            {'label': 'ぼ', 'start': 0.0, 'end': 0.5},
            {'label': '無音', 'start': 0.5, 'end': 1.0},
            {'label': 'ぱ', 'start': 1.0, 'end': 1.5}
        ]
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)