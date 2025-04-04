
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pymongo
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
mongo_client = None
db = None

def get_db():
    global mongo_client, db
    if not mongo_client:
        mongo_uri = os.environ.get("MONGODB_URI")
        if not mongo_uri:
            return None
        try:
            mongo_client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            db = mongo_client.get_database()
        except Exception as e:
            print(f"Error connecting to MongoDB: {str(e)}")
            return None
    return db

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "timestamp": str(datetime.now()),
        "env": os.environ.get("FLASK_ENV", "development"),
        "hasMongoUri": bool(os.environ.get("MONGODB_URI"))
    })

@app.route('/api/db/status', methods=['GET'])
def db_status():
    """Check MongoDB connection status"""
    uri = request.args.get('uri') or os.environ.get("MONGODB_URI")
    
    if not uri:
        return jsonify({
            "status": "error",
            "connected": False,
            "message": "No MongoDB connection string provided",
            "statusCode": 400
        }), 400
    
    try:
        # Test connection with a short timeout
        client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        
        return jsonify({
            "status": "ok",
            "connected": True,
            "statusCode": 200,
            "diagnostics": {
                "clientType": "MongoDB",
                "dbVersion": client.server_info().get("version", "unknown"),
                "dbName": client.get_database().name
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "connected": False,
            "message": str(e),
            "statusCode": 500
        }), 500

@app.route('/api/db/init', methods=['POST'])
def db_init():
    """Initialize database with collections"""
    data = request.get_json()
    uri = data.get('uri') if data else None
    uri = uri or os.environ.get("MONGODB_URI")
    
    if not uri:
        return jsonify({
            "status": "error",
            "message": "No MongoDB connection string provided",
            "statusCode": 400
        }), 400
    
    try:
        client = pymongo.MongoClient(uri)
        db = client.get_database()
        
        # Create collections
        collections = ['users', 'domains', 'files', 'notes', 'seo_analysis']
        for coll_name in collections:
            if coll_name not in db.list_collection_names():
                db.create_collection(coll_name)
        
        # Create sample data
        if db.users.count_documents({}) == 0:
            db.users.insert_one({
                "email": "admin@example.com",
                "password": "hashed_password",  # In production, use proper password hashing
                "role": "admin",
                "name": "Admin User",
                "createdAt": str(datetime.now())
            })
        
        return jsonify({
            "status": "ok",
            "message": "Database initialized successfully",
            "collections": db.list_collection_names(),
            "statusCode": 200
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "statusCode": 500
        }), 500

if __name__ == '__main__':
    from datetime import datetime
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=True)
