import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    row = await conn.fetchrow("SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'owner_id'")
    print('owner_id exists:', bool(row))
    
    # Let's also check if there are any rows in customers
    count = await conn.fetchval("SELECT count(*) FROM customers")
    print('customers count:', count)
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
