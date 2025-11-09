from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from mqtt_client import init_mqtt_client
from config import config
import os

app = Flask(__name__, static_folder="../frontend/out", static_url_path="/")
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"])

env = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[env])

mqtt_client = init_mqtt_client(
    broker=app.config['MQTT_BROKER'],
    port=app.config['MQTT_PORT'],
    topic=app.config['MQTT_TOPIC'],
    window_seconds=app.config['WINDOW_SECONDS']
)

@app.route('/')
def hola():
    return {"mensaje": "Hola desde Flask 🐍 + Next.js 🚀"}

@app.route("/data", methods=["GET"])
def get_data(): 
    latest_data = mqtt_client.get_latest_data()
    if latest_data is None:
        return jsonify({"error": "No data available yet"}), 404
    return jsonify(latest_data)

if __name__ == "__main__":
    app.run(
        host=app.config['FLASK_HOST'],
        port=app.config['FLASK_PORT'],
        debug=app.config['DEBUG'],
        use_reloader=app.config['USE_RELOADER']
    )
