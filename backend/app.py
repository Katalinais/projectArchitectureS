from flask import Flask, send_from_directory,jsonify
import paho.mqtt.client as mqtt
import threading
import json

app = Flask(__name__, static_folder="../frontend/out", static_url_path="/")

BROKER = "192.168.1.32"
PORT = 1883
TOPIC = "sensor/sonido"

ultimo_mensaje = {"topic": None, "mensaje": None}

# --- Callbacks MQTT ---
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Conectado al broker MQTT")
        client.subscribe(TOPIC)
        print(f"📡 Suscrito a: {TOPIC}")
    else:
        print(f"❌ Error al conectar. Código: {rc}")

def on_message(client, userdata, msg):
    global ultimo_mensaje
    try:
        data = json.loads(msg.payload.decode())  # convierte el texto JSON a diccionario
        ultimo_mensaje = data
        print(f"📥 Mensaje decodificado: {data}")
    except json.JSONDecodeError:
        print(f"⚠️ No se pudo decodificar el mensaje: {msg.payload.decode()}")

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(BROKER, PORT, 60)

# Ejecutar MQTT en un hilo separado para no bloquear Flask
mqtt_thread = threading.Thread(target=mqtt_client.loop_forever)
mqtt_thread.daemon = True
mqtt_thread.start()

# Ejemplo de endpoint API
@app.route('/')
def hola():
    return {"mensaje": "Hola desde Flask 🐍 + Next.js 🚀"}

@app.route("/datos", methods=["GET"])
def get_datos():
    return jsonify(ultimo_mensaje)

@app.route("/publicar/<mensaje>", methods=["GET"])
def publicar(mensaje):
    """Publica un mensaje MQTT desde Flask"""
    mqtt_client.publish(TOPIC, mensaje)
    return jsonify({"status": "Publicado", "mensaje": mensaje})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5173, debug=True)
