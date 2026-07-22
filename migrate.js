const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// We need the postgres connection string. The NEXT_PUBLIC_SUPABASE_URL is not a postgres string.
// Local supabase usually runs on postgresql://postgres:postgres@127.0.0.1:54322/postgres
const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
});

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to local Supabase Postgres!");
        
        // Alter producer_profiles
        try {
            await client.query("ALTER TABLE public.producer_profiles ADD COLUMN rajaongkir_location_id text;");
            console.log("Added rajaongkir_location_id to producer_profiles");
        } catch (e) {
            console.log("Column might already exist in producer_profiles:", e.message);
        }

        // Alter addresses
        try {
            await client.query("ALTER TABLE public.addresses ADD COLUMN rajaongkir_location_id text;");
            console.log("Added rajaongkir_location_id to addresses");
        } catch (e) {
            console.log("Column might already exist in addresses:", e.message);
        }

        // Also update the users default address? Wait, the checkout uses 'buyer?.city', which is not in addresses table?
        // Wait, 'buyer?.city' in CheckoutClient comes from `buyer` which is a user profile (probably `users` table). 
        // We might need rajaongkir_location_id in `users` table? 
        // The user said: "Buyer: ganti input alamat manual di checkout jadi autocomplete pencarian lokasi... simpan ID yang dipilih"
        // I will add it to `addresses` table, and the frontend will use the `selectedAddressId`. 

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.end();
    }
}

migrate();
