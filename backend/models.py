from pymongo import MongoClient
from datetime import datetime
from config import MONGODB_URI, DATABASE_NAME
from bson.objectid import ObjectId

class Database:
    """MongoDB Database Connection and Operations"""
    
    def __init__(self):
        try:
            self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            # Ping to test connection
            self.client.admin.command('ping')
            self.db = self.client[DATABASE_NAME]
            print("[MongoDB] Connected successfully!")
            self._init_collections()
        except Exception as e:
            print(f"[MongoDB] Connection Error: {e}")
            raise e
    
    def _init_collections(self):
        """Initialize collections with indexes"""
        try:
            # Users collection - Adhaar as unique index
            if 'users' not in self.db.list_collection_names():
                self.db.create_collection('users')
                print("[MongoDB] Created users collection")
            self.db.users.create_index('adhaar', unique=True)
            
            # Jobs collection
            if 'jobs' not in self.db.list_collection_names():
                self.db.create_collection('jobs')
                print("[MongoDB] Created jobs collection")
            
            # Applications collection
            if 'applications' not in self.db.list_collection_names():
                self.db.create_collection('applications')
                print("[MongoDB] Created applications collection")
            self.db.applications.create_index([('adhaar', 1), ('jobId', 1)])
            
            # Admins collection
            if 'admins' not in self.db.list_collection_names():
                self.db.create_collection('admins')
                print("[MongoDB] Created admins collection")
            self.db.admins.create_index('admin_id', unique=True)
            
            # Initialize default admin
            self._init_default_admin()
            print("[MongoDB] Collections initialized successfully!")
        except Exception as e:
            print(f"[MongoDB] Collection initialization error: {e}")
    
    def _init_default_admin(self):
        """Create default admin if not exists"""
        try:
            default_admin = self.db.admins.find_one({'admin_id': 'Neelima'})
            if not default_admin:
                self.db.admins.insert_one({
                    'admin_id': 'Neelima',
                    'password': 'Admin@neelu',
                    'email': 'admin@portal.com',
                    'name': 'Neelima',
                    'created_at': datetime.now().isoformat()
                })
                print("[MongoDB] Default admin created")
        except Exception as e:
            print(f"[MongoDB] Admin initialization error: {e}")
    
    def get_users_collection(self):
        return self.db.users
    
    def get_jobs_collection(self):
        return self.db.jobs
    
    def get_applications_collection(self):
        return self.db.applications
    
    def get_admins_collection(self):
        return self.db.admins
    
    def close(self):
        self.client.close()

try:
    db = Database()
except Exception as e:
    print(f"[Error] Failed to initialize database: {e}")
    db = None
