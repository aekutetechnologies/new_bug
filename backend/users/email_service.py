import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_verification_email(email, code, verification_type):
    """
    Send verification code email using Zoho Mail
    """
    # Zoho Mail SMTP settings
    zoho_host = os.getenv('ZOHO_MAIL_HOST', 'smtp.zoho.com')
    zoho_port = int(os.getenv('ZOHO_MAIL_PORT', '587'))
    zoho_email = os.getenv('ZOHO_MAIL_EMAIL', '')
    zoho_password = os.getenv('ZOHO_MAIL_PASSWORD', '')
    
    if not zoho_email or not zoho_password:
        # Fallback to console backend for development
        print(f"Verification code for {email}: {code}")
        return True
    
    # Email subject based on verification type
    subject_map = {
        'signup': 'Verify Your Bugbear Account',
        'forgot_password': 'Reset Your Bugbear Password',
        'change_password': 'Verify Password Change',
    }
    subject = subject_map.get(verification_type, 'Bugbear Verification Code')
    
    # Email body (HTML)
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Bugbear</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
                <p style="font-size: 16px;">Your verification code is:</p>
                <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                    <h1 style="color: #667eea; font-size: 36px; letter-spacing: 5px; margin: 0;">{code}</h1>
                </div>
                <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    © 2025 Bugbear. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text body (fallback)
    text_body = f"""
    Bugbear Verification Code
    
    Your verification code is: {code}
    
    This code will expire in 10 minutes.
    If you didn't request this code, please ignore this email.
    
    © 2025 Bugbear. All rights reserved.
    """
    
    try:
        # Initialize connection to email server
        print(f"Initializing connection to email server: {zoho_host}:{zoho_port}")
        print(f"Zoho email: {zoho_email}")
        print(f"Zoho password: {zoho_password}")
        smtp = smtplib.SMTP(zoho_host, port=zoho_port)
        smtp.ehlo()  # send the extended hello to our server
        smtp.starttls()  # tell server we want to communicate with TLS encryption
        smtp.login(zoho_email, zoho_password)  # login to our email server
        print(f"Logged in to email server: {zoho_email}")
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = zoho_email
        msg['To'] = email
        
        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        print(f"Attached both plain text and HTML versions")
        # Send email
        smtp.sendmail(zoho_email, email, msg.as_string())
        smtp.quit()
        print(f"Quitted email server")
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        # Fallback to console for development
        print(f"Verification code for {email}: {code}")
        return False

