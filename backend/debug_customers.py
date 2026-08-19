import asyncio
import traceback
from app.database.database import AsyncSessionLocal
from app.models.models import User
from app.routers.customers import list_customers
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print(f"Found {len(users)} users in database.")
        for u in users:
            print(f"Testing user id={u.id}, mobile={u.mobile_number}")
            try:
                out = await list_customers(page=1, limit=20, search="", is_active=True, current_user=u, db=db)
                print(f"SUCCESS for user {u.id}: total={out['meta']['total']}, returned={len(out['data'])}")
            except Exception as e:
                print(f"ERROR for user {u.id}: {e}")
                traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
