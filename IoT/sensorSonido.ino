// Pines del ESP32
const int pinAnalog = 34;   // AO del KY-038
const int pinDigital = 27;  // DO del KY-038

void setup() {
  Serial.begin(115200);
  pinMode(pinDigital, INPUT);
}

void loop() {
  // Leer salida analógica (nivel de sonido)
  int soundLevel = analogRead(pinAnalog);

  // Leer salida digital (1 si supera umbral)
  int soundDetected = digitalRead(pinDigital);

  // Mostrar en monitor serie
  Serial.println(soundLevel);
  Serial.print(" ");
  Serial.println(soundDetected);

  delay(200);  // pequeño retardo para no saturar
}
