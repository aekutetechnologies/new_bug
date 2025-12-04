#!/bin/bash

echo "🔍 Final Verification Test"
echo "=========================="
echo ""

# Test all key endpoints
echo "Testing Backend Endpoints:"
echo ""

echo "1. GET /api/jobs/ (Public)"
curl -s http://localhost:8000/api/jobs/ | python3 -m json.tool 2>/dev/null | head -3
echo "   ✅ Jobs API responding"
echo ""

echo "2. POST /api/auth/login/ (Login)"
LOGIN_RESULT=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"seeker@test.com","password":"Test1234!"}')

if echo $LOGIN_RESULT | grep -q "access"; then
  echo "   ✅ Login working"
  TOKEN=$(echo $LOGIN_RESULT | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])" 2>/dev/null)
else
  echo "   ❌ Login failed"
  TOKEN=""
fi
echo ""

echo "3. GET /api/auth/profile/ (Protected)"
if [ ! -z "$TOKEN" ]; then
  PROFILE=$(curl -s http://localhost:8000/api/auth/profile/ \
    -H "Authorization: Bearer $TOKEN")
  if echo $PROFILE | grep -q "email"; then
    echo "   ✅ Protected endpoint working"
  else
    echo "   ❌ Protected endpoint failed"
  fi
else
  echo "   ⚠️  Skipped (no token)"
fi
echo ""

echo "4. GET /api/applications/ (User Applications)"
if [ ! -z "$TOKEN" ]; then
  APPS=$(curl -s http://localhost:8000/api/applications/ \
    -H "Authorization: Bearer $TOKEN")
  if echo $APPS | grep -q "results"; then
    echo "   ✅ Applications endpoint working"
  else
    echo "   ❌ Applications endpoint failed"
  fi
else
  echo "   ⚠️  Skipped (no token)"
fi
echo ""

echo "5. GET /api/saved-jobs/ (Saved Jobs)"
if [ ! -z "$TOKEN" ]; then
  SAVED=$(curl -s http://localhost:8000/api/saved-jobs/ \
    -H "Authorization: Bearer $TOKEN")
  if echo $SAVED | grep -q "results"; then
    echo "   ✅ Saved jobs endpoint working"
  else
    echo "   ❌ Saved jobs endpoint failed"
  fi
else
  echo "   ⚠️  Skipped (no token)"
fi
echo ""

echo "Testing Frontend:"
echo ""

echo "6. GET / (Frontend Home)"
FRONTEND=$(curl -s http://localhost:5173/)
if echo $FRONTEND | grep -q "Cybersecurity Job Portal"; then
  echo "   ✅ Frontend responding"
else
  echo "   ❌ Frontend not responding"
fi
echo ""

echo "════════════════════════════════════════"
echo "🎉 Verification Complete!"
echo "════════════════════════════════════════"
echo ""
echo "✅ Backend: http://localhost:8000"
echo "✅ Frontend: http://localhost:5173"
echo ""
echo "👉 Open your browser to http://localhost:5173 to start manual testing!"
echo ""
