from flask import Flask
from flask_cors import CORS
from models import db
from config import Config
from routes import main  # Import the combined blueprint

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

# Register the combined blueprint
app.register_blueprint(main)

if __name__ == '__main__':
    app.run(debug=True)