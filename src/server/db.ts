import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  get<T = any>(sql: string, params?: any[]): Promise<T | null>;
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number | bigint; changes?: number }>;
  close(): Promise<void>;
  type: 'postgres' | 'sqlite';
}

let dbInstance: DatabaseAdapter | null = null;

// Secure password hashing with salt using native crypto pbkdf2
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

class SQLiteAdapter implements DatabaseAdapter {
  private db: any;
  public type: 'sqlite' = 'sqlite';

  constructor(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const { DatabaseSync } = require('node:sqlite');
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA foreign_keys = ON;');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const stmt = this.db.prepare(sql);
    const row = stmt.get(...params);
    return (row as T) || null;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number | bigint; changes?: number }> {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
    };
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

class PostgresAdapter implements DatabaseAdapter {
  private pool: pg.Pool;
  public type: 'postgres' = 'postgres';

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }

  // Convert ? to $1, $2, etc. for PostgreSQL
  private convertPlaceholders(sql: string): string {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const convertedSql = this.convertPlaceholders(sql);
    const res = await this.pool.query(convertedSql, params);
    return res.rows as T[];
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number | bigint; changes?: number }> {
    const convertedSql = this.convertPlaceholders(sql);
    const res = await this.pool.query(convertedSql, params);
    return {
      changes: res.rowCount || 0,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function getDb(): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres')) {
    console.log('[Database] Connecting to PostgreSQL via DATABASE_URL...');
    try {
      const adapter = new PostgresAdapter(dbUrl);
      await adapter.query('SELECT 1');
      console.log('[Database] Connected to PostgreSQL successfully.');
      dbInstance = adapter;
    } catch (err) {
      console.warn('[Database] PostgreSQL connection failed, falling back to local persistent SQLite:', err);
      const dbPath = path.resolve(process.cwd(), 'data', 'ielts_camp.db');
      dbInstance = new SQLiteAdapter(dbPath);
    }
  } else {
    const dbPath = path.resolve(process.cwd(), 'data', 'ielts_camp.db');
    console.log(`[Database] Initializing persistent SQLite database at: ${dbPath}`);
    dbInstance = new SQLiteAdapter(dbPath);
  }

  await initializeDatabaseSchema(dbInstance);
  return dbInstance;
}

async function initializeDatabaseSchema(db: DatabaseAdapter) {
  console.log('[Database] Running schema migrations & checks...');

  // Admin users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      must_change_password INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Ensure must_change_password column exists if table existed previously
  try {
    await db.run(`ALTER TABLE admin_users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;`);
  } catch {
    // Column already exists
  }

  // Teachers table
  await db.run(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      level TEXT NOT NULL,
      bio TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Courses table
  await db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL DEFAULT '',
      duration TEXT NOT NULL DEFAULT '',
      schedule_notes TEXT NOT NULL DEFAULT '',
      levels_json TEXT NOT NULL DEFAULT '[]',
      max_capacity INTEGER NOT NULL DEFAULT 15,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Groups table
  await db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      teacher_id INTEGER DEFAULT NULL,
      name TEXT NOT NULL,
      teacher TEXT NOT NULL DEFAULT '',
      days TEXT NOT NULL DEFAULT '',
      time_slot TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL DEFAULT '',
      max_students INTEGER NOT NULL DEFAULT 12,
      is_kids INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL
    );
  `);

  // Ensure is_kids and teacher_id exist if table existed previously
  try {
    await db.run(`ALTER TABLE groups ADD COLUMN is_kids INTEGER NOT NULL DEFAULT 0;`);
  } catch {
    // Column already exists
  }
  try {
    await db.run(`ALTER TABLE groups ADD COLUMN teacher_id INTEGER DEFAULT NULL;`);
  } catch {
    // Column already exists
  }

  // Applications table
  await db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_code TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      birth_date TEXT DEFAULT '',
      course_id INTEGER NOT NULL,
      level TEXT DEFAULT '',
      preferred_time TEXT NOT NULL,
      comment TEXT DEFAULT '',
      consent INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'NEW',
      assigned_group_id INTEGER DEFAULT NULL,
      admin_notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses (id),
      FOREIGN KEY (assigned_group_id) REFERENCES groups (id) ON DELETE SET NULL
    );
  `);

  // Status history table
  await db.run(`
    CREATE TABLE IF NOT EXISTS application_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      old_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      changed_by TEXT NOT NULL DEFAULT 'admin',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
    );
  `);

