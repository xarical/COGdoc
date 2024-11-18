from flask import Flask, abort, request, json, jsonify, send_file
import os

app = Flask(__name__)
last_editor = "1"

@app.route('/', methods=['GET'])
def home():
    return send_file('index.html')

@app.route('/editor.js', methods=['GET'])
def get_editor():
    return send_file('editor.js')

@app.route('/content', methods=['GET'])
def get_content():
    if os.path.exists('code.txt'):
        with open('code.txt', 'r') as file:
            content = file.read()
        return jsonify({'content': content, 'lastEditor': last_editor})
    else:
        abort(404, description="Whoops! Document not found")

@app.route('/update', methods=['POST'])
def update_file():
    data = json.loads(request.data)
    code = data["code"]
    global last_editor
    last_editor = data["iam"]
    with open('code.txt', 'w') as file:
        file.write(code)
    return ""

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)