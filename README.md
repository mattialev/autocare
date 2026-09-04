# AutoCare

AutoCare e una web application React per gestire il fascicolo digitale della propria automobile: anagrafica, manutenzioni, scadenze, documenti, assicurazione, bollo e revisione.

## Stack

- React, TypeScript, Vite, React Router
- React Hook Form, Zod, date-fns
- Supabase Auth, PostgreSQL con RLS, Supabase Storage privato
- PWA tramite vite-plugin-pwa

## Requisiti

- Node.js 20+
- npm
- Un progetto Supabase per l'uso reale

## Installazione

```bash
npm install
```

## Avvio

```bash
npm run dev
```

Senza variabili Supabase l'app parte in modalita demo locale, con dati salvati in `localStorage`.

## Build e test

```bash
npm run test
npm run lint
npm run build
```

## Configurazione Supabase

1. Crea un nuovo progetto Supabase.
2. Applica la migration in `supabase/migrations/20260904000000_initial_schema.sql` con Supabase CLI o SQL editor.
3. La migration crea il bucket privato `vehicle-documents`, tabelle, indici, trigger, dati iniziali e policy RLS.
4. In Authentication abilita Email/Password. La conferma email puo restare attiva o essere disabilitata in sviluppo.
5. Copia `.env.example` in `.env.local` e inserisci:

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key
```

Non usare service role key nel frontend.

## Sicurezza

Ogni tabella utente contiene `user_id` e ha Row Level Security attiva. Le policy consentono lettura, inserimento, modifica e cancellazione solo quando `auth.uid() = user_id`. I file Storage devono stare nel path:

```text
userId/vehicleId/documents/file
```

Le policy Storage controllano che la prima cartella corrisponda all'utente autenticato. Il bucket e privato e l'app usa signed URL temporanei per download e preview.

## Deployment GitHub Pages

Configura i secrets del repository:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Poi abilita GitHub Pages con sorgente "GitHub Actions". Il workflow in `.github/workflows/deploy.yml` compila e pubblica `dist`.

Se il repository si chiama `autocare`, l'URL sara simile a:

```text
https://TUO_USERNAME.github.io/autocare/
```