  // Notification logs table
  await db.run(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER DEFAULT NULL,
      channel TEXT NOT NULL DEFAULT 'telegram',
      recipient TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      error_message TEXT DEFAULT '',
      sent_at TEXT NOT NULL
    );
  `);

  // Site settings table
  await db.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Audit logs table
  await db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);

  // Indices
  await db.run(`CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications(phone);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_applications_course ON applications(course_id);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_groups_course ON groups(course_id);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_teachers_active ON teachers(is_active);`);

  const now = new Date().toISOString();

  // 1. Seed or Update Real Teachers
  const teacherCountRow = await db.get('SELECT count(*) as count FROM teachers');
  if (Number(teacherCountRow?.count || 0) === 0) {
    console.log('[Database] Seeding official teachers...');
    // Diyorbek Mirzaolimov
    await db.run(
      `INSERT INTO teachers (name, subject, level, bio, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [
        'Diyorbek Mirzaolimov',
        'Ingliz tili / CEFR',
        'C1 darajasi',
        'Ingliz tili va CEFR/IELTS imtihonlariga tayyorlash bo‘yicha tajribali mutaxassis, C1 sertifikati sohibi.',
        now,
        now,
      ]
    );

    // Doniyorbek Mirzaolimov
    await db.run(
      `INSERT INTO teachers (name, subject, level, bio, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [
        'Doniyorbek Mirzaolimov',
        'Ingliz tili (Kids)',
        'B2 darajasi',
        'Ingliz tili o‘qituvchisi, B2 darajasi sohibi, bolalar (Kids) guruhlari bilan ishlashga ixtisoslashgan.',
        now,
        now,
      ]
    );

    // Kholmirzayev Og‘abek
    await db.run(
      `INSERT INTO teachers (name, subject, level, bio, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [
        'Kholmirzayev Og‘abek',
        'Tarix',
        'A darajasi',
        'Tarix fani bo‘yicha malakali mutaxassis, O‘zbekiston va Jahon tarixi, DTM va litsey tayyorgarligi bo‘yicha ustoz.',
        now,
        now,
      ]
    );
  }

  // Fetch teachers for group linking
  const teacherDiyor = await db.get('SELECT id FROM teachers WHERE name LIKE ?', ['%Diyorbek%']);
  const teacherDoniyor = await db.get('SELECT id FROM teachers WHERE name LIKE ?', ['%Doniyorbek%']);
  const teacherOgabek = await db.get('SELECT id FROM teachers WHERE name LIKE ?', ['%Og‘abek%']);

  // 2. Ensure Real Courses Data (price: 200 000 so‘m, exact schedule)
  const englishLevels = JSON.stringify([
    'Beginner (A1)',
    'Elementary (A2)',
    'Pre-Intermediate (B1)',
    'Intermediate (B1+)',
    'Upper-Intermediate (B2)',
    'Advanced (C1)',
    'Kids guruhlari',
    'IELTS Foundation / Graduation',
  ]);

  const existingEnglish = await db.get('SELECT id FROM courses WHERE slug = ?', ['english-cefr']);
  if (!existingEnglish) {
    await db.run(
      `INSERT INTO courses (slug, name, description, price, duration, schedule_notes, levels_json, max_capacity, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        'english-cefr',
        'Ingliz tili / CEFR',
        'Ingliz tili bilimini bosqichma-bosqich rivojlantirish, CEFR va IELTS imtihonlariga tayyorlanish hamda maxsus Kids guruhlari.',
        '200 000 so‘m',
        '3 oy - 6 oy',
        'Seshanba, payshanba, shanba (16:30–18:30)',
        englishLevels,
        15,
        now,
        now,
      ]
    );
  } else {
    // Update to exact specifications
    await db.run(
      `UPDATE courses SET
         price = '200 000 so‘m',
         schedule_notes = 'Seshanba, payshanba, shanba (16:30–18:30)',
         levels_json = ?,
         updated_at = ?
       WHERE id = ?`,
      [englishLevels, now, existingEnglish.id]
    );
  }

  const existingHistory = await db.get('SELECT id FROM courses WHERE slug = ?', ['history']);
  if (!existingHistory) {
    await db.run(
      `INSERT INTO courses (slug, name, description, price, duration, schedule_notes, levels_json, max_capacity, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        'history',
        'Tarix',
        'Tarixiy bilimlarni mustahkamlash, mavzularni o‘rganish va imtihonlarga tayyorlanish.',
        '200 000 so‘m',
        '4 oy - 8 oy',
        'Seshanba, payshanba, shanba (16:00–18:00)',
        JSON.stringify(['Daraja A', 'DTM / Litsey tayyorgarlik']),
        15,
        now,
        now,
      ]
    );
  } else {
    await db.run(
      `UPDATE courses SET
         price = '200 000 so‘m',
         schedule_notes = 'Seshanba, payshanba, shanba (16:00–18:00)',
         levels_json = ?,
         updated_at = ?
       WHERE id = ?`,
      [JSON.stringify(['Daraja A', 'DTM / Litsey tayyorgarlik']), now, existingHistory.id]
    );
  }

  // 3. Ensure Real Groups with Teachers and Kids Flag
  const engCourse = await db.get('SELECT id FROM courses WHERE slug = ?', ['english-cefr']);
  const histCourse = await db.get('SELECT id FROM courses WHERE slug = ?', ['history']);

