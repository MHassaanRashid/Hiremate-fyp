import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
import os
from app.core.config import Config

class EmailService:
    def __init__(self):
        self.smtp_host = Config.SMTP_HOST
        self.smtp_port = Config.SMTP_PORT
        self.smtp_user = Config.SMTP_USER
        self.smtp_pass = Config.SMTP_PASS
        self.smtp_from = Config.SMTP_FROM
        
        # Initialize Jinja2 environment
        template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "emails")
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))

    def _send_email(self, recipient: str, subject: str, html_content: str):
        """Internal helper to send email via SMTP"""
        if not self.smtp_user or not self.smtp_pass:
            print("Warning: SMTP credentials not set. Skipping email.")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.smtp_from
            msg["To"] = recipient

            part = MIMEText(html_content, "html")
            msg.attach(part)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.sendmail(self.smtp_from, recipient, msg.as_string())
            
            print(f"Email sent successfully to {recipient}")
            return True
        except Exception as e:
            print(f"Error sending email to {recipient}: {e}")
            return False

    def send_interview_scheduled_email(self, recipient_email: str, recipient_name: str, 
                                     role: str, # 'candidate', 'interviewer', 'company'
                                     details: dict):
        """
        Send specialized interview scheduling emails.
        details: {job_title, company_name, scheduled_at, zoom_link, other_party_name}
        """
        try:
            template_name = f"{role}_confirmation.html"
            if role == 'interviewer':
                template_name = "interviewer_assignment.html"
            
            template = self.jinja_env.get_template(template_name)
            html_content = template.render(
                recipient_name=recipient_name,
                **details
            )

            subject = f"Interview Scheduled: {details.get('job_title')} at {details.get('company_name')}"
            if role == 'interviewer':
                subject = f"New Interview Assignment: {details.get('job_title')} for {details.get('other_party_name')}"
            
            return self._send_email(recipient_email, subject, html_content)
        except Exception as e:
            print(f"Error preparing email for {role}: {e}")
            return False

email_service = EmailService()
