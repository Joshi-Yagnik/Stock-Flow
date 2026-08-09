import os
import httpx
from dotenv import load_dotenv

def test_whatsapp_otp():
    # Load .env file
    load_dotenv()

    # Read variables
    token = os.getenv("META_WHATSAPP_TOKEN", "").strip()
    phone_id = os.getenv("META_PHONE_NUMBER_ID", "").strip()
    template_name = os.getenv("META_WHATSAPP_TEMPLATE_NAME", "").strip()
    template_lang = os.getenv("META_WHATSAPP_TEMPLATE_LANGUAGE", "en").strip()
    graph_version = os.getenv("META_GRAPH_API_VERSION", "v20.0").strip()
    
    print("\n--- WhatsApp Configuration Check ---")
    print(f"[WhatsApp] Access Token configured: {'YES' if token else 'NO'}")
    print(f"[WhatsApp] Phone Number ID configured: {'YES' if phone_id else 'NO'}")
    print(f"[WhatsApp] Template: {template_name}")
    print(f"[WhatsApp] Language: {template_lang}")
    print(f"[WhatsApp] API Version: {graph_version}")
    
    if not token or not phone_id or not template_name:
        print("\nERROR: Missing required configuration in .env")
        print("Please ensure META_WHATSAPP_TOKEN, META_PHONE_NUMBER_ID, and META_WHATSAPP_TEMPLATE_NAME are saved in the .env file.")
        return

    # Use a dummy number for testing if user doesn't specify one
    test_number = "918518975189"
    test_otp = "123456"
    
    print(f"\n[WhatsApp] Sending OTP to: ********{test_number[-4:]}")
    print("[WhatsApp] Calling Meta WhatsApp API...")
    
    url = f"https://graph.facebook.com/{graph_version}/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": test_number,
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
                            "text": test_otp
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
                #             "text": test_otp
                #         }
                #     ]
                # }
            ]
        }
    }

    try:
        response = httpx.post(url, headers=headers, json=payload, timeout=10.0)
        print(f"[WhatsApp] Meta response status: {response.status_code}")
        
        try:
            print(f"[WhatsApp] Meta response: {response.json()}")
        except Exception:
            print(f"[WhatsApp] Meta response: {response.text}")
            
    except Exception as e:
        print(f"\n[WhatsApp] Network Error: Failed to reach Meta API. Details: {str(e)}")

if __name__ == "__main__":
    test_whatsapp_otp()
