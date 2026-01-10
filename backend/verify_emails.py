from app.services.email_service import email_service
import os

def test_template_rendering():
    print("Testing email template rendering...")
    
    details = {
        "job_title": "Full Stack Developer",
        "company_name": "HireMate Tech",
        "scheduled_at": "2026-01-15 10:00 AM",
        "zoom_link": "https://zoom.us/j/123456789",
        "interviewer_name": "John Doe",
        "other_party_name": "Jane Smith"
    }

    scenarios = [
        {"role": "candidate", "name": "Jane Smith", "email": "candidate@example.com"},
        {"role": "interviewer", "name": "John Doe", "email": "interviewer@example.com"},
        {"role": "company", "name": "Recruiter Name", "email": "recruiter@example.com"}
    ]

    for s in scenarios:
        print(f"\n--- Testing Scenario: {s['role']} ---")
        try:
            # We'll mock the _send_email to only print the content for now
            template_name = f"{s['role']}_confirmation.html"
            if s['role'] == 'interviewer':
                template_name = "interviewer_assignment.html"
            
            template = email_service.jinja_env.get_template(template_name)
            html_content = template.render(
                recipient_name=s['name'],
                **details
            )
            
            print(f"Template '{template_name}' rendered successfully.")
            # print(html_content[:200] + "...") # Print first 200 chars
            
        except Exception as e:
            print(f"Error rendering {s['role']}: {e}")

if __name__ == "__main__":
    test_template_rendering()
