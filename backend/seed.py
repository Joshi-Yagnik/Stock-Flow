import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings
from app.models.models import Base, User
from app.core.security import hash_password

async def init_db():
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # Check if users already exist
        result = await session.execute(text("SELECT count(*) FROM users"))
        count = result.scalar()
        
        if count == 0:
            print("Seeding users...")
            owner = User(
                name="System Owner",
                email="owner@stockflow.com",
                hashed_password=hash_password("owner123"),
                role="owner",
                is_active=True
            )
            staff = User(
                name="Staff Member",
                email="staff@stockflow.com",
                hashed_password=hash_password("staff123"),
                role="staff",
                is_active=True
            )
            session.add(owner)
            session.add(staff)
            await session.commit()
            print("Users seeded successfully!")
        else:
            print("Users already exist. Skipping seed.")

if __name__ == "__main__":
    asyncio.run(init_db())
