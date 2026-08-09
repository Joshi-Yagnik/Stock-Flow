from abc import ABC, abstractmethod
from app.core.config import settings
import httpx
import logging

logger = logging.getLogger("stockflow")

class SMSProvider(ABC):
    @abstractmethod
    def send_sms(self, mobile_number: str, message: str, otp: str = None) -> bool:
        pass


class MockProvider(SMSProvider):
    def send_sms(self, mobile_number: str, message: str, otp: str = None) -> bool:
        # In a real app, this might just log to console
        print(f"\n[MOCK SMS] To: {mobile_number}")
        print(f"[MOCK SMS] Message: {message}\n")
        return True


class WhatsAppProvider(SMSProvider):
    def send_sms(self, mobile_number: str, message: str, otp: str = None) -> bool:
        # Get from settings, fallback to os.getenv if Pydantic failed to load it
        import os
        token = settings.META_WHATSAPP_TOKEN or os.getenv("META_WHATSAPP_TOKEN", "")
        phone_id = settings.META_PHONE_NUMBER_ID or os.getenv("META_PHONE_NUMBER_ID", "")
        template_name = settings.META_WHATSAPP_TEMPLATE_NAME or os.getenv("META_WHATSAPP_TEMPLATE_NAME", "")
        template_lang = settings.META_WHATSAPP_TEMPLATE_LANGUAGE or os.getenv("META_WHATSAPP_TEMPLATE_LANGUAGE", "en")
        api_version = settings.META_GRAPH_API_VERSION or os.getenv("META_GRAPH_API_VERSION", "v20.0")

        if not token or not phone_id or not template_name:
            print("\n[WhatsApp] ERROR: Missing Meta configuration in backend/.env")
            return False

        if not otp:
            print("[WhatsApp] ERROR: Provider requires an explicit otp parameter")
            return False

        # Normalize number
        normalized_number = "".join(filter(str.isdigit, mobile_number))
        if len(normalized_number) == 10:
            normalized_number = f"91{normalized_number}"

        url = f"https://graph.facebook.com/{api_version}/{phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": normalized_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": template_lang
                },
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": otp
                            }
                        ]
                    }
                    # Uncomment the following block if your Meta template is a strict 
                    # Authentication template with an autofill/copy code button:
                    # ,
                    # {
                    #     "type": "button",
                    #     "sub_type": "url",
                    #     "index": "0",
                    #     "parameters": [
                    #         {
                    #             "type": "text",
                    #             "text": otp
                    #         }
                    #     ]
                    # }
                ]
            }
        }

        print(f"\n[WhatsApp] Provider: Meta WhatsApp Cloud API")
        print(f"[WhatsApp] Recipient: ********{normalized_number[-4:]}")
        print(f"[WhatsApp] Template: {template_name}")
        print(f"[WhatsApp] Calling Meta API...")

        try:
            # We use a synchronous post call as required
            response = httpx.post(url, headers=headers, json=payload, timeout=10.0)
            print(f"[WhatsApp] Meta status: {response.status_code}")
            
            if response.status_code in (200, 201):
                return True
            else:
                # Log error safely without dumping the request headers which contain the token
                try:
                    error_json = response.json()
                    print(f"[WhatsApp] Meta error: {error_json}")
                except Exception:
                    print(f"[WhatsApp] Meta error: {response.text}")
                return False
        except Exception as e:
            print(f"[WhatsApp] Meta error: Failed to reach Meta API. Details: {str(e)}")
            return False


class TwilioProvider(SMSProvider):
    def send_sms(self, mobile_number: str, message: str, otp: str = None) -> bool:
        print(f"Twilio sending to {mobile_number}: {message}")
        # import twilio here and implement logic using settings.TWILIO_ACCOUNT_SID etc
        return True


class MSG91Provider(SMSProvider):
    def send_sms(self, mobile_number: str, message: str, otp: str = None) -> bool:
        print(f"MSG91 sending to {mobile_number}: {message}")
        # implement logic using settings.MSG91_AUTH_KEY
        return True


class Fast2SMSProvider(SMSProvider):
    def send_sms(self, mobile_number: str, message: str, otp: str = None) -> bool:
        print(f"Fast2SMS sending to {mobile_number}: {message}")
        # implement logic using settings.FAST2SMS_API_KEY
        return True


def get_sms_provider() -> SMSProvider:
    provider = settings.SMS_PROVIDER.lower()
    
    if provider == "twilio":
        return TwilioProvider()
    elif provider == "msg91":
        return MSG91Provider()
    elif provider == "fast2sms":
        return Fast2SMSProvider()
    elif provider == "whatsapp":
        return WhatsAppProvider()
    else:
        return MockProvider()

# Singleton instance
sms_service = get_sms_provider()
