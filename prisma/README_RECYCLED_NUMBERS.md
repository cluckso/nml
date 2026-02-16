# Add recycled Retell numbers

Add these 6 numbers to the recycled pool:  
`+14155285675`, `+14159653498`, `+14155982098`, `+14159914067`, `+14159682320`, `+14159972506`.

## Option A: Supabase SQL Editor (no Prisma connection)

1. Open **Supabase Dashboard** → your project → **SQL Editor**.
2. Open the file **`prisma/add_recycled_numbers.sql`** in this repo (or copy its contents).
3. Click **Run**.  
   Existing numbers are skipped (`ON CONFLICT DO NOTHING`).

## Option B: npm script (requires working DATABASE_URL)

1. Fix `.env` so Prisma can connect (see **DATABASE.md**):
   - Use **Transaction pooler** URI (port **6543**).
   - Username must be **`postgres.[project-ref]`** (e.g. `postgres.sbfwaopvqpfgjfdzxnaq`), not `postgres`.
   - Copy the URI from Dashboard → Settings → Database → Connection pooling → **Transaction**.
2. Run:
   ```powershell
   npm run db:add-recycled-numbers
   ```
   If you see *"tsx is not recognized"*, run:
   ```powershell
   npx tsx scripts/add-recycled-numbers.ts
   ```
