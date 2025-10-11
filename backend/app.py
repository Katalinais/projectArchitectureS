from flask import Flask, send_from_directory

app = Flask(__name__, static_folder="../frontend/out", static_url_path="/")

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory(app.static_folder, path)
    except:
        # Si no existe el archivo, devolvemos index.html (para rutas SPA)
        return send_from_directory(app.static_folder, 'index.html')

# Ejemplo de endpoint API
@app.route('/api/hola')
def hola():
    return {"mensaje": "Hola desde Flask 🐍 + Next.js 🚀"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
