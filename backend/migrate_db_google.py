import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    print("Running Google Connections migration...")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS public.google_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage their own google connection" ON public.google_connections;
        CREATE POLICY "Users can manage their own google connection" 
        ON public.google_connections FOR ALL 
        USING (auth.uid() = user_id);
    """)
    
    print("Migration completed.")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
