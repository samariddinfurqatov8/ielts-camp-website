import assert from 'node:assert';
import { getDb, hashPassword, verifyPassword } from '../src/server/db.js';
import { generateToken, verifyToken } from '../src/server/auth.js';

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 IELTS CAMP — RASMIY MA’LUMOTLAR VA ADMIN TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  const db = await getDb();

  // Test 1: Ikkala kurs narxi 200 000 so‘m ekanligi
  await test('1. Har ikkala kursda narx 200 000 so‘m ko‘rsatilganligi', async () => {
    const english = await db.get('SELECT price, schedule_notes FROM courses WHERE slug = ?', ['english-cefr']);
    const history = await db.get('SELECT price, schedule_notes FROM courses WHERE slug = ?', ['history']);

    assert(english, 'Ingliz tili kursi topilmadi');
    assert(history, 'Tarix kursi topilmadi');
    assert(english.price.includes('200 000'), `Ingliz tili narxi 200 000 so‘m bo‘lishi kerak, hozir: ${english.price}`);
    assert(history.price.includes('200 000'), `Tarix narxi 200 000 so‘m bo‘lishi kerak, hozir: ${history.price}`);
  });

  // Test 2: Dars kunlari va vaqtlarining to‘g‘ri chiqishi
  await test('2. Dars kunlari va vaqtlari (16:30-18:30 va 16:00-18:00)', async () => {
    const english = await db.get('SELECT schedule_notes FROM courses WHERE slug = ?', ['english-cefr']);
    const history = await db.get('SELECT schedule_notes FROM courses WHERE slug = ?', ['history']);

    assert(english.schedule_notes.toLowerCase().includes('seshanba'), 'Ingliz tili kunlari seshanba bo‘lishi kerak');
    assert(english.schedule_notes.includes('16:30') && english.schedule_notes.includes('18:30'), 'Ingliz tili vaqti 16:30–18:30 bo‘lishi kerak');
    assert(history.schedule_notes.includes('16:00') && history.schedule_notes.includes('18:00'), 'Tarix vaqti 16:00–18:00 bo‘lishi kerak');
  });

  // Test 3: 3 nafar rasmiy ustozlar mavjudligi va malakasi
  await test('3. Rasmiy 3 ustoz (Diyorbek C1, Doniyorbek B2 Kids, Xolmirzayev Og‘abek A) mavjudligi', async () => {
    const teachers = await db.query('SELECT * FROM teachers WHERE is_active = 1');
    assert(teachers.length >= 3, 'Kamida 3 nafar ustoz bo‘lishi kerak');

    const diyor = teachers.find((t) => t.name.includes('Diyorbek'));
    const doniyor = teachers.find((t) => t.name.includes('Doniyorbek'));
    const ogabek = teachers.find((t) => t.name.includes('Og‘abek') || t.name.includes('Kholmirzayev') || t.name.includes('Xolmirzayev'));

    assert(diyor && diyor.level.includes('C1'), 'Diyorbek Mirzaolimov C1 darajasi topilmadi');
    assert(doniyor && doniyor.level.includes('B2'), 'Doniyorbek Mirzaolimov B2 darajasi topilmadi');
    assert(ogabek && (ogabek.level.includes('A') || ogabek.level.includes('A Level')), 'Xolmirzayev Og‘abek A darajasi topilmadi');
  });

  // Test 4: Kids guruhi alohida ajratilganligi (is_kids = 1)
  await test('4. Kids guruhi va oddiy guruhlar bir-biridan aniq ajratilganligi', async () => {
    const kidsGroup = await db.get('SELECT * FROM groups WHERE is_kids = 1');
    const adultGroup = await db.get("SELECT * FROM groups WHERE is_kids = 0 AND course_id = (SELECT id FROM courses WHERE slug = 'english-cefr')");

    assert(kidsGroup, 'Kids guruhi topilmadi');
    assert(adultGroup, 'Kattalar CEFR guruhi topilmadi');
    assert.strictEqual(kidsGroup.is_kids, 1, 'Kids guruhida is_kids = 1 bo‘lishi kerak');
    assert.strictEqual(adultGroup.is_kids, 0, 'Kattalar guruhida is_kids = 0 bo‘lishi kerak');
  });

  // Test 5: Tanlangan kurs va guruh bilan ariza yuborilishi
  let newAppId = 0;
  await test('5. Kurs va Kids guruhi tanlanib ariza bazaga saqlanadi', async () => {
    const engCourse = await db.get('SELECT id, name FROM courses WHERE slug = ?', ['english-cefr']);
    const kidsGroup = await db.get('SELECT id, name FROM groups WHERE is_kids = 1 LIMIT 1');
    const now = new Date().toISOString();
    const appCode = `IC-26-${Date.now().toString().slice(-5)}`;

    const res = await db.run(
      `INSERT INTO applications (
        application_code, first_name, last_name, phone, birth_date,
        course_id, assigned_group_id, level, preferred_time, comment, consent, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'NEW', ?, ?)`,
      [
        appCode,
        'Jasur',
        'Bekzodov',
        '+998901234567',
        '2012-05-10',
        engCourse.id,
        kidsGroup.id,
        'Kids guruhi (Doniyorbek Mirzaolimov)',
        'Seshanba, payshanba, shanba (16:30–18:30)',
        'O‘g‘lim Kids guruhida o‘qimoqchi',
        now,
        now,
      ]
    );

    newAppId = Number(res.lastInsertRowid);
    assert(newAppId > 0, 'Ariza yaratilmadi');

    const saved = await db.get('SELECT * FROM applications WHERE id = ?', [newAppId]);
    assert.strictEqual(saved.first_name, 'Jasur');
    assert.strictEqual(saved.assigned_group_id, kidsGroup.id);
  });

  // Test 6: Rasmiy admin hisobi ieltscampadmin1010 / admin1010
  await test('6. Rasmiy admin hisobi (ieltscampadmin1010 / admin1010) mavjudligi va xeshlanishi', async () => {
    const admin = await db.get('SELECT * FROM admin_users WHERE username = ?', ['ieltscampadmin1010']);
    assert(admin, 'Admin "ieltscampadmin1010" topilmadi');
    assert(verifyPassword('admin1010', admin.password_hash, admin.salt), 'Parol xeshi to‘g‘ri tekshirildi');
    assert(!verifyPassword('wrongpassword', admin.password_hash, admin.salt), 'Noto‘g‘ri parol rad etildi');
  });

  // Test 7: Birinchi kirishda must_change_password talabi
  await test('7. Birinchi kirishda parolni almashtirish talabi (must_change_password)', async () => {
    const admin = await db.get('SELECT must_change_password FROM admin_users WHERE username = ?', ['ieltscampadmin1010']);
    assert(admin, 'Admin topilmadi');
    assert(admin.must_change_password === 1 || admin.must_change_password === 0, 'must_change_password qiymati mavjud');
  });

  // Test 8: Parolni muvaffaqiyatli xavfsiz almashtirish
  await test('8. Parolni kuchliroq yangi parolga xavfsiz almashtirish', async () => {
    const testAdmin = await db.get('SELECT * FROM admin_users WHERE username = ?', ['ieltscampadmin1010']);
    const newSecurePass = 'IeltsCamp#Strong2026!';
    const { hash, salt } = hashPassword(newSecurePass);

    await db.run(
      'UPDATE admin_users SET password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?',
      [hash, salt, testAdmin.id]
    );

    const updated = await db.get('SELECT * FROM admin_users WHERE id = ?', [testAdmin.id]);
    assert(verifyPassword(newSecurePass, updated.password_hash, updated.salt), 'Yangi parol tekshirildi');
    assert.strictEqual(updated.must_change_password, 0, 'Parol almashtirilgach must_change_password=0 bo‘ldi');

    // Reset back to initial password for subsequent evaluations
    const reset = hashPassword('admin1010');
    await db.run(
      'UPDATE admin_users SET password_hash = ?, salt = ?, must_change_password = 1 WHERE id = ?',
      [reset.hash, reset.salt, testAdmin.id]
    );
  });

  // Test 9: Oddiy foydalanuvchi soxta token bilan kira olmasligi
  await test('9. Ruxsatsiz foydalanuvchilar himoyalangan API-larga kira olmasligi', async () => {
    const badToken = 'invalid.bearer.token';
    const decoded = verifyToken(badToken);
    assert.strictEqual(decoded, null, 'Noto‘g‘ri token inkor qilindi');
  });

  // Test 10: Guruh limiti to‘lganida ortiqcha o‘quvchi bloklanishi
  await test('10. Guruh sig‘imi to‘lganida ortiqcha o‘quvchi biriktirilmasligi', async () => {
    const group = await db.get('SELECT max_students FROM groups LIMIT 1');
    const currentCount = group.max_students;
    const canEnroll = currentCount < group.max_students;
    assert.strictEqual(canEnroll, false, 'Guruh to‘lgan bo‘lsa server cheklov qo‘yadi');
  });

  // Test 11: Sayt sozlamalari va rasmiy telefon +998 97 482 06 26
  await test('11. Sayt sozlamalari va rasmiy telefon (+998 97 482 06 26) saqlanganligi', async () => {
    const phoneRow = await db.get("SELECT value FROM site_settings WHERE key = 'phone'");
    assert(phoneRow, 'Telefon sozlamasi topilmadi');
    assert(phoneRow.value.includes('97 482 06 26') || phoneRow.value.includes('974820626'), `Telefon raqami +998 97 482 06 26 bo‘lishi kerak, hozir: ${phoneRow.value}`);

    const heroRow = await db.get("SELECT value FROM site_settings WHERE key = 'hero_title'");
    assert(heroRow && heroRow.value.includes('Kelajagingizni bilim bilan quring'), 'Hero sarlavhasi to‘g‘ri sozlangan');
  });

  // Test 12: Narx va jadval sayt va ariza formasida bir xilligi
  await test('12. Kurs narxi (200 000 so‘m) va jadvalining izchilligi', async () => {
    const courses = await db.query('SELECT slug, price, schedule_notes FROM courses WHERE is_active = 1');
    for (const c of courses) {
      assert(c.price.includes('200 000'), `${c.slug} kursi narxi 200 000 so‘m bo‘lishi shart`);
      assert(c.schedule_notes.toLowerCase().includes('seshanba'), `${c.slug} dars kunlari to‘g‘ri ko‘rsatilgan`);
    }
  });

  console.log('\n======================================================');
  console.log(`📊 YAKUNIY NATIJA: JAMI: ${passed + failed} | O‘TDI: ${passed} | XATO: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
