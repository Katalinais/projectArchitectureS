# 🔗 Conexión ESP32 → Raspberry Pi (MQTT con Mosquitto)

Como para conectar un **ESP32** (programado con Arduino) a una **Raspberry Pi** que actúa como **broker MQTT**, usando **Mosquitto**.  
Incluye el detalle clave para permitir conexiones externas a la Raspberry (no solo desde `localhost`).

---

## 🚀 Pasos rápidos

### 🧩 En la Raspberry Pi (Broker MQTT)

Instalar y habilitar Mosquitto:
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

Editar la configuración para aceptar conexiones externas:

```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Agregar al final del archivo:

```bash
listener 1883
allow_anonymous true
```

Reiniciar Mosquitto:

```bash
sudo systemctl restart mosquitto
```

Verificar que ahora escucha en todas las interfaces:

```bash
sudo netstat -tlnp | grep 1883
```

Debe mostrar algo como: 0.0.0.0:1883

⚠️ Si este paso falta, la Raspberry solo aceptará conexiones desde localhost
y la ESP32 mostrará el error rc=-2 al intentar conectarse.

⸻

### ⚙️ En el ESP32 (Cliente MQTT)

En tu sketch de Arduino, usa la IP de la Raspberry como servidor MQTT:

```c++
const char* mqtt_server = "192.168.1.45"; // IP de la Raspberry
```

Ejemplo básico de envío de datos:

```c++
client.publish("sensor/sonido", "{\"analog\":123,\"digital\":0}");
```

La ESP32 debe estar en la misma red WiFi que la Raspberry.

⸻

### 🔍 Probar desde la Raspberry

Suscribirse al topic para ver los mensajes que publica la ESP32:

```bash
mosquitto_sub -h localhost -t "sensor/sonido"
```

Deberías ver algo como:

```bash
{"analog":123,"digital":0}
{"analog":128,"digital":0}
```

⸻

### ✅ Resumen

Dispositivo	Rol	Software	Dirección
ESP32	Cliente MQTT	PubSubClient (Arduino)	mqtt_server = "192.168.1.45"
Raspberry Pi	Broker MQTT	Mosquitto	Escucha en 0.0.0.0:1883


