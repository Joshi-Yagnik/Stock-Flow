import asyncio
import traceback
from app.database.database import AsyncSessionLocal
from app.models.models import User, Customer
from app.schemas.schemas import CustomerResponse
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Customer))
        customers = res.scalars().all()
        print(f"Total customers in DB: {len(customers)}")
        errors = 0
        for c in customers:
            try:
                CustomerResponse.model_validate(c)
            except Exception as e:
                errors += 1
                print(f"Validation error for customer ID={c.id}, name='{c.name}', email='{c.email}', phone='{c.phone}': {e}")
        print(f"Total validation errors: {errors}")

if __name__ == "__main__":
    asyncio.run(main())
