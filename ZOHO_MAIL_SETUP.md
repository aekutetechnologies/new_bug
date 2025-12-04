# Zoho Mail Setup Guide

This guide explains how to configure Zoho Mail for email verification in the Bugbear application.

## Environment Variables

Add the following environment variables to your `.env` file in the `backend` directory:

```env
# Zoho Mail Configuration
ZOHO_MAIL_HOST=smtp.zoho.com
ZOHO_MAIL_PORT=587
ZOHO_MAIL_EMAIL=your-email@yourdomain.com
ZOHO_MAIL_PASSWORD=your-app-specific-password
```

## Steps to Configure Zoho Mail

### 1. Create a Zoho Mail Account
- Sign up at [https://www.zoho.com/mail/](https://www.zoho.com/mail/)
- Verify your domain (if using custom domain) or use Zoho's domain

### 2. Generate App-Specific Password
- Go to Zoho Account Settings
- Navigate to Security → App Passwords
- Generate a new app-specific password for SMTP
- **Important**: Use the app-specific password, not your regular account password

### 3. Configure SMTP Settings
- **Host**: `smtp.zoho.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **Email**: Your Zoho email address
- **Password**: App-specific password from step 2

### 4. Update Environment Variables
Add the credentials to your `.env` file:

```env
ZOHO_MAIL_HOST=smtp.zoho.com
ZOHO_MAIL_PORT=587
ZOHO_MAIL_EMAIL=noreply@bugbear.in
ZOHO_MAIL_PASSWORD=your-app-specific-password-here
```

### 5. Test the Configuration
The email service will automatically fall back to console output if Zoho credentials are not configured, which is useful for development.

## Features Implemented

### Email Verification Codes
- **6-digit codes** are generated and sent via email
- Codes expire after **10 minutes**
- Maximum **5 verification attempts** per code
- Codes are automatically invalidated after use

### Use Cases
1. **Sign Up**: Users must verify their email during registration
2. **Forgot Password**: Users receive a code to reset their password
3. **Change Password**: Users must verify their email before changing password

## API Endpoints

### Send Verification Code
```
POST /api/auth/send-verification-code/
Body: {
  "email": "user@example.com",
  "verification_type": "signup" | "forgot_password" | "change_password"
}
```

### Verify Code
```
POST /api/auth/verify-code/
Body: {
  "email": "user@example.com",
  "code": "123456",
  "verification_type": "signup" | "forgot_password" | "change_password"
}
```

### Forgot Password
```
POST /api/auth/forgot-password/
Body: {
  "email": "user@example.com"
}
```

### Reset Password
```
POST /api/auth/reset-password/
Body: {
  "email": "user@example.com",
  "code": "123456",
  "new_password": "newpassword123",
  "new_password_confirm": "newpassword123"
}
```

## Development Mode

If Zoho Mail credentials are not configured, the system will:
- Print verification codes to the console
- Still function for testing purposes
- Allow you to see codes in the terminal output

## Troubleshooting

### Email Not Sending
1. Check that all environment variables are set correctly
2. Verify the app-specific password is correct
3. Ensure port 587 is not blocked by firewall
4. Check Zoho account security settings

### Codes Not Working
1. Verify codes haven't expired (10-minute limit)
2. Check that codes haven't exceeded 5 attempts
3. Ensure codes haven't already been used

## Security Notes

- Codes are stored securely in the database
- Codes are automatically cleaned up after expiration
- Failed attempts are tracked to prevent brute force attacks
- Each code can only be used once

