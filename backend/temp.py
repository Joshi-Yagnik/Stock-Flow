import httpx
import asyncio

async def test():
    try:
        r = httpx.post('http://127.0.0.1:8000/api/v1/auth/send-mobile-otp', json={'mobile_number': '1234567890'}, headers={'Origin': 'http://localhost:5174'}, timeout=10.0)
        print(r.status_code)
        print(r.json())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
