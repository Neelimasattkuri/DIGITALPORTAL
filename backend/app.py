from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from config import DEBUG, SECRET_KEY
from models import db
from recommendation_engine import RecommendationEngine
from ml_matcher import QualificationMatcher
from bson.objectid import ObjectId

app = Flask(__name__)

# CORS – allow all origins on /api/* (you can restrict later to Vercel URL)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.secret_key = SECRET_KEY

# Initialize ML engines
recommendation_engine = RecommendationEngine()
matcher = QualificationMatcher()

# ============ USER ROUTES ============

@app.route('/api/users/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        adhaar = data.get('adhaar')

        # Check if user already exists
        if db.get_users_collection().find_one({'adhaar': adhaar}):
            return jsonify({'error': 'User already exists with this Adhaar'}), 400

        user = {
            'adhaar': adhaar,
            'name': data.get('name'),
            'email': data.get('email'),
            'qualification': data.get('qualification'),
            'phone': data.get('phone'),
            'experience': int(data.get('experience', 0)),
            'created_at': datetime.now().isoformat()
        }

        result = db.get_users_collection().insert_one(user)
        user['_id'] = str(result.inserted_id)

        return jsonify({'message': 'User registered successfully', 'user': user}), 201
    except Exception as e:
        print(f"[Error] Registration error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/login', methods=['POST'])
def login_user():
    try:
        data = request.json
        adhaar = data.get('adhaar')

        user = db.get_users_collection().find_one({'adhaar': adhaar})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user['_id'] = str(user['_id'])
        return jsonify({'user': user}), 200
    except Exception as e:
        print(f"[Error] Login error: {e}")
        return jsonify({'error': str(e)}), 500


# ============ ADMIN ROUTES ============

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.json
        admin_id = data.get('id')
        password = data.get('password')

        admin = db.get_admins_collection().find_one({
            'admin_id': admin_id,
            'password': password
        })

        if not admin:
            return jsonify({'error': 'Invalid credentials'}), 401

        return jsonify({
            'admin': {
                'id': admin['admin_id'],
                'name': admin['name'],
                'role': 'admin',
                'email': admin['email']
            }
        }), 200
    except Exception as e:
        print(f"[Error] Admin login error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/add-admin', methods=['POST'])
def add_admin():
    try:
        data = request.json
        admin_id = data.get('adminId')

        # Check if admin already exists
        if db.get_admins_collection().find_one({'admin_id': admin_id}):
            return jsonify({'error': 'Admin already exists'}), 400

        new_admin = {
            'admin_id': admin_id,
            'password': data.get('password'),
            'email': data.get('email'),
            'name': data.get('name'),
            'created_at': datetime.now().isoformat()
        }

        result = db.get_admins_collection().insert_one(new_admin)
        new_admin['_id'] = str(result.inserted_id)

        return jsonify({'message': 'Admin added successfully', 'admin': new_admin}), 201
    except Exception as e:
        print(f"[Error] Add admin error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/all-admins', methods=['GET'])
def get_all_admins():
    try:
        admins = list(db.get_admins_collection().find({}))
        for admin in admins:
            admin['_id'] = str(admin['_id'])
        return jsonify(admins), 200
    except Exception as e:
        print(f"[Error] Get admins error: {e}")
        return jsonify({'error': str(e)}), 500


# ============ JOB ROUTES ============

@app.route('/api/jobs', methods=['POST'])
def post_job():
    try:
        data = request.json

        job = {
            'title': data.get('title'),
            'department': data.get('department'),
            'description': data.get('description'),
            'minQualification': data.get('minQualification'),
            'maxQualification': data.get('maxQualification'),
            'salary': data.get('salary'),
            'location': data.get('location'),
            'requirements': data.get('requirements', []),
            'postedBy': data.get('postedBy'),
            'postedDate': datetime.now().isoformat(),
            'status': 'Active'
        }

        result = db.get_jobs_collection().insert_one(job)
        job['_id'] = str(result.inserted_id)
        job['id'] = str(result.inserted_id)

        print(f"[Job Posted] New job created: {job['title']}")
        return jsonify({'message': 'Job posted successfully', 'job': job}), 201
    except Exception as e:
        print(f"[Error] Post job error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = list(db.get_jobs_collection().find({'status': 'Active'}))
        for job in jobs:
            job['_id'] = str(job['_id'])
            job['id'] = str(job['_id'])
        print(f"[Jobs Fetched] Total active jobs: {len(jobs)}")
        return jsonify(jobs), 200
    except Exception as e:
        print(f"[Error] Get jobs error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_detail(job_id):
    try:
        job = db.get_jobs_collection().find_one({'_id': ObjectId(job_id)})
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        job['_id'] = str(job['_id'])
        job['id'] = str(job['_id'])
        return jsonify(job), 200
    except Exception as e:
        print(f"[Error] Get job detail error: {e}")
        return jsonify({'error': str(e)}), 500


# ============ ML RECOMMENDATION ROUTES ============

@app.route('/api/jobs/recommendations/<adhaar>', methods=['GET'])
def get_recommended_jobs(adhaar):
    try:
        user = db.get_users_collection().find_one({'adhaar': adhaar})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        all_jobs = list(db.get_jobs_collection().find({'status': 'Active'}))

        # Convert ObjectId to string for ML processing
        for job in all_jobs:
            job['_id'] = str(job['_id'])
            job['id'] = str(job['_id'])

        # Use ML engine to get recommendations
        recommendations = recommendation_engine.get_job_recommendations(
            user_qualification=user['qualification'],
            jobs=all_jobs,
            user_profile=user
        )

        print(f"[Recommendations] Generated {len(recommendations)} recommendations for {adhaar}")
        return jsonify(recommendations), 200
    except Exception as e:
        print(f"[Error] Recommendation error: {e}")
        return jsonify({'error': str(e)}), 500


# ============ APPLICATION ROUTES ============

@app.route('/api/applications', methods=['POST'])
def apply_for_job():
    try:
        data = request.json

        application = {
            'jobId': data.get('jobId'),
            'adhaar': data.get('adhaar'),
            'fullName': data.get('fullName'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'experience': int(data.get('experience', 0)),
            'coverLetter': data.get('coverLetter'),
            'resume': data.get('resume'),
            'status': 'Pending',
            'appliedDate': datetime.now().isoformat()
        }

        result = db.get_applications_collection().insert_one(application)
        application['_id'] = str(result.inserted_id)
        application['id'] = str(result.inserted_id)

        print(f"[Application] New application submitted for job: {application['jobId']}")
        return jsonify({'message': 'Application submitted', 'application': application}), 201
    except Exception as e:
        print(f"[Error] Apply job error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications/<adhaar>', methods=['GET'])
def get_user_applications(adhaar):
    try:
        user_apps = list(db.get_applications_collection().find({'adhaar': adhaar}))
        for app_doc in user_apps:
            app_doc['_id'] = str(app_doc['_id'])
            app_doc['id'] = str(app_doc['_id'])
        print(f"[Applications] Fetched {len(user_apps)} applications for {adhaar}")
        return jsonify(user_apps), 200
    except Exception as e:
        print(f"[Error] Get user applications error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications', methods=['GET'])
def get_all_applications():
    try:
        status = request.args.get('status', None)
        query = {}
        if status:
            query['status'] = status

        applications = list(db.get_applications_collection().find(query))
        for app_doc in applications:
            app_doc['_id'] = str(app_doc['_id'])
            app_doc['id'] = str(app_doc['_id'])
        print(f"[Applications] Fetched {len(applications)} applications")
        return jsonify(applications), 200
    except Exception as e:
        print(f"[Error] Get all applications error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications/<app_id>', methods=['PUT'])
def update_application_status(app_id):
    try:
        data = request.json
        result = db.get_applications_collection().update_one(
            {'__id': ObjectId(app_id)},
            {'$set': {'status': data.get('status')}}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Application not found'}), 404

        updated_app = db.get_applications_collection().find_one({'_id': ObjectId(app_id)})
        updated_app['_id'] = str(updated_app['_id'])
        updated_app['id'] = str(updated_app['_id'])

        print(f"[Application] Status updated to {data.get('status')}")
        return jsonify({'message': 'Application updated', 'application': updated_app}), 200
    except Exception as e:
        print(f"[Error] Update application error: {e}")
        return jsonify({'error': str(e)}), 500


# ============ ML MATCH SCORE ROUTES ============

@app.route('/api/jobs/match/<job_id>/<adhaar>', methods=['GET'])
def get_match_score(job_id, adhaar):
    try:
        job = db.get_jobs_collection().find_one({'_id': ObjectId(job_id)})
        user = db.get_users_collection().find_one({'adhaar': adhaar})

        if not job or not user:
            return jsonify({'error': 'Job or User not found'}), 404

        score = matcher.calculate_match_score(user, job)

        return jsonify({
            'jobId': job_id,
            'matchScore': score['score'],
            'reasoning': score['reasoning'],
            'details': score['details']
        }), 200
    except Exception as e:
        print(f"[Error] Match score error: {e}")
        return jsonify({'error': str(e)}), 500


# ============ HEALTH CHECK ============

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Check MongoDB connection
        db.client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        print(f"[Error] Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("[Server] Starting Flask Application...")
    print("[Server] Running on http://0.0.0.0:5000")
    app.run(debug=DEBUG, port=5000, host='0.0.0.0')
