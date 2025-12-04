# Quick Start Guide - Cybersecurity Job Portal

Get the application running in under 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- 8GB RAM minimum
- Ports 80 and 8000 available

## Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./SETUP.sh

# Start the application
docker-compose up
```

That's it! Access the application at http://localhost

## Option 2: Manual Setup

### 1. Create Environment Files

Create `.env` in project root:
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost
GOOGLE_OAUTH_CLIENT_ID=optional
GOOGLE_OAUTH_CLIENT_SECRET=optional
CRYPTOGRAPHY_KEY=your-32-char-encryption-key
```

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=optional
```

### 2. Build and Run

```bash
# Build containers
docker-compose build

# Start application
docker-compose up
```

### 3. Initialize Database

In another terminal:
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## First Steps

### 1. Create Test Accounts

Visit http://localhost/register and create:

**Job Provider Account:**
- Email: provider@test.com
- Password: Test1234!
- User Type: Organization Job Provider
- Company Name: Test Corp

**Job Seeker Account:**
- Email: seeker@test.com
- Password: Test1234!
- User Type: Individual Job Seeker

### 2. Create a Job (as Provider)

1. Login as provider@test.com
2. Go to "My Jobs"
3. Click "Create New Job"
4. Fill in job details:
   - Title: Security Analyst
   - Description: Looking for security analyst...
   - Location: Remote
   - Job Type: Full Time
   - Experience: Mid Level
   - Salary: 80000 - 120000
5. Submit

### 3. Apply for Job (as Seeker)

1. Logout and login as seeker@test.com
2. Go to "Jobs"
3. Click on the job you created
4. Click "Apply"
5. Fill in cover letter and upload resume
6. Submit application

### 4. Approve Application (as Provider)

1. Logout and login as provider@test.com
2. Go to "Applicants"
3. Find the application
4. Click "Approve"

### 5. Setup VDI (Optional - Requires AWS/Azure)

**Add Cloud Credentials:**
1. Go to "My VDIs"
2. Click "Add Credentials"
3. Select cloud provider (AWS or Azure)
4. Enter your cloud credentials
5. Test and save

**Create Workspace:**
1. Click "Create Workspace"
2. Select the approved application
3. Choose cloud credential
4. Select OS type (Ubuntu/Windows)
5. Enter workspace details
6. Create

**View Workspace (as Seeker):**
1. Login as seeker@test.com
2. Go to "My Workspaces"
3. View connection details
4. Connect to your VDI

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Remove all data (reset)
docker-compose down -v

# Access Django shell
docker-compose exec backend python manage.py shell

# Run backend tests
docker-compose exec backend python manage.py test

# Access backend bash
docker-compose exec backend bash

# Rebuild after code changes
docker-compose up --build
```

## Troubleshooting

**Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

**Frontend can't connect to backend:**
- Check VITE_API_URL in frontend/.env
- Ensure CORS_ALLOWED_ORIGINS includes frontend URL
- Restart docker-compose

**Database errors:**
```bash
# Reset database
docker-compose down -v
docker-compose up
docker-compose exec backend python manage.py migrate
```

**Permission errors:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

## Default Admin Access

Create superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

Access Django Admin at: http://localhost:8000/admin

## API Testing

Use the browsable API at: http://localhost:8000/api/

Example endpoints:
- http://localhost:8000/api/jobs/
- http://localhost:8000/api/applications/
- http://localhost:8000/api/workspaces/

## Next Steps

1. ✅ Review [README.md](README.md) for detailed documentation
2. ✅ Follow [TESTING.md](TESTING.md) for comprehensive testing
3. ✅ Configure Google OAuth for SSO (optional)
4. ✅ Set up AWS WorkSpaces for VDI features
5. ✅ Customize the application for your needs

## Production Deployment

For production deployment:

1. Set `DEBUG=False`
2. Generate strong `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Use PostgreSQL instead of SQLite
5. Configure proper SSL/TLS
6. Set up monitoring and logging
7. Enable email notifications
8. Configure backup strategy

See README.md for detailed production setup.

## Support

- Documentation: README.md
- Testing Guide: TESTING.md
- Issues: Create an issue on GitHub
- Email: support@example.com

## Features Checklist

- [x] User registration (3 types)
- [x] JWT authentication
- [x] Google SSO (configurable)
- [x] Job CRUD operations
- [x] Application workflow
- [x] Saved jobs
- [x] AWS WorkSpaces integration
- [x] Azure VDI integration
- [x] Per-provider cloud credentials
- [x] Workspace management
- [x] Responsive UI
- [x] Docker deployment

Happy coding! 🚀

