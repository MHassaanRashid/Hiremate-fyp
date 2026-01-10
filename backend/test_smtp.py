from app.services.email_service import email_service
from app.core.config import Config
import sys

def test_real_sending():
    print("--- SMTP Connectivity Test ---")
    print(f"Host: {Config.SMTP_HOST}")
    print(f"Port: {Config.SMTP_PORT}")
    print(f"User: {Config.SMTP_USER}")
    
    if not Config.SMTP_USER or not Config.SMTP_PASS:
        print("Error: SMTP_USER or SMTP_PASS is missing in .env file.")
        sys.exit(1)

    print("\nAttempting to send a test email to yourself...")
    
    details = {
        "job_title": "Test Connection",
        "company_name": "HireMate Local System",
        "scheduled_at": "Right Now",
        "zoom_link": "https://example.com/test",
        "interviewer_name": "HireMate Bot",
        "other_party_name": "System Administrator"
    }

    success = email_service.send_interview_scheduled_email(
        recipient_email=Config.SMTP_FROM,
        recipient_name="HireMate Admin",
        role="candidate", # Using candidate template for test
        details=details
    )

    if success:
        print("\nSUCCESS! Check your inbox.")
    else:
        print("\nFAILED. Please check your credentials and firewall settings.")

if __name__ == "__main__":
    test_real_sending()
