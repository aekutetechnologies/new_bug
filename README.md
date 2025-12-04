# Cybersecurity Job Portal

A full-stack web application for connecting cybersecurity professionals with job opportunities, featuring integrated VDI workspace management through AWS WorkSpaces and Azure Virtual Desktop.

## 🚀 Features

### User Types
- **Individual Job Seekers**: Browse and apply for cybersecurity positions
- **Organization Job Seekers**: Apply for jobs as an organization
- **Organization Job Providers**: Post jobs, manage applicants, and provision VDI workspaces

### Core Functionality

#### Authentication
- Email/password registration and login
- JWT token-based authentication
- Google OAuth SSO integration (optional)
- Role-based access control

#### Job Management (Full CRUD)
- **Create**: Job providers can post new positions
- **Read**: All users can browse and search jobs
- **Update**: Providers can edit their job listings
- **Delete**: Providers can remove job postings
- Advanced filtering (location, salary, skills, experience level)
- Job saving for later review

#### Application Workflow
- Job seekers apply with cover letter and resume
- Providers review applications
- Status tracking: submitted → under_review → approved/rejected
- Workspace assignment upon approval

#### VDI/Workspace Management (Full CRUD)
- **Per-Provider Cloud Credentials**: Each provider stores their own AWS/Azure credentials securely
- **Multi-Cloud Support**: AWS WorkSpaces and Azure Virtual Desktop
- **Workspace Operations**:
  - Create VDI for approved applicants
  - Start/Stop/Restart workspaces
  - Terminate workspaces
  - View connection details
- **Encrypted Storage**: Cloud credentials encrypted using django-cryptography
- **OS Support**: Ubuntu and Windows VDIs

## 🛠 Tech Stack

### Backend
- **Framework**: Django 5 + Django REST Framework
- **Authentication**: Simple JWT, django-allauth
- **Database**: SQLite (development), PostgreSQL ready
- **Cloud Integration**: boto3 (AWS), azure-mgmt-desktopvirtualization
- **Security**: django-cryptography for credential encryption

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios with JWT interceptors
- **Forms**: React Hook Form + Zod validation

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **WSGI Server**: Gunicorn

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- AWS Account with WorkSpaces enabled (for VDI features)
- Azure subscription (optional, for Azure VDI)
- Google OAuth credentials (optional, for SSO)

## 🚀 Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd new_bug
```

2. **Set up environment variables**

Backend (`.env` in project root):
```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
CRYPTOGRAPHY_KEY=your-encryption-key-32-chars-minimum
```

Frontend (create `frontend/.env`):
```bash
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

3. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

5. **Create a superuser (optional)**
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 💻 Local Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your configurations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configurations

