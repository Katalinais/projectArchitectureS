import paho.mqtt.client as mqtt
import threading
import json
import datetime
from utils import DataBuffer, calculate_average

class MQTTClient:
    
    def __init__(self, broker, port, topic, window_seconds=2):
        self.broker = broker
        self.port = port
        self.topic = topic
        self.latest_data = None
        self.client = None
        self.thread = None
        self.buffer = DataBuffer(window_seconds=window_seconds)
        self.timer = None
        self.window_seconds = window_seconds
        
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            client.subscribe(self.topic)
            print(f"Subscribed to: {self.topic}")
        else:
            print(f"Error connecting to MQTT broker. Code: {rc}")
    
    def _on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            self.buffer.add(data)
        except json.JSONDecodeError:
            print(f"Could not decode message: {msg.payload.decode()}")
    
    def _calculate_and_publish_average(self):
        """Calculates the average of accumulated data and updates the last message"""
        data = self.buffer.get_data_in_window()
        last_timestamp = self.buffer.get_last_timestamp()
        
        if data:
            analog_average = calculate_average(data, field='analog')
            samples_count = len(data)
            
            timestamp_str = None
            if last_timestamp > 0:
                timestamp_str = datetime.datetime.fromtimestamp(last_timestamp).isoformat()
            
            result_data = {
                "value": analog_average,
                "samples": samples_count,
                "timestamp": timestamp_str
            }
            
            self.latest_data = result_data
            
            print(json.dumps(result_data, indent=2))
        
        # Schedule next calculation
        self.timer = threading.Timer(self.window_seconds, self._calculate_and_publish_average)
        self.timer.daemon = True
        self.timer.start()
    
    def start(self):
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        
        try:
            self.client.connect(self.broker, self.port, 60)
            self.thread = threading.Thread(target=self.client.loop_forever)
            self.thread.daemon = True
            self.thread.start()
            
            self.timer = threading.Timer(self.window_seconds, self._calculate_and_publish_average)
            self.timer.daemon = True
            self.timer.start()
            
            print("MQTT client started")
        except Exception as e:
            print(f"Error starting MQTT: {e}")
            raise
    
    def get_latest_data(self):
        return self.latest_data
    
    
    def stop(self):
        if self.timer:
            self.timer.cancel()
        if self.client:
            try:
                self.client.loop_stop()
                self.client.disconnect()
                print("MQTT client stopped")
            except Exception as e:
                print(f"Error stopping MQTT: {e}")

_mqtt_client_instance = None

def init_mqtt_client(broker="192.168.4.2", port=1883, topic="sensor/sonido", window_seconds=2):
    global _mqtt_client_instance
    if _mqtt_client_instance is None:
        _mqtt_client_instance = MQTTClient(broker, port, topic, window_seconds=window_seconds)
        _mqtt_client_instance.start()
    return _mqtt_client_instance

def get_mqtt_client():
    if _mqtt_client_instance is None:
        raise RuntimeError("MQTT client not initialized. Call init_mqtt_client() first")
    return _mqtt_client_instance

