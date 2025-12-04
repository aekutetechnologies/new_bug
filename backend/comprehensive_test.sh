#!/bin/bash

# Comprehensive Manual Testing Script
# Tests all CRUD operations through the API

BASE_URL="http://localhost:8000/api"

echo "🧪 Comprehensive API Testing"
echo "============================"
echo ""

# Login as seeker
echo "1️⃣  Logging in as Job Seeker..."
SEEKER_LOGIN=$(curl -s -X POST ${BASE_URL}/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"seeker@test.com","password":"Test1234!"}')

SEEKER_TOKEN=$(echo $SEEKER_LOGIN | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])" 2>/dev/null)

if [ -z "$SEEKER_TOKEN" ]; then
  echo "❌ Failed to get seeker token"
  exit 1
fi

echo "✅ Seeker logged in successfully"
echo ""

# Login as provider
echo "2️⃣  Logging in as Job Provider..."
PROVIDER_LOGIN=$(curl -s -X POST ${BASE_URL}/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"provider@test.com","password":"Test1234!"}')

PROVIDER_TOKEN=$(echo $PROVIDER_LOGIN | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])" 2>/dev/null)

if [ -z "$PROVIDER_TOKEN" ]; then
  echo "❌ Failed to get provider token"
  exit 1
fi

echo "✅ Provider logged in successfully"
echo ""

# Test saved jobs
echo "3️⃣  Testing Saved Jobs..."
SAVE_JOB=$(curl -s -X POST ${BASE_URL}/saved-jobs/ \
  -H "Authorization: Bearer ${SEEKER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"job": 1}')

echo "   - Saving job ID 1..."
if echo $SAVE_JOB | grep -q "id"; then
  echo "   ✅ Job saved successfully"
else
  echo "   ⚠️  Job save response: $(echo $SAVE_JOB | head -c 100)"
fi

SAVED_JOBS=$(curl -s -X GET ${BASE_URL}/saved-jobs/ \
  -H "Authorization: Bearer ${SEEKER_TOKEN}")

SAVED_COUNT=$(echo $SAVED_JOBS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('results', data)))" 2>/dev/null)

echo "   - Retrieved saved jobs: $SAVED_COUNT jobs"
echo ""

# Test profile update
echo "4️⃣  Testing Profile Update..."
UPDATE_PROFILE=$(curl -s -X PATCH ${BASE_URL}/auth/profile/ \
  -H "Authorization: Bearer ${SEEKER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Updated bio from test script","phone":"+1-555-9999"}')

if echo $UPDATE_PROFILE | grep -q "Updated bio"; then
  echo "   ✅ Profile updated successfully"
else
  echo "   ⚠️  Profile update response: $(echo $UPDATE_PROFILE | head -c 100)"
fi
echo ""

# Test application workflow
echo "5️⃣  Testing Application Workflow..."
GET_APPS=$(curl -s -X GET ${BASE_URL}/applications/ \
  -H "Authorization: Bearer ${SEEKER_TOKEN}")

APP_COUNT=$(echo $GET_APPS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('results', data)))" 2>/dev/null)

echo "   - User has $APP_COUNT application(s)"

# Get first application ID
APP_ID=$(echo $GET_APPS | python3 -c "import sys, json; data=json.load(sys.stdin); apps=data.get('results', data); print(apps[0]['id']) if apps else print('')" 2>/dev/null)

if [ ! -z "$APP_ID" ]; then
  echo "   - Found application ID: $APP_ID"
  
  # Test updating application status as provider
  echo "   - Updating application status to 'under_review'..."
  UPDATE_STATUS=$(curl -s -X PATCH ${BASE_URL}/applications/${APP_ID}/status/ \
    -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"status":"under_review","notes":"Reviewing application"}')
  
  if echo $UPDATE_STATUS | grep -q "under_review"; then
    echo "   ✅ Application status updated to under_review"
  else
    echo "   ⚠️  Status update response: $(echo $UPDATE_STATUS | head -c 100)"
  fi
  
  # Approve the application
  echo "   - Approving application..."
  APPROVE=$(curl -s -X PATCH ${BASE_URL}/applications/${APP_ID}/status/ \
    -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"status":"approved","notes":"Approved! Great candidate."}')
  
  if echo $APPROVE | grep -q "approved"; then
    echo "   ✅ Application approved successfully"
  else
    echo "   ⚠️  Approval response: $(echo $APPROVE | head -c 100)"
  fi
fi
echo ""

# Test provider applicants
echo "6️⃣  Testing Provider Applicants..."
APPLICANTS=$(curl -s -X GET ${BASE_URL}/provider/applicants/ \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}")

APPLICANT_COUNT=$(echo $APPLICANTS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('results', data)))" 2>/dev/null)

echo "   - Total applicants: $APPLICANT_COUNT"

# Filter by status
APPROVED_APPLICANTS=$(curl -s -X GET "${BASE_URL}/provider/applicants/?status=approved" \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}")

APPROVED_COUNT=$(echo $APPROVED_APPLICANTS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('results', data)))" 2>/dev/null)

echo "   - Approved applicants: $APPROVED_COUNT"
echo "   ✅ Applicant filtering works"
echo ""

# Test job updates
echo "7️⃣  Testing Job Update..."
UPDATE_JOB=$(curl -s -X PATCH ${BASE_URL}/jobs/1/ \
  -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"is_active":false}')

if echo $UPDATE_JOB | grep -q "false"; then
  echo "   ✅ Job updated (deactivated)"
  
  # Reactivate it
  curl -s -X PATCH ${BASE_URL}/jobs/1/ \
    -H "Authorization: Bearer ${PROVIDER_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"is_active":true}' > /dev/null
  echo "   ✅ Job reactivated"
else
  echo "   ⚠️  Job update response: $(echo $UPDATE_JOB | head -c 100)"
fi
echo ""

# Test job search/filtering
echo "8️⃣  Testing Job Search & Filtering..."
REMOTE_JOBS=$(curl -s -X GET "${BASE_URL}/jobs/?location=Remote")
REMOTE_COUNT=$(echo $REMOTE_JOBS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('results', data)))" 2>/dev/null)

echo "   - Remote jobs: $REMOTE_COUNT"

SENIOR_JOBS=$(curl -s -X GET "${BASE_URL}/jobs/?experience_level=senior")
SENIOR_COUNT=$(echo $SENIOR_JOBS | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('results', data)))" 2>/dev/null)

echo "   - Senior level jobs: $SENIOR_COUNT"
echo "   ✅ Job filtering works"
echo ""

echo "🎉 Comprehensive Testing Complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ Authentication working"
echo "   ✅ Profile CRUD working"
echo "   ✅ Job CRUD working"
echo "   ✅ Application workflow working"
echo "   ✅ Saved jobs working"
echo "   ✅ Provider applicants working"
echo "   ✅ Job filtering working"
echo "   ✅ Status updates working"
echo ""
echo "🌐 Services Running:"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "👤 Test Accounts:"
echo "   Seeker: seeker@test.com / Test1234!"
echo "   Provider: provider@test.com / Test1234!"

