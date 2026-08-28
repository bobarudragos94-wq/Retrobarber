# Retro Barbershop — aplicație de programări

Reconstrucție completă a site-ului [retrobarbershop.ro](https://retrobarbershop.ro/):
Next.js 15 (App Router) + TypeScript, PWA, Turso (libSQL), gata de deploy pe Vercel.

Identitatea și informațiile reale ale brandului sunt păstrate — cele patru locații din
București, lista de servicii și prețuri, echipa, programul și motto-ul
„Perfecțiune. Pasiune. Tradiție.” — dar designul, structura și fluxul de rezervare
sunt regândite de la zero, cu prioritate pentru mobil și conversie.

---

## Ce aduce nou

| Funcționalitate | Unde | Cum funcționează |
| --- | --- | --- |
| **Rezervare în 1–2 tapuri** | prima pagină | Cardul de rezervare rapidă e primul lucru de sub titlu pe mobil. Clientul cunoscut apasă un slot și confirmă — un singur tap. |
| **Memorarea preferințelor** | `localStorage` + tabela `customers` | Frizerul, locația, serviciul și ora preferată se rețin pe dispozitiv și, legat de numărul de telefon, în baza de date. |
| **Cele mai bune 3 sloturi** | `/api/suggest` | Motor de scor care combină apropierea de ora preferată, cât de curând e slotul și potrivirea cu frizerul/locația favorită. |
| **Recunoaștere pe dispozitiv nou** | foaia de confirmare | La introducerea telefonului, numele se completează din istoric. |
| **Reducere last-minute** | buton pe prima pagină + `/last-minute` | Sloturile rămase libere **azi** primesc automat reducerea configurată (implicit −20%). |
| **Abonamente** | `/abonamente` | 12 / 24 / 24-premium ședințe pe an, cu −10% / −15% / −20%. Calculator de economie. **Fără flux de plată** — cererea se salvează cu status `pending` și se confirmă telefonic. |
| **Recenzie Google după programare** | `/confirmare/[cod]` | Buton dedicat către formularul Google al locației; devine acțiune principală după ce programarea a trecut. Apăsarea se marchează în `appointments.reviewed_at`. |
| **Titlu animat** | prima pagină | Titlul brandului rămâne „Barbershop autentic / Experiența Retro”, iar sub el se rotesc cuvintele care definesc salonul, cu o linie aurie care se desenează sub fiecare. Animația e pur CSS, fără JavaScript, și se oprește la `prefers-reduced-motion`. |
| **PWA** | `manifest.webmanifest` + `sw.js` | Instalabilă, cu shortcut-uri („Rezervare rapidă”, „Oferte de azi”), pagină de offline și cache pentru shell. Disponibilitatea nu se cache-uiește niciodată. |
| **Adaugă în calendar** | `/api/appointments/[cod]/ics` | Fișier `.ics` cu alarmă la 2 ore înainte, cu fusul orar al Bucureștiului calculat corect. |

---

## Stack

- **Next.js 15** (App Router, React 19, Server Components)
- **TypeScript** strict
- **Tailwind CSS v4** — sistem de design propriu (`src/app/globals.css`)
- **Barlow Condensed + Inter** — fontul de titluri e ales pentru că are glifele
  precompuse `Ș/ș` și `Ț/ț` cu virgulă dedesubt; Bebas Neue și Oswald le compun
  și le desenează greșit
- **Turso / libSQL** (`@libsql/client`) — cu fallback pe fișier local în dezvoltare
- **Vercel** — fără configurație suplimentară

Fără bibliotecă de UI, fără state manager, fără dependențe de rulare în afara celor de mai sus.

---

## Pornire locală

```bash
npm install
cp .env.example .env.local     # opțional: fără el se folosește file:local.db
npm run db:reset               # creează schema și populează datele
npm run dev                    # http://localhost:3000
```

`npm run db:reset` = `db:push` (schema) + `db:seed` (locații, echipă, servicii,
abonamente, regula de last-minute și rezervări demo, ca disponibilitatea să arate realist).

Iconițele PWA sunt generate procedural, fără dependențe:

```bash
npx tsx scripts/icons.ts
```

---

## Configurare Turso

```bash
turso db create retro-barbershop
turso db show retro-barbershop --url
turso db tokens create retro-barbershop
```

În `.env.local` (și în variabilele de mediu din Vercel):

```
TURSO_DATABASE_URL="libsql://retro-barbershop-<org>.turso.io"
TURSO_AUTH_TOKEN="<token>"
NEXT_PUBLIC_SITE_URL="https://retrobarbershop.ro"
```

Apoi, o singură dată, cu variabilele setate local: `npm run db:reset`.

Dacă `TURSO_DATABASE_URL` lipsește, aplicația folosește automat `file:local.db` — util
pentru dezvoltare, dar nu pentru producție (pe Vercel discul este efemer).

---

## Structură

```
db/schema.sql              schema completă (locații, frizeri, servicii, programări,
                           abonamente, excluderi orare, reguli last-minute)
scripts/                   migrate · seed · generator de iconițe
src/lib/
  config.ts                constante de programare, fără acces la DB (se importă și în client)
  db.ts                    clientul libSQL, cu fallback local
  time.ts                  utilitare de dată/oră în fusul Europe/Bucharest
  availability.ts          motorul de sloturi, scorul de sugestii, last-minute
  queries.ts               interogările de citire
  prefs.ts                 preferințele clientului (localStorage + hook)
src/app/api/
  suggest                  cele mai bune 3 sloturi
  availability             sloturile libere dintr-o zi
  last-minute              sloturile rămase libere azi, cu reducere
  book                     creează programarea (validare + tranzacție)
  membership               cerere de abonament (fără plată)
  appointments/[cod]/ics   fișier de calendar
  appointments/[cod]/review marchează apăsarea butonului de recenzie
  appointments/lookup      istoricul unui număr de telefon
src/components/            QuickBook · BookingFlow · ConfirmSheet · LastMinute ·
                           MembershipPlans · ReviewCTA · WordCycle (titlul animat) ·
                           Portal · header/footer/bara mobilă
```

---

## Cum se ajustează regulile

| Ce | Unde |
| --- | --- |
| Pas de timp, timp minim până la slot, orizont de rezervare | `src/lib/config.ts` |
| Program pe locație (deschidere, închidere, zile închise) | coloanele `opens_at`, `closes_at`, `closed_days` din `locations` |
| Procent și fereastră pentru reducerea last-minute | tabela `last_minute_rules` |
| Servicii, durate, prețuri | tabela `services` |
| Abonamente și beneficii | tabela `membership_plans` (`perks` este JSON) |
| Concedii, pauze, zile libere | tabela `time_off` (pe frizer sau pe locație) |

### Link-urile de recenzie Google

`locations.review_url` este populat implicit cu o căutare Google Maps. Pentru butonul
„Lasă o recenzie” recomandat, înlocuiește-l cu link-ul direct al fiecărei locații:

```sql
UPDATE locations
SET review_url = 'https://search.google.com/local/writereview?placeid=<PLACE_ID>'
WHERE slug = 'pallady';
```

`<PLACE_ID>` se obține din Google Business Profile sau din Place ID Finder.

---

## Note de implementare

- **Prețurile se calculează întotdeauna pe server.** Reducerea last-minute este
  reverificată în `/api/book` față de regula din baza de date și de ora curentă;
  un client nu poate cere o reducere pe care nu o are.
- **Rezervarea rulează într-o tranzacție**: verificarea suprapunerii și inserarea se
  fac împreună, deci două persoane nu pot prinde același interval.
- **Fus orar**: toate calculele de zi și oră folosesc explicit `Europe/Bucharest`,
  independent de fusul serverului.
- **Fără conturi și fără parole**: identitatea clientului este numărul de telefon.
- **Fără plată online**, conform cerinței — nici la rezervare, nici la abonament.
