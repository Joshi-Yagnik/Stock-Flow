import asyncio
from app.database.database import AsyncSessionLocal
from app.models.models import User, Customer, Invoice
from app.routers.customers import list_customers, list_all_customer_identifiers
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        if not users:
            print("No users found.")
            return
        user = users[0]
        print(f"Testing for user: {user.name} ({user.id})")

        # 1. Test list_customers without search (Invoice customers only)
        res_no_search = await list_customers(page=1, limit=20, search="", is_active=True, current_user=user, db=db)
        print(f"[NO SEARCH] total relevant invoice customers: {res_no_search['meta']['total']}")
        print(f"[NO SEARCH] returned rows count: {len(res_no_search['data'])}")
        for c in res_no_search['data'][:5]:
            print(f"   -> Customer: {c.name}, Orders: {c.total_orders}, Spent: {c.total_spent}")

        # 2. Test list_all_customer_identifiers
        all_ids = await list_all_customer_identifiers(current_user=user, db=db)
        print(f"[ALL IDENTIFIERS] total stored customers in DB: {len(all_ids)}")

        # 3. Test list_customers with search query
        if all_ids:
            first_cust_name = all_ids[0].name
            # pick name search
            search_query = first_cust_name.split()[0] if first_cust_name else "a"
            res_search = await list_customers(page=1, limit=20, search=search_query, is_active=True, current_user=user, db=db)
            print(f"[SEARCH '{search_query}'] total matching customers found: {res_search['meta']['total']}")
            for c in res_search['data'][:5]:
                print(f"   -> Matched: {c.name}, Orders: {c.total_orders}")

if __name__ == "__main__":
    asyncio.run(main())
