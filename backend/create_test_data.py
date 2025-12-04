#!/usr/bin/env python
"""
Script to create test data for the Cybersecurity Job Portal
Run this from the backend directory after migrations are applied
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from jobs.models import Job, Application
from datetime import datetime, timedelta

User = get_user_model()

def create_test_data():
    print("🔧 Creating test data for Cybersecurity Job Portal...")
    
    # Create test users
    print("\n👤 Creating test users...")
    
    # Job Seeker 1
    seeker1, created = User.objects.get_or_create(
        email='seeker@test.com',
        defaults={
            'user_type': 'individual',
            'first_name': 'John',
            'last_name': 'Seeker',
            'phone': '+1-555-0101',
            'bio': 'Experienced cybersecurity professional seeking new opportunities',
            'skills': ['Python', 'Network Security', 'SIEM', 'Penetration Testing'],
            'location': 'New York, NY'
        }
    )
    if created:
        seeker1.set_password('Test1234!')
        seeker1.save()
        print(f"✅ Created: {seeker1.email}")
    else:
        print(f"⏭️  Already exists: {seeker1.email}")
    
    # Job Seeker 2 (Organization)
    seeker2, created = User.objects.get_or_create(
        email='org-seeker@test.com',
        defaults={
            'user_type': 'org_seeker',
            'first_name': 'Alice',
            'last_name': 'Corporate',
            'company_name': 'Tech Solutions Inc',
            'phone': '+1-555-0102',
            'bio': 'Organization seeking cybersecurity positions',
            'location': 'San Francisco, CA'
        }
    )
    if created:
        seeker2.set_password('Test1234!')
        seeker2.save()
        print(f"✅ Created: {seeker2.email}")
    else:
        print(f"⏭️  Already exists: {seeker2.email}")
    
    # Job Provider
    provider, created = User.objects.get_or_create(
        email='provider@test.com',
        defaults={
            'user_type': 'org_provider',
            'first_name': 'Bob',
            'last_name': 'Manager',
            'company_name': 'CyberCorp Industries',
            'phone': '+1-555-0103',
            'bio': 'Leading cybersecurity firm hiring top talent',
            'website': 'https://cybercorp.example.com',
            'location': 'Austin, TX'
        }
    )
    if created:
        provider.set_password('Test1234!')
        provider.save()
        print(f"✅ Created: {provider.email}")
    else:
        print(f"⏭️  Already exists: {provider.email}")
    
    # Create test jobs
    print("\n💼 Creating test jobs...")
    
    job1, created = Job.objects.get_or_create(
        title='Senior Security Analyst',
        created_by=provider,
        defaults={
            'description': 'We are seeking an experienced Senior Security Analyst to join our team. You will be responsible for monitoring security events, conducting threat analysis, and implementing security controls.',
            'requirements': '5+ years of experience in cybersecurity\nStrong knowledge of SIEM tools\nExperience with incident response\nCEH or CISSP certification preferred',
            'responsibilities': 'Monitor security alerts and events\nConduct security assessments\nDevelop security policies\nLead incident response activities',
            'location': 'Remote',
            'job_type': 'full_time',
            'experience_level': 'senior',
            'salary_min': 100000,
            'salary_max': 150000,
            'skills_required': ['SIEM', 'Incident Response', 'Threat Analysis', 'Network Security'],
            'application_deadline': (datetime.now() + timedelta(days=30)).date(),
            'is_active': True
        }
    )
    print(f"{'✅ Created' if created else '⏭️  Already exists'}: {job1.title}")
    
    job2, created = Job.objects.get_or_create(
        title='Penetration Tester',
        created_by=provider,
        defaults={
            'description': 'Looking for a skilled Penetration Tester to identify vulnerabilities in our clients systems and help them improve their security posture.',
            'requirements': '3+ years of penetration testing experience\nProficiency with Metasploit, Burp Suite, and other testing tools\nOSCP certification required',
            'responsibilities': 'Conduct penetration tests\nWrite detailed reports\nProvide remediation recommendations\nStay updated on latest vulnerabilities',
            'location': 'Austin, TX',
            'job_type': 'full_time',
            'experience_level': 'mid',
            'salary_min': 80000,
            'salary_max': 120000,
            'skills_required': ['Penetration Testing', 'Burp Suite', 'Metasploit', 'Python'],
            'application_deadline': (datetime.now() + timedelta(days=45)).date(),
            'is_active': True
        }
    )
    print(f"{'✅ Created' if created else '⏭️  Already exists'}: {job2.title}")
    
    job3, created = Job.objects.get_or_create(
        title='Security Operations Center (SOC) Manager',
        created_by=provider,
        defaults={
            'description': 'We need an experienced SOC Manager to lead our 24/7 security operations team. You will oversee threat detection, incident response, and team development.',
            'requirements': '7+ years in cybersecurity with 3+ years in management\nDeep understanding of SOC operations\nExperience with SIEM, EDR, and SOAR platforms\nCISSP or equivalent certification',
            'responsibilities': 'Manage SOC team\nOversee incident response\nDevelop SOC procedures\nReport to C-level executives',
            'location': 'New York, NY',
            'job_type': 'full_time',
            'experience_level': 'lead',
            'salary_min': 150000,
            'salary_max': 200000,
            'skills_required': ['SOC Management', 'Incident Response', 'Team Leadership', 'SIEM'],
            'application_deadline': (datetime.now() + timedelta(days=60)).date(),
            'is_active': True
        }
    )
    print(f"{'✅ Created' if created else '⏭️  Already exists'}: {job3.title}")
    
    job4, created = Job.objects.get_or_create(
        title='Junior Security Engineer',
        created_by=provider,
        defaults={
            'description': 'Entry-level position for recent graduates or those starting their cybersecurity career. You will work alongside senior engineers to learn and grow.',
            'requirements': 'BS in Computer Science or related field\nBasic understanding of networking and security concepts\nEagerness to learn\nSecurity+ or similar certification a plus',
            'responsibilities': 'Assist with security monitoring\nHelp configure security tools\nParticipate in security assessments\nDocument security procedures',
            'location': 'Remote',
            'job_type': 'full_time',
            'experience_level': 'entry',
            'salary_min': 60000,
            'salary_max': 80000,
            'skills_required': ['Network Security', 'Linux', 'Python', 'Security Fundamentals'],
            'application_deadline': (datetime.now() + timedelta(days=90)).date(),
            'is_active': True
        }
    )
    print(f"{'✅ Created' if created else '⏭️  Already exists'}: {job4.title}")
    
    # Create test applications
    print("\n📝 Creating test applications...")
    
    app1, created = Application.objects.get_or_create(
        job=job1,
        applicant=seeker1,
        defaults={
            'cover_letter': 'I am very interested in the Senior Security Analyst position. With over 5 years of experience in cybersecurity and extensive work with SIEM tools, I believe I would be a great fit for your team.',
            'status': 'submitted'
        }
    )
    print(f"{'✅ Created' if created else '⏭️  Already exists'}: Application from {seeker1.email} for {job1.title}")
    
    app2, created = Application.objects.get_or_create(
        job=job4,
        applicant=seeker2,
        defaults={
            'cover_letter': 'Our organization is seeking opportunities for our team members. We are interested in the Junior Security Engineer position.',
            'status': 'under_review'
        }
    )
    print(f"{'✅ Created' if created else '⏭️  Already exists'}: Application from {seeker2.email} for {job4.title}")
    
    print("\n✅ Test data creation complete!")
    print("\n📊 Summary:")
    print(f"   Users: {User.objects.count()}")
    print(f"   Jobs: {Job.objects.count()}")
    print(f"   Applications: {Application.objects.count()}")
    
    print("\n🔑 Test Account Credentials:")
    print("   Job Seeker 1:")
    print("     Email: seeker@test.com")
    print("     Password: Test1234!")
    print()
    print("   Organization Seeker:")
    print("     Email: org-seeker@test.com")
    print("     Password: Test1234!")
    print()
    print("   Job Provider:")
    print("     Email: provider@test.com")
    print("     Password: Test1234!")
    print()


if __name__ == '__main__':
    create_test_data()

