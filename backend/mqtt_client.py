import paho.mqtt.client as mqtt
import threading
import json

class MQTTClient:
    
    def __init__(self, broker, port, topic):
        self.broker = broker
        self.port = port
        self.topic = topic
        self.ultimo_mensaje = {"topic": None, "mensaje": None}
        self.client = None
        self.thread = None
        
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✅ Conectado al broker MQTT")
            client.subscribe(self.topic)
            print(f"📡 Suscrito a: {self.topic}")
        else:
            print(f"❌ Error al conectar. Código: {rc}")
    
    def _on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            self.ultimo_mensaje = data
            print(f"📥 Mensaje decodificado: {data}")
        except json.JSONDecodeError:
            print(f"⚠️ No se pudo decodificar el mensaje: {msg.payload.decode()}")
    
    def start(self):
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        
        try:
            self.client.connect(self.broker, self.port, 60)
            self.thread = threading.Thread(target=self.client.loop_forever)
            self.thread.daemon = True
            self.thread.start()
            print("Cliente MQTT iniciado")
        except Exception as e:
            print(f"Error al iniciar MQTT: {e}")
            raise
    
    def get_ultimo_mensaje(self):
        return self.ultimo_mensaje
    
    def publish(self, mensaje):
        if self.client:
            if isinstance(mensaje, dict):
                mensaje = json.dumps(mensaje)
            self.client.publish(self.topic, mensaje)
        else:
            raise RuntimeError("Cliente MQTT no inicializado")
    
    def stop(self):
        if self.client:
            try:
                self.client.loop_stop()
                self.client.disconnect()
                print("Cliente MQTT detenido")
            except Exception as e:
                print(f"Error al detener MQTT: {e}")

_mqtt_client_instance = None

def init_mqtt_client(broker="192.168.1.205", port=1883, topic="sensor/sonido"):
    global _mqtt_client_instance
    if _mqtt_client_instance is None:
        _mqtt_client_instance = MQTTClient(broker, port, topic)
        _mqtt_client_instance.start()
    return _mqtt_client_instance

def get_mqtt_client():
    if _mqtt_client_instance is None:
        raise RuntimeError("Cliente MQTT no inicializado. Llama a init_mqtt_client() primero")
    return _mqtt_client_instance

