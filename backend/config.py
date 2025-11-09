import os

class Config:
    MQTT_BROKER = os.environ.get('MQTT_BROKER') or '192.168.4.2'
    MQTT_PORT = int(os.environ.get('MQTT_PORT') or 1883)
    MQTT_TOPIC = os.environ.get('MQTT_TOPIC') or 'sensor/sonido'
    WINDOW_SECONDS = int(os.environ.get('WINDOW_SECONDS') or 2)
    
    FLASK_HOST = os.environ.get('FLASK_HOST') or '0.0.0.0'
    FLASK_PORT = int(os.environ.get('FLASK_PORT') or 5173)

class DevelopmentConfig(Config):
    DEBUG = True
    USE_RELOADER = False

class ProductionConfig(Config):
    DEBUG = False
    USE_RELOADER = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

