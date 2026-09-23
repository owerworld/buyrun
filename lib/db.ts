import { mkdirSync } from "fs";

type Row = Record<string, any>;
type Exec = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    admin_token TEXT UNIQUE NOT NULL,
    name_a TEXT NOT NULL,
    name_b TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '',
    main_date TEXT NOT NULL,
    bus_from TEXT NOT NULL DEFAULT '',
    bus_time TEXT NOT NULL DEFAULT '',
    bus_note TEXT NOT NULL DEFAULT '',
    program TEXT NOT NULL DEFAULT '',
    extra_program TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'klasik',
    font TEXT NOT NULL DEFAULT 'klasik',
    ornament TEXT NOT NULL DEFAULT 'sirma',
    recovery_code TEXT NOT NULL DEFAULT '',
    delete_after TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    venue TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    sort INT NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    side TEXT NOT NULL,
    panel_token TEXT UNIQUE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    event_ids TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'bekliyor',
    count INT NOT NULL DEFAULT 1,
    attend_ids TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT PRIMARY KEY,
    hits INT NOT NULL DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL
  )`,
  // Önceden kurulmuş veritabanları için tema sütunu
  `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'klasik'`,
  `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS extra_program TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS recovery_code TEXT NOT NULL DEFAULT ''`,
  // Sihirbazın yazdığı davet metni
  `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT ''`,
  // Tasarım eksenleri: isimlerin yazı karakteri ve çerçeve süslemesi
  `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS font TEXT NOT NULL DEFAULT 'klasik'`,
  `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS ornament TEXT NOT NULL DEFAULT 'sirma'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS invitations_recovery_idx ON invitations(recovery_code) WHERE recovery_code <> ''`,
  `CREATE INDEX IF NOT EXISTS guests_family_idx ON guests(family_id)`,
  `CREATE INDEX IF NOT EXISTS guests_invitation_idx ON guests(invitation_id)`,
];

const g = globalThis as unknown as { __buyrunExec?: Exec; __buyrunReady?: Promise<void> };

async function createExec(): Promise<Exec> {
  if (process.env.DATABASE_URL) {
    const postgres = (await import("postgres")).default;
    const sql = postgres(process.env.DATABASE_URL, { max: 5, prepare: false });
    return async (text, params = []) => (await sql.unsafe(text, params as any[])) as unknown as Row[];
  }
  // Vercel'de dosya sistemi salt okunur; sessizce yedeğe düşmek yerine ne eksik olduğunu söyle
  if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL tanımlı değil. Vercel panelinde veritabanını projeye bağlayın ve yeniden yayınlayın."
    );
  }
  // Yerel geliştirme: dosya tabanlı PGlite (gerçek Postgres, sunucu gerektirmez)
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR || "./.data/pglite";
  mkdirSync(dir, { recursive: true });
  const db = new PGlite(dir);
  return async (text, params = []) => (await db.query(text, params as any[])).rows as Row[];
}

async function exec(): Promise<Exec> {
  if (!g.__buyrunExec) g.__buyrunExec = await createExec();
  if (!g.__buyrunReady) {
    const run = g.__buyrunExec;
    g.__buyrunReady = (async () => {
      for (const stmt of SCHEMA) await run(stmt);
    })();
  }
  await g.__buyrunReady;
  return g.__buyrunExec;
}

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const run = await exec();
  return (await run(text, params)) as T[];
}
