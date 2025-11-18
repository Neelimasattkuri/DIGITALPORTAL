# Digital Job Portal - Complete Setup Guide

## Overview
This is a full-stack digital job portal for academic hiring with:
- React/Next.js frontend
- Flask backend with ML algorithms
- MongoDB database integration
- Machine learning-based job recommendations
- User and Admin functionality

## Features

### User Features
- Register using Adhaar number (12-digit unique identifier)
- Login with Adhaar verification
- Browse all available jobs
- View ML-recommended jobs based on qualification
- Apply for jobs with resume and details
- Track application status (Pending/Selected/Rejected) - Real-time updates

### Admin Features
- Login with credentials (ID: Neelima, Password: Admin@neelu)
- Add other admins
- Post new jobs with qualifications and requirements
- View and manage applications
- Accept or reject applicants
- View selected and rejected candidates separately

### ML Algorithms
1. **Recommendation Engine**: Content-based filtering using qualification hierarchy
2. **Qualification Matcher**: Advanced matching considering:
   - Qualification level match (60% weight)
   - Experience alignment (30% weight)
   - Location relevance (10% weight)

## MongoDB Connection
The application is directly connected to MongoDB:
\`\`\`
mongodb+srv://neelima:neelima123@neelima.aqb3umz.mongodb.net/job_portal
\`\`\`

## Prerequisites
- Python 3.8+
- Node.js 16+
- Active internet connection (for MongoDB Atlas access)

## Setup Instructions

### Backend Setup (Flask + MongoDB)

1. **Navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Create a virtual environment**
   \`\`\`bash
   python -m venv venv
   \`\`\`

3. **Activate virtual environment**
   - On Windows:
     \`\`\`bash
     venv\Scripts\activate
     \`\`\`
   - On macOS/Linux:
     \`\`\`bash
     source venv/bin/activate
     \`\`\`

4. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

5. **Run Flask server**
   \`\`\`bash
   python app.py
   \`\`\`
   
   Expected output:
   \`\`\`
   [MongoDB] Connected successfully!
   [MongoDB] Created users collection
   [MongoDB] Created jobs collection
   [MongoDB] Created applications collection
   [MongoDB] Created admins collection
   [MongoDB] Default admin created
   [Server] Starting Flask Application...
   [Server] Running on http://0.0.0.0:5000
   \`\`\`

### Frontend Setup (React/Next.js)

1. **Open a new terminal and navigate to root directory**
   \`\`\`bash
   cd ..
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Frontend will run on `http://localhost:3000`

## API Endpoints

### User Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login with Adhaar
- `GET /api/jobs/recommendations/<adhaar>` - Get ML-recommended jobs

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/add-admin` - Add new admin
- `GET /api/admin/all-admins` - Get all admins

### Job Endpoints
- `POST /api/jobs` - Post new job
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/<job_id>` - Get job details
- `GET /api/jobs/match/<job_id>/<adhaar>` - Get ML match score

### Application Endpoints
- `POST /api/applications` - Submit application
- `GET /api/applications/<adhaar>` - Get user applications
- `GET /api/applications` - Get all applications (filter by status)
- `PUT /api/applications/<app_id>` - Update application status

### Health Check
- `GET /api/health` - Check MongoDB connection status

## ML Algorithm Details

### Qualification Hierarchy (KG to PG)
1. KG
2. Pre-Primary
3. Primary
4. Secondary
5. Higher Secondary
6. Diploma
7. B.Tech
8. B.Sc
9. B.A
10. M.Tech
11. M.Sc
12. M.A
13. MBA
14. PhD
15. PG

