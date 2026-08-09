import asyncio
import asyncpg

async def sync_profiles():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    # Insert missing profiles
    res = await conn.execute("""
        INSERT INTO public.profiles (id, full_name, role, is_active)
        SELECT id, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Unknown User'), 'owner', true
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.profiles)
    """)
    print('Synced profiles:', res)
    await conn.close()

if __name__ == "__main__":
    asyncio.run(sync_profiles())
