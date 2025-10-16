from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder="out", static_url_path="")

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    file_path = os.path.join(app.static_folder, path)
    try:
        return send_from_directory(app.static_folder, file_path)
    except:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/hola')
def hola():
    return {"mensaje": "Hola desde Flask holita 🐍 + Next.js 🚀"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
