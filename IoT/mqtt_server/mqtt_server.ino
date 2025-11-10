#include <WiFi.h>
#include <PubSubClient.h>

// WiFi
const char* ssid = "SERGIO APTO_2.4";
const char* password = "23121995";

// Broker MQTT (la IP de tu Raspberry Pi)
const char* mqtt_server = "192.168.1.32";  

WiFiClient espClient;
PubSubClient client(espClient);

// Pines del KY-038
const int pinAnalog = 34;
const int pinDigital = 27;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Reconecta al broker si se pierde la conexión
  while (!client.connected()) {
    Serial.print("Conectando al broker MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("conectado!");
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(pinDigital, INPUT);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  int soundLevel = analogRead(pinAnalog);
  int soundDetected = digitalRead(pinDigital);

  // Prepara el mensaje JSON
  String message = String("{\"analog\":") + soundLevel +
                   ",\"digital\":" + soundDetected + "}";

  client.publish("sensor/sonido", message.c_str());
  Serial.println("Enviado: " + message);

  delay(200);
}
