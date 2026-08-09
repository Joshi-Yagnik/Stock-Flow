import asyncio
import asyncpg

async def check_triggers():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    triggers = await conn.fetch("""
        SELECT event_object_schema as table_schema,
               event_object_table as table_name,
               trigger_name
        FROM information_schema.triggers
    """)
    for t in triggers:
        if 'auth' in t['table_schema'] or 'profiles' in t['table_name']:
            print(t['table_schema'], t['table_name'], t['trigger_name'])
            
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_triggers())
