import asyncio
from app.database.database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE customers ALTER COLUMN email DROP NOT NULL"))
        print("Successfully made email column nullable.")

if __name__ == "__main__":
    asyncio.run(main())
