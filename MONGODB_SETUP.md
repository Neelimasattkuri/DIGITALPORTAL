# MongoDB Integration Guide

## Database Setup

Your job portal is now integrated with MongoDB. The connection details are configured in the `.env` file.

### MongoDB URI
\`\`\`
mongodb+srv://neelima:neelima123@neelima.aqb3umz.mongodb.net/
\`\`\`

## Collections Structure

### 1. **users** Collection
Stores all registered users with unique Adhaar constraint.

\`\`\`json
{
  "_id": ObjectId,
  "adhaar": "String (unique)",
  "name": "String",
  "email": "String",
  "qualification": "String (KG-PG hierarchy)",
  "phone": "String",
  "experience": "Integer (years)",
  "created_at": "ISO DateTime"
}
\`\`\`

### 2. **jobs** Collection
Stores all job postings created by admins.

\`\`\`json
{
  "_id": ObjectId,
  "title": "String",
  "department": "String",
  "description": "String",
  "minQualification": "String",
  "maxQualification": "String",
  "salary": "String",
  "location": "String",
  "requirements": ["Array of Strings"],
  "postedBy": "Admin ID",
  "postedDate": "ISO DateTime",
  "status": "Active/Closed"
}
\`\`\`

### 3. **applications** Collection
Stores all job applications from users.

\`\`\`json
{
  "_id": ObjectId,
  "jobId": "String (Job ObjectId)",
  "adhaar": "String",
  "fullName": "String",
  "email": "String",
  "phone": "String",
  "experience": "Integer",
  "coverLetter": "String",
  "resume": "String (Base64 or URL)",
  "status": "Pending/Selected/Rejected",
  "appliedDate": "ISO DateTime"
}
\`\`\`

### 4. **admins** Collection
Stores admin accounts with unique admin_id constraint.

\`\`\`json
{
  "_id": ObjectId,
  "admin_id": "String (unique)",
  "password": "String",
  "email": "String",
  "name": "String",
  "created_at": "ISO DateTime"
}
\`\`\`

## Backend Setup

### 1. Install Dependencies
\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### 2. Configure Environment Variables
Update `.env` file with your MongoDB connection string (already configured).

### 3. Run Flask Server
\`\`\`bash
python app.py
\`\`\`

The server will:
- Connect to MongoDB using the provided URI
- Initialize collections with proper indexes
- Create the default admin account (Neelima / Admin@neelu)
- Start listening on `http://localhost:5000`

## API Endpoints

### User Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/jobs/recommendations/<adhaar>` - Get ML-recommended jobs

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/add-admin` - Add new admin
- `GET /api/admin/all-admins` - Get all admins

### Job Endpoints
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/<job_id>` - Get job details
- `POST /api/jobs` - Post new job (admin only)

### Application Endpoints
- `POST /api/applications` - Submit job application
- `GET /api/applications/<adhaar>` - Get user's applications
- `GET /api/applications?status=Pending` - Get applications by status (admin)
- `PUT /api/applications/<app_id>` - Update application status (admin)

### ML Endpoints
- `GET /api/jobs/match/<job_id>/<adhaar>` - Get match score between user and job

### Health Check
- `GET /api/health` - Check MongoDB connection status

## Default Admin Credentials
- **Admin ID**: Neelima
- **Password**: Admin@neelu

These are automatically created when the application first runs.

## Features Included

1. **User Management**
   - Registration with Adhaar as unique identifier
   - Login verification
   - Profile storage

2. **Job Management**
   - Post new job listings
   - Automatic collection of active jobs
   - Job status tracking

3. **Application Management**
   - Submit job applications
   - Track application status (Pending/Selected/Rejected)
   - View applications by status

4. **ML-Based Recommendations**
   - Content-based filtering
   - Qualification hierarchy matching (KG to PG)
   - Experience alignment scoring
   - Automatic eligibility checking

5. **Admin Dashboard**
   - Manage multiple admins
   - Post job listings
   - Review and approve/reject applications
   - View categorized applications

## Verification

To verify MongoDB is working:
1. Start the backend: `python app.py`
2. Check health endpoint: `curl http://localhost:5000/api/health`
3. You should see: `{"status": "healthy", "database": "connected"}`

## Troubleshooting

If you encounter connection issues:
1. Verify MongoDB URI is correct in `.env`
2. Check MongoDB Atlas network access (whitelist your IP)
3. Ensure all required IP addresses are whitelisted
4. Check Python has pymongo installed: `pip list | grep pymongo`

Enjoy your MongoDB-integrated job portal!
