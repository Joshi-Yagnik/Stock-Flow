import asyncio
import asyncpg

async def fix_trigger():
    conn = await asyncpg.connect('postgresql://postgres:StockFlow_28101902@db.oybttnomdynltrtulcxt.supabase.co:5432/postgres')
    
    # Update the handle_new_user function to ensure full_name is never null
    await conn.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path TO 'public'
        AS $function$
        BEGIN
            INSERT INTO public.profiles (
                id,
                full_name,
                shop_name,
                mobile_number,
                avatar_url,
                is_active
            )
            VALUES (
                NEW.id,
                COALESCE(
                    NEW.raw_user_meta_data ->> 'full_name',
                    NEW.raw_user_meta_data ->> 'name',
                    NEW.email,
                    'Unknown User'
                ),
                NEW.raw_user_meta_data ->> 'shop_name',
                NEW.raw_user_meta_data ->> 'mobile_number',
                NEW.raw_user_meta_data ->> 'avatar_url',
                TRUE
            );
            RETURN NEW;
        END;
        $function$;
    """)
    print('Trigger function updated.')
    await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_trigger())