  if (engCourse) {
    // English General CEFR Group (Diyorbek Mirzaolimov, C1)
    const g1 = await db.get('SELECT id FROM groups WHERE course_id = ? AND is_kids = 0', [engCourse.id]);
    if (!g1) {
      await db.run(
        `INSERT INTO groups (course_id, teacher_id, name, teacher, days, time_slot, start_date, max_students, is_kids, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`,
        [
          engCourse.id,
          teacherDiyor?.id || null,
          'Ingliz tili (C1 daraja)',
          'Diyorbek Mirzaolimov (C1)',
          'Seshanba, payshanba, shanba',
          '16:30–18:30',
          '2026-11-03',
          15,
          now,
        ]
      );
    } else {
      await db.run(
        `UPDATE groups SET
           name = 'Ingliz tili (C1 daraja)',
           teacher = 'Diyorbek Mirzaolimov (C1)',
           teacher_id = ?,
           days = 'Seshanba, payshanba, shanba',
           time_slot = '16:30–18:30',
           is_kids = 0
         WHERE id = ?`,
        [teacherDiyor?.id || null, g1.id]
      );
    }

    // English Kids Group (Doniyorbek Mirzaolimov, B2)
    const gKids = await db.get('SELECT id FROM groups WHERE course_id = ? AND is_kids = 1', [engCourse.id]);
    if (!gKids) {
      await db.run(
        `INSERT INTO groups (course_id, teacher_id, name, teacher, days, time_slot, start_date, max_students, is_kids, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
        [
          engCourse.id,
          teacherDoniyor?.id || null,
          'Kids guruhi (B2 daraja)',
          'Doniyorbek Mirzaolimov (B2, Kids)',
          'Seshanba, payshanba, shanba',
          '16:30–18:30',
          '2026-11-03',
          12,
          now,
        ]
      );
    } else {
      await db.run(
        `UPDATE groups SET
           name = 'Kids guruhi (B2 daraja)',
           teacher = 'Doniyorbek Mirzaolimov (B2, Kids)',
           teacher_id = ?,
           days = 'Seshanba, payshanba, shanba',
           time_slot = '16:30–18:30',
           is_kids = 1
         WHERE id = ?`,
        [teacherDoniyor?.id || null, gKids.id]
      );
    }
  }

  if (histCourse) {
    // History Group (Kholmirzayev Og‘abek, Daraja A)
    const gHist = await db.get('SELECT id FROM groups WHERE course_id = ?', [histCourse.id]);
    if (!gHist) {
      await db.run(
        `INSERT INTO groups (course_id, teacher_id, name, teacher, days, time_slot, start_date, max_students, is_kids, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`,
        [
          histCourse.id,
          teacherOgabek?.id || null,
          'Tarix (A daraja)',
          'Kholmirzayev Og‘abek (Daraja A)',
          'Seshanba, payshanba, shanba',
          '16:00–18:00',
          '2026-11-03',
          15,
          now,
        ]
      );
    } else {
      await db.run(
        `UPDATE groups SET
           name = 'Tarix (A daraja)',
           teacher = 'Kholmirzayev Og‘abek (Daraja A)',
           teacher_id = ?,
           days = 'Seshanba, payshanba, shanba',
           time_slot = '16:00–18:00',
           is_kids = 0
         WHERE id = ?`,
        [teacherOgabek?.id || null, gHist.id]
      );
    }
  }

  // 4. Seed official admin user: ieltscampadmin1010 / admin1010
  const officialAdmin = await db.get('SELECT id FROM admin_users WHERE username = ?', ['ieltscampadmin1010']);
  if (!officialAdmin) {
    const { hash, salt } = hashPassword('admin1010');
    await db.run(
      `INSERT INTO admin_users (username, password_hash, salt, role, must_change_password, created_at)
       VALUES ('ieltscampadmin1010', ?, ?, 'admin', 1, ?)`,
      [hash, salt, now]
    );
    console.log('[Database] Official admin user "ieltscampadmin1010" created with initial password.');
  }

  // 5. Seed default site settings
  const defaultSettings: Record<string, string> = {
    phone: '+998 97 482 06 26',
    email: 'info@ieltscamp.uz',
    address: 'Toshkent shahri, Yunusobod tumani (Mo‘ljal: Shahriston metro yaqinida)',
    hero_title: 'Kelajagingizni bilim bilan quring!',
    hero_subtitle:
      'Ingliz tili, CEFR va tarix fanlaridan bilimlaringizni rivojlantiring. O‘zingizga mos kursni tanlang va IELTS CAMP bilan ta’lim yo‘lingizni boshlang.',
    work_hours: 'Dushanba – Shanba: 09:00 – 19:00',
    telegram_admin_url: 'https://t.me/diyorbek_mirzaolim0v',
    telegram_admin_username: '@diyorbek_mirzaolim0v',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = await db.get('SELECT key FROM site_settings WHERE key = ?', [key]);
    if (!existing) {
      await db.run('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)', [key, value, now]);
    }
  }

  console.log('[Database] Ready with official course, teacher, admin data, and site settings.');
}
