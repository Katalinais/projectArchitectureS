from flask import Flask, send_from_directory, jsonify
from mqtt_client import init_mqtt_client
from config import config
import os

app = Flask(__name__, static_folder="../frontend/out", static_url_path="/")

env = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[env])

mqtt_client = init_mqtt_client(
    broker=app.config['MQTT_BROKER'],
    port=app.config['MQTT_PORT'],
    topic=app.config['MQTT_TOPIC']
)

@app.route('/')
def hola():
    return {"mensaje": "Hola desde Flask 🐍 + Next.js 🚀"}

@app.route("/datos", methods=["GET"])
def get_datos():
    ultimo_mensaje = mqtt_client.get_ultimo_mensaje()
    return jsonify(ultimo_mensaje)

@app.route("/publicar/<mensaje>", methods=["GET"])
def publicar(mensaje):
    try:
        mqtt_client.publish(mensaje)
        return jsonify({"status": "Publicado", "mensaje": mensaje})
    except Exception as e:
        return jsonify({"status": "Error", "mensaje": str(e)}), 500

if __name__ == "__main__":
    app.run(
        host=app.config['FLASK_HOST'],
        port=app.config['FLASK_PORT'],
        debug=app.config['DEBUG'],
        use_reloader=app.config['USE_RELOADER']
    )
