import os
import requests
import json
from datetime import datetime
from typing import Optional, Dict, Any

class ZoomService:
    def __init__(self):
        self.client_id = os.getenv("ZOOM_CLIENT_ID")
        self.client_secret = os.getenv("ZOOM_CLIENT_SECRET")
        self.account_id = os.getenv("ZOOM_ACCOUNT_ID")
        self.is_mock = not (self.client_id and self.client_secret and self.account_id)
        
        if self.is_mock:
            print("⚠️ Zoom API credentials missing. Running ZoomService in MOCK mode.")

    def _get_access_token(self) -> Optional[str]:
        """Fetch Server-to-Server OAuth Token"""
        if self.is_mock:
            return "mock_token"
            
        url = f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={self.account_id}"
        try:
            response = requests.post(
                url,
                auth=(self.client_id, self.client_secret)
            )
            response.raise_for_status()
            return response.json().get("access_token")
        except Exception as e:
            print(f"Error fetching Zoom access token: {e}")
            return None

    def create_meeting(self, topic: str, start_time: str, duration: int = 60) -> Dict[str, Any]:
        """
        Create a Zoom meeting.
        start_time should be in ISO 8601 format (UTC).
        """
        if self.is_mock:
            return {
                "id": "mock_meeting_id",
                "join_url": "https://zoom.us/j/mock_meeting",
                "start_url": "https://zoom.us/s/mock_meeting",
                "password": "mock_password",
                "topic": topic,
                "start_time": start_time,
                "duration": duration
            }

        token = self._get_access_token()
        if not token:
            raise Exception("Failed to authenticate with Zoom")

        url = "https://api.zoom.us/v2/users/me/meetings"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "topic": topic,
            "type": 2, # Scheduled meeting
            "start_time": start_time,
            "duration": duration,
            "timezone": "UTC",
            "settings": {
                "host_video": True,
                "participant_video": True,
                "join_before_host": False,
                "mute_upon_entry": True,
                "waiting_room": True
            }
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating Zoom meeting: {e}")
            raise e

# Global instance
zoom_service = ZoomService()
