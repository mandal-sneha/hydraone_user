from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app)

    from routes.camera_routes import camera_bp
    app.register_blueprint(camera_bp, url_prefix="/")

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("CAMERA_SERVICE_PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)