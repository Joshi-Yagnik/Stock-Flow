import asyncio
import asyncpg

async def check_trigger_def():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    print("--- Triggers ---")
    res = await conn.fetch("""
        SELECT pg_get_triggerdef(t.oid) as def, t.tgfoid
        FROM pg_trigger t
        WHERE t.tgname = 'on_auth_user_created';
    """)
    for r in res:
        print(r['def'])
        
        # Also fetch the function definition
        res2 = await conn.fetch("""
            SELECT pg_get_functiondef($1) as def
        """, r['tgfoid'])
        for r2 in res2:
            print(r2['def'])
            
    # Check if user exists in profiles
    print("--- Profiles ---")
    res3 = await conn.fetch("""
        SELECT count(*) FROM public.profiles;
    """)
    print("Profile count:", res3[0]['count'])
    
    res4 = await conn.fetch("""
        SELECT count(*) FROM auth.users;
    """)
    print("Auth users count:", res4[0]['count'])
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_trigger_def())