# Run development server
npm run dev
```

Frontend will be available at http://localhost:5173

## 🔐 AWS WorkSpaces Setup

### Prerequisites

1. **AWS Account Setup**
   - Enable AWS WorkSpaces in your region
   - Create a Directory Service (Simple AD or AD Connector)
   - Set up VPC and subnets
   - Configure security groups

2. **IAM Permissions**
   Create an IAM user with the following permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "workspaces:*",
           "ds:*",
           "ec2:DescribeVpcs",
           "ec2:DescribeSubnets"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Get WorkSpace Bundles**
   ```bash
   aws workspaces describe-workspace-bundles --region us-east-1
   ```

### Configuration in Application

1. Register as an Organization Job Provider
2. Navigate to "My VDIs" page
3. Click "Add Cloud Credentials"
4. Fill in:
   - Credential Name: e.g., "My AWS Production"
   - Cloud Provider: AWS
   - Access Key ID: Your AWS access key
   - Secret Access Key: Your AWS secret key
   - Region: e.g., us-east-1
   - Directory ID: Your AWS Directory Service ID (d-xxxxxxxxx)
5. Click "Test Connection" to verify
6. Save credentials

Credentials are encrypted and stored per-provider, allowing multiple providers to use different AWS accounts.

## 🔐 Azure Virtual Desktop Setup

### Prerequisites

1. **Azure Setup**
   - Azure subscription
   - Resource group created
   - Host pool configured
   - Session hosts deployed

2. **Service Principal**
   Create a service principal with permissions:
   ```bash
   az ad sp create-for-rbac --name "bugbear-jobs-vdi" \
     --role "Desktop Virtualization Contributor" \
     --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}
   ```

### Configuration in Application

1. Navigate to "My VDIs" → "Add Cloud Credentials"
2. Select "Azure Virtual Desktop"
3. Fill in:
   - Client ID (Application ID)
   - Client Secret
   - Tenant ID
   - Subscription ID
   - Resource Group

## 📁 Project Structure

```
new_bug/
├── backend/
│   ├── config/              # Django settings
│   ├── users/               # User authentication
│   ├── jobs/                # Job management
│   ├── workspaces/          # VDI management
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # shadcn UI components
│   │   ├── pages/           # React pages
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/google/` - Google SSO
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update profile
- `DELETE /api/auth/profile/` - Delete account

### Jobs
- `GET /api/jobs/` - List jobs (with filters)
- `POST /api/jobs/` - Create job (provider only)
- `GET /api/jobs/{id}/` - Job details
- `PUT /api/jobs/{id}/` - Update job
- `DELETE /api/jobs/{id}/` - Delete job
- `GET /api/provider/jobs/` - Provider's jobs
- `GET /api/provider/applicants/` - Provider's applicants

### Applications
- `GET /api/applications/` - User's applications
- `POST /api/applications/create/` - Apply for job
- `DELETE /api/applications/{id}/` - Withdraw application
- `PATCH /api/applications/{id}/status/` - Update status (provider)

### Saved Jobs
- `GET /api/saved-jobs/` - List saved jobs
- `POST /api/saved-jobs/` - Save job
- `DELETE /api/saved-jobs/{id}/` - Unsave job

### Cloud Credentials
- `GET /api/cloud-credentials/` - List credentials (provider)
- `POST /api/cloud-credentials/` - Add credentials
- `PUT /api/cloud-credentials/{id}/` - Update credentials
- `DELETE /api/cloud-credentials/{id}/` - Delete credentials
- `POST /api/cloud-credentials/{id}/test/` - Test credentials

### Workspaces
- `GET /api/workspaces/` - List workspaces
- `POST /api/workspaces/` - Create workspace
- `POST /api/workspaces/{id}/start/` - Start workspace
- `POST /api/workspaces/{id}/stop/` - Stop workspace
- `POST /api/workspaces/{id}/restart/` - Restart workspace
- `DELETE /api/workspaces/{id}/` - Delete workspace
- `GET /api/workspaces/{id}/connection/` - Get connection details
- `GET /api/provider/workspaces/` - Provider's workspaces
- `GET /api/seeker/workspaces/` - Seeker's workspaces

## 🎨 Frontend Pages

### Public Pages
- `/` - Landing page
- `/register` - Registration
- `/login` - Login
- `/jobs` - Job listings
- `/jobs/:id` - Job details

### Job Seeker Pages
- `/seeker/applied` - Applied jobs
- `/seeker/saved` - Saved jobs
- `/seeker/workspace` - My workspaces

### Job Provider Pages
- `/provider/jobs` - My jobs (CRUD)
- `/provider/applicants` - Applicants management
- `/provider/workspaces` - My VDIs (CRUD)

### Common Pages
- `/profile` - User profile (CRUD)

## 🔒 Security Features

- JWT token-based authentication
- Encrypted cloud credentials storage
- CORS protection
- Password validation
- Rate limiting (can be added with django-ratelimit)
- SQL injection protection (Django ORM)
- XSS protection (React)

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 📝 Manual Testing Checklist

- [ ] User registration (all 3 types)
- [ ] Login with email/password
- [ ] Google SSO (if configured)
- [ ] Profile CRUD operations
- [ ] Job CRUD (provider)
- [ ] Job browsing and filtering
- [ ] Job application workflow
- [ ] Saved jobs functionality
- [ ] Application status updates
- [ ] Cloud credential management
- [ ] Workspace creation (AWS/Azure)
- [ ] Workspace start/stop/restart
- [ ] Workspace deletion
- [ ] Connection details display
- [ ] Responsive design (mobile/tablet/desktop)

## 🚀 Production Deployment

### Environment Variables for Production

1. Set `DEBUG=False`
2. Generate strong `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Configure proper `CORS_ALLOWED_ORIGINS`
5. Set up PostgreSQL database
6. Configure email backend for notifications
7. Use proper `CRYPTOGRAPHY_KEY` (32+ characters)
8. Set up SSL/TLS certificates
9. Configure proper AWS/Azure credentials

### Database Migration to PostgreSQL

Update `backend/config/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

## 🐛 Troubleshooting

### Common Issues

**Docker container won't start**
- Check if ports 80 and 8000 are available
- Verify environment variables are set
- Check Docker logs: `docker-compose logs backend`

**JWT token errors**
- Clear browser localStorage
- Check if backend is running
- Verify CORS settings

**AWS WorkSpaces creation fails**
- Verify AWS credentials
- Check Directory ID is correct
- Ensure IAM permissions are correct
- Verify VPC and subnet configuration

**Frontend can't connect to backend**
- Verify `VITE_API_URL` is set correctly
- Check CORS_ALLOWED_ORIGINS includes frontend URL
- Ensure backend is running on port 8000

## 📄 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 📞 Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: [support-email]

## 🔄 Future Enhancements

- Email notifications for application updates
- Real-time chat between employers and candidates
- Video interview scheduling
- Skills assessment tests
- Company profiles and reviews
- Advanced analytics dashboard
- Mobile applications (React Native)
- Kubernetes deployment configurations
- CI/CD pipeline setup
- Monitoring and logging integration (Sentry, ELK)