### Job Recommendation Score (0-100)
\`\`\`
Final Score = (qual_score × 0.6) + (exp_score × 0.3) + (location_score × 0.1)

Example:
- User: B.Tech | Job: B.Tech - M.Tech | 3 years exp
- Qualification Match: 90 (perfect fit)
- Experience Match: 85 (meets requirement)
- Location Match: 50 (available)
- Final Score: (90 × 0.6) + (85 × 0.3) + (50 × 0.1) = 84.5 ≈ 85
\`\`\`

## MongoDB Collections Schema

### users
\`\`\`javascript
{
  _id: ObjectId,
  adhaar: String (unique),
  name: String,
  email: String,
  qualification: String,
  phone: String,
  experience: Number,
  created_at: ISO Date
}
\`\`\`

### jobs
\`\`\`javascript
{
  _id: ObjectId,
  title: String,
  department: String,
  description: String,
  minQualification: String,
  maxQualification: String,
  salary: String,
  location: String,
  requirements: [String],
  postedBy: String,
  postedDate: ISO Date,
  status: String (Active/Inactive)
}
\`\`\`

### applications
\`\`\`javascript
{
  _id: ObjectId,
  jobId: String,
  adhaar: String,
  fullName: String,
  email: String,
  phone: String,
  experience: Number,
  coverLetter: String,
  resume: String,
  status: String (Pending/Selected/Rejected),
  appliedDate: ISO Date
}
\`\`\`

### admins
\`\`\`javascript
{
  _id: ObjectId,
  admin_id: String (unique),
  password: String,
  email: String,
  name: String,
  created_at: ISO Date
}
\`\`\`

## Testing the Application

### User Flow
1. Go to http://localhost:3000
2. Register as new user with any 12-digit Adhaar number
3. Login with same Adhaar number
4. Browse available jobs and check eligibility
5. View recommended jobs (ML-based on your qualification)
6. Apply for eligible jobs
7. Track application status (updates every 5 seconds)

### Admin Flow
1. Click "Admin Login"
2. Login with:
   - ID: `Neelima`
   - Password: `Admin@neelu`
3. Post new jobs
4. Add new admin users
5. View pending applications
6. Select or reject applicants
7. Monitor accepted/rejected candidates

## Real-Time Features
- Frontend automatically refreshes every 5 seconds
- New jobs appear instantly on user dashboards
- Application status updates in real-time
- Live connection to MongoDB
- Automatic collection initialization on first run

## Troubleshooting

### MongoDB Connection Error
- **Issue**: `Failed to connect to MongoDB`
- **Solution**:
  1. Verify internet connection
  2. Check MongoDB Atlas cluster is active
  3. Ensure your IP is whitelisted in MongoDB Atlas
  4. Verify MongoDB URI is correct in `backend/config.py`

### Flask Server Won't Start
- **Issue**: `Port 5000 already in use`
- **Solution**:
  \`\`\`bash
  # Find process using port 5000
  lsof -i :5000
  # Kill the process
  kill -9 <PID>
  # Try again
  python app.py
  \`\`\`

### Frontend Can't Connect to Backend
- **Issue**: `Failed to load data. Make sure Flask server is running`
- **Solution**:
  1. Ensure Flask server is running on http://localhost:5000
  2. Check CORS is enabled (enabled by default)
  3. Verify both terminals are running
  4. Check browser console for errors

### Data Not Persisting
- **Issue**: Data disappears after restart
- **Solution**:
  1. Verify MongoDB connection logs show "Connected successfully!"
  2. Check MongoDB collections exist in MongoDB Atlas
  3. Ensure network allows MongoDB access

## Production Deployment

For production deployment:
1. Update Flask DEBUG to False in `backend/config.py`
2. Use environment variables for MongoDB URI
3. Set up proper authentication (JWT tokens)
4. Deploy Flask on Heroku, AWS, or DigitalOcean
5. Deploy React on Vercel or Netlify
6. Update `API_BASE_URL` in frontend to production Flask URL
7. Set up CORS for production domain

## Dependencies

### Backend (Python)
- Flask==2.3.0
- Flask-CORS==4.0.0
- pymongo==4.5.0

### Frontend (Node.js)
- React 18+
- Next.js 14+
- TypeScript
- Tailwind CSS
- Shadcn/ui components

## Support
If you encounter issues:
1. Check Flask server console for error logs
2. Verify MongoDB connection status with health check: `http://localhost:5000/api/health`
3. Check browser console (F12) for frontend errors
4. Ensure both services are running on correct ports (3000 and 5000)
5. Verify admin credentials: ID: `Neelima`, Password: `Admin@neelu`
