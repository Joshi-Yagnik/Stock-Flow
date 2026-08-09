import asyncio
import asyncpg

async def check_schema():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    for table in ['products', 'invoices']:
        cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='" + table + "'")
        print(f'{table} columns:', [(c['column_name'], c['data_type']) for c in cols])
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_schema())
