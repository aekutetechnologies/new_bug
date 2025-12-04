#!/usr/bin/env python
"""
Comprehensive API Testing Script
Tests all endpoints of the Cybersecurity Job Portal API
"""

import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

class APITester:
    def __init__(self):
        self.access_token = None
        self.refresh_token = None
        self.seeker_token = None
        self.provider_token = None
        self.test_job_id = None
        self.test_application_id = None
    
    def test_server_health(self):
        """Test if server is responding"""
        print("\n" + "="*60)
        print("🔍 TESTING SERVER HEALTH")
        print("="*60)
        
        try:
            response = requests.get(f'{API_URL}/jobs/', timeout=5)
            if response.status_code in [200, 401, 403]:
                print_success("Server is responding")
                return True
            else:
                print_error(f"Unexpected status code: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print_error("Cannot connect to server. Is it running on port 8000?")
            return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        print("\n" + "="*60)
        print("👤 TESTING USER REGISTRATION")
        print("="*60)
        
        # Test registering a new user
        new_user = {
            "email": f"testuser_{datetime.now().timestamp()}@test.com",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
            "user_type": "individual",
            "first_name": "Test",
            "last_name": "User"
        }
        
        try:
            response = requests.post(f'{API_URL}/auth/register/', json=new_user)
            if response.status_code == 201:
                data = response.json()
                print_success("User registration successful")
                print_info(f"User email: {data['user']['email']}")
                if 'tokens' in data:
                    print_info("JWT tokens received")
                    self.access_token = data['tokens']['access']
                return True
            else:
                print_error(f"Registration failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        print("\n" + "="*60)
        print("🔐 TESTING USER LOGIN")
        print("="*60)
        
        # Test with seeker account
        login_data = {
            "email": "seeker@test.com",
            "password": "Test1234!"
        }
        
        try:
            response = requests.post(f'{API_URL}/auth/login/', json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.seeker_token = data['access']
                self.refresh_token = data['refresh']
                print_success("Seeker login successful")
                print_info(f"Access token received: {self.seeker_token[:20]}...")
                return True
            else:
                print_error(f"Login failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_provider_login(self):
        """Login as provider"""
        print("\n" + "="*60)
        print("🏢 TESTING PROVIDER LOGIN")
        print("="*60)
        
        login_data = {
            "email": "provider@test.com",
            "password": "Test1234!"
        }
        
        try:
            response = requests.post(f'{API_URL}/auth/login/', json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.provider_token = data['access']
                print_success("Provider login successful")
                return True
            else:
                print_error(f"Provider login failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_get_profile(self):
        """Test getting user profile"""
        print("\n" + "="*60)
        print("👁️  TESTING GET PROFILE")
        print("="*60)
        
        if not self.seeker_token:
            print_warning("Skipping: No auth token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.seeker_token}'}
        
        try:
            response = requests.get(f'{API_URL}/auth/profile/', headers=headers)
            if response.status_code == 200:
                data = response.json()
                print_success("Profile retrieved successfully")
                print_info(f"User: {data.get('email')}")
                print_info(f"Type: {data.get('user_type')}")
                return True
            else:
                print_error(f"Get profile failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_list_jobs(self):
        """Test listing jobs"""
        print("\n" + "="*60)
        print("💼 TESTING LIST JOBS")
        print("="*60)
        
        try:
            response = requests.get(f'{API_URL}/jobs/')
            if response.status_code == 200:
                data = response.json()
                jobs = data.get('results', data) if isinstance(data, dict) else data
                print_success(f"Jobs retrieved: {len(jobs)} jobs found")
                if jobs:
                    self.test_job_id = jobs[0]['id']
                    print_info(f"Sample job: {jobs[0]['title']}")
                return True
            else:
                print_error(f"List jobs failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_get_job_details(self):
        """Test getting job details"""
        print("\n" + "="*60)
        print("📄 TESTING GET JOB DETAILS")
        print("="*60)
        
        if not self.test_job_id:
            print_warning("Skipping: No job ID available")
            return False
        
        try:
            response = requests.get(f'{API_URL}/jobs/{self.test_job_id}/')
            if response.status_code == 200:
                data = response.json()
                print_success("Job details retrieved")
                print_info(f"Title: {data.get('title')}")
                print_info(f"Location: {data.get('location')}")
                print_info(f"Salary: ${data.get('salary_min')} - ${data.get('salary_max')}")
                return True
            else:
                print_error(f"Get job details failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_create_job(self):
        """Test creating a job (provider only)"""
        print("\n" + "="*60)
        print("➕ TESTING CREATE JOB")
        print("="*60)
        
        if not self.provider_token:
            print_warning("Skipping: No provider token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.provider_token}'}
        new_job = {
            "title": "Test Security Position",
            "description": "This is a test job posting",
            "requirements": "Test requirements",
            "location": "Remote",
            "job_type": "full_time",
            "experience_level": "mid",
            "salary_min": 75000,
            "salary_max": 95000,
            "skills_required": ["Python", "Security"],
            "is_active": True
        }
        
        try:
            response = requests.post(f'{API_URL}/jobs/', json=new_job, headers=headers)
            if response.status_code == 201:
                data = response.json()
                print_success("Job created successfully")
                print_info(f"Job ID: {data.get('id')}")
                return True
            else:
                print_error(f"Create job failed: {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_list_applications(self):
        """Test listing user applications"""
        print("\n" + "="*60)
        print("📝 TESTING LIST APPLICATIONS")
        print("="*60)
        
        if not self.seeker_token:
            print_warning("Skipping: No seeker token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.seeker_token}'}
        
        try:
            response = requests.get(f'{API_URL}/applications/', headers=headers)
            if response.status_code == 200:
                data = response.json()
                apps = data.get('results', data) if isinstance(data, dict) else data
                print_success(f"Applications retrieved: {len(apps)} applications found")
                if apps:
                    self.test_application_id = apps[0]['id']
                    print_info(f"Sample application: {apps[0]['job']['title']}")
                    print_info(f"Status: {apps[0]['status']}")
                return True
            else:
                print_error(f"List applications failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_provider_jobs(self):
        """Test provider's jobs list"""
        print("\n" + "="*60)
        print("🏢 TESTING PROVIDER JOBS")
        print("="*60)
        
        if not self.provider_token:
            print_warning("Skipping: No provider token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.provider_token}'}
        
        try:
            response = requests.get(f'{API_URL}/provider/jobs/', headers=headers)
            if response.status_code == 200:
                data = response.json()
                jobs = data.get('results', data) if isinstance(data, dict) else data
                print_success(f"Provider jobs retrieved: {len(jobs)} jobs found")
                return True
            else:
                print_error(f"Get provider jobs failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def test_provider_applicants(self):
        """Test provider's applicants list"""
        print("\n" + "="*60)
        print("📋 TESTING PROVIDER APPLICANTS")
        print("="*60)
        
        if not self.provider_token:
            print_warning("Skipping: No provider token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.provider_token}'}
        
        try:
            response = requests.get(f'{API_URL}/provider/applicants/', headers=headers)
            if response.status_code == 200:
                data = response.json()
                applicants = data.get('results', data) if isinstance(data, dict) else data
                print_success(f"Applicants retrieved: {len(applicants)} applicants found")
                if applicants:
                    print_info(f"Sample applicant: {applicants[0]['applicant']['email']}")
                return True
            else:
                print_error(f"Get applicants failed: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("🚀 STARTING COMPREHENSIVE API TESTS")
        print("="*60)
        
        results = {}
        
        # Test server health
        results['Server Health'] = self.test_server_health()
        if not results['Server Health']:
            print_error("\n❌ Server not responding. Please start the server with:")
            print_info("   cd backend && source venv/bin/activate && python manage.py runserver")
            return
        
        # Authentication tests
        results['User Registration'] = self.test_user_registration()
        results['User Login'] = self.test_user_login()
        results['Provider Login'] = self.test_provider_login()
        
        # Profile tests
        results['Get Profile'] = self.test_get_profile()
        
        # Job tests
        results['List Jobs'] = self.test_list_jobs()
        results['Get Job Details'] = self.test_get_job_details()
        results['Create Job'] = self.test_create_job()
        
        # Application tests
        results['List Applications'] = self.test_list_applications()
        
        # Provider tests
        results['Provider Jobs'] = self.test_provider_jobs()
        results['Provider Applicants'] = self.test_provider_applicants()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{status}: {test_name}")
        
        print(f"\nTotal: {passed}/{total} tests passed ({(passed/total*100):.1f}%)")
        
        if passed == total:
            print_success("\n🎉 All tests passed!")
        else:
            print_warning(f"\n⚠️  {total - passed} test(s) failed")

if __name__ == '__main__':
    tester = APITester()
    tester.run_all_tests()

