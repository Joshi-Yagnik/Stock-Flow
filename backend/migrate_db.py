import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    # Run the SQL migration
    print("Running migration...")
    await conn.execute("""
        ALTER TABLE public.customers
        ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);
    """)
    
    # If the column was added as NULLable to avoid issues, we can check if it exists and make it NOT NULL
    # But since the table is empty, we can safely alter it to NOT NULL
    await conn.execute("""
        ALTER TABLE public.customers ALTER COLUMN owner_id SET NOT NULL;
    """)
    
    print("Migration completed.")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
