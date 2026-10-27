# IELTS CAMP — Kurslarga ro‘yxatdan o‘tish va arizalarni boshqarish platformasi

Ushbu loyiha **IELTS Camp** o‘quv markazi uchun mo‘ljallangan to‘liq ishlaydigan (full-stack), xavfsiz va zamonaviy veb-platformadir.

Platforma orqali o‘quvchilar:
1. **Ingliz tili / CEFR**
2. **Tarix**

kurslariga online ariza topshiradilar, arizalar esa ma’lumotlar bazasida doimiy saqlanadi, Telegram orqali administratorga xabar boradi hamda himoyalangan `/admin` boshqaruv paneli orqali boshqariladi.

---

## 1. Asosiy imkoniyatlar

- **Ommaviy veb-sayt (Frontend)**:
  - Zamonaviy va brend ranglariga mos dizayn (`#101A35`, `#2457F5`, `#FFC857`, `#F5F7FC`).
  - Hero bo‘limi: *“Maqsading sari birinchi qadamni bugun qo‘y!”*
  - Dinamik kurs kartalari (Ingliz tili / CEFR va Tarix) — ma’lumotlar bevosita bazadan yuklanadi.
  - Biz haqimizda, ta’lim afzalliklari, 4 bosqichli o‘qish jarayoni, FAQ va aloqa bo‘limi.
  - Mobil, planshet va kompyuter ekranlariga 100% mos (Responsive).

- **Online ro‘yxatdan o‘tish formasi**:
  - Ism, Familiya, Telefon (+998 formati validatsiyasi).
  - Tug‘ilgan sana (ixtiyoriy).
  - Kurs tanlovi va tanlangan kursga mos ravishda Ingliz tili darajasi (Beginner dan IELTS Graduation gacha).
  - Qulay dars vaqti (Ertalab, Tushdan keyin, Kechqurun).
  - Qo‘shimcha maqsad/izoh va shaxsiy ma’lumotlarni qayta ishlashga rozilik.
  - Takroriy bosishdan himoya (Anti double-click) va yuklanish indikatori.
  - Muvaffaqiyatli topshirilgach unikal Ariza raqami (`#IC-26-XXXXX`) ko‘rsatiladi.

- **Himoyalangan Administrator paneli (`/admin`)**:
  - Xavfsiz PBKDF2 tuzlangan (salt) xeshli parol tekshiruvi va JWT avtorizatsiya.
  - **Dashboard**: Jami, Yangi, Ko‘rib chiqilmoqda, Bog‘lanildi, Qabul qilindi, Rad etildi, Guruhga yozildi statistikasi. Kurslar kesimidagi taqsimot.
  - **Arizalar boshqaruvi**: Ism, telefon yoki ariza kodi bo‘yicha tezkor qidiruv, holatlar va kurslar bo‘yicha filtr, sahifalash (pagination).
  - **Ariza holatlari**: `NEW` ➔ `REVIEWING` ➔ `CONTACTED` ➔ `APPROVED` ➔ `ENROLLED` ➔ `REJECTED`.
  - **Guruhga biriktirish**: Guruh sig‘imi to‘lgan bo‘lsa server tomonidan avtomatik tekshiriladi va ortiqcha o‘quvchi qo‘shilishiga yo‘l qo‘yilmaydi.
  - **Audit tarixi**: Har bir holat o‘zgarishi va admin izohlari sanasi va admin nomi bilan qayd etiladi.
  - **CSV Eksport**: Barcha arizalarni Excel uchun mos UTF-8 formatida yuklab olish.
  - **Kurslar va Guruhlar boshqaruvi**: Yangi kurs/guruh ochish, tahrirlash, o‘qituvchi va dars vaqtlarini belgilash.

- **Telegram Bot Integratsiyasi**:
  - Yangi ariza tushishi bilan adminning Telegram chatiga yoki guruhiga to‘liq ma’lumotlar bilan xabar yuboriladi.
  - Agar Telegram uzilib qolsa yoki bot sozlanmagan bo‘lsa, ariza bazaga xavfsiz saqlanib qoladi.
  - Admin panelida Telegram aloqasini test qilish va arizani qayta Telegramga yuborish imkoniyati mavjud.

---

## 2. Loyiha arxitekturasi va fayllar tuzilmasi

```
├── .env.example                     # Namunaviy konfiguratsiya parametrlari
├── package.json                     # Paketlar va buyruqlar
├── server.ts                        # Express full-stack backend va Vite middleware
├── src/
│   ├── types.ts                     # TypeScript tiplari
│   ├── server/
│   │   ├── db.ts                    # SQLite / PostgreSQL ko‘p qirrali ma’lumotlar bazasi adapteri
│   │   ├── auth.ts                  # JWT va PBKDF2 xavfsizlik hamda rate limiter
│   │   ├── telegram.ts              # Telegram Bot API integratsiyasi va qaydlar
│   │   └── api.ts                   # Barcha REST API endpointlari
│   ├── components/
│   │   ├── Navbar.tsx               # 3 zonali bosh navigatsiya
│   │   ├── Hero.tsx                 # Bosh sarlavha, vizual va KPI bloklari
│   │   ├── CoursesSection.tsx       # Ingliz tili / CEFR va Tarix kurs kartalari
│   │   ├── RegistrationModal.tsx    # Ro‘yxatdan o‘tish va tasdiqlash modali
│   │   ├── AboutSection.tsx         # Markaz afzalliklari
│   │   ├── ProcessSection.tsx       # O‘qish bosqichlari
│   │   ├── FaqSection.tsx           # Savol-javoblar
│   │   ├── ContactSection.tsx       # Aloqa va dars jadvali
│   │   ├── Footer.tsx               # Saytning quyi qismi
│   │   ├── AdminLogin.tsx           # Administrator kirish oynasi
│   │   └── AdminPanel.tsx           # To‘liq admin boshqaruv paneli
│   ├── assets/images/               # Fotorealistik sifatli rasmlar
│   ├── App.tsx                      # Asosiy ilova
│   ├── main.tsx                     # React kirish nuqtasi
│   └── index.css                    # Tailwind CSS va shriftlar
└── test/
    └── api.test.ts                  # 15 ta avtomatlashtirilgan test to‘plami
```

---

## 3. O‘rnatish va ishga tushirish

### 1. Bog‘liqliklarni o‘rnatish:
```bash
npm install
```

### 2. Dasturni ishga tushirish (Development rejimi):
```bash
npm run dev
```
Server `http://localhost:3000` manzilida ishga tushadi.

### 3. Testlarni tekshirish:
```bash
npm test
```
Barcha 15 ta talab bo‘yicha testlar avtomatik tekshiriladi.

### 4. Ishlab chiqarish (Production build):
```bash
npm run build
npm start
```

---

## 4. Ma’lumotlar bazasi (Database)

Tizim **ikki xil ma’lumotlar bazasi rejimini** qo‘llab-quvvatlaydi:

1. **Standart (Zero-config, o‘z-o‘zidan ishlaydigan SQLite)**:
   - Hech qanday tashqi ma’lumotlar bazasini o‘rnatish shart emas.
   - Barcha ma’lumotlar doimiy ravishda `./data/ielts_camp.db` faylida saqlanadi. Sayt qayta yuklanganda ham ma’lumotlar yo‘qolmaydi.

2. **PostgreSQL**:
   - Agar tashqi PostgreSQL bazasiga ulamoqchi bo‘lsangiz, `.env` faylida `DATABASE_URL` parametrini ko‘rsatish kifoya:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/ielts_camp"
     ```
   - Server ishga tushganda jadvallar (`admin_users`, `courses`, `groups`, `applications`, `application_status_history`, `notification_logs`, `audit_logs`) va indekslarni avtomatik migratsiya qiladi.

---

## 5. Admin hisobi va xavfsizlik

- **Yagona Administrator paneli**: `/admin` yoki `/admin/login`
- **Rasmiy boshlang‘ich hisob**:
  - **Login:** `ieltscampadmin1010`
  - **Boshlang‘ich parol:** `admin1010`
- **Birinchi kirishda parolni almashtirish talabi**: Admin birinchi marta kirganida, tizim xavfsizlik yuzasidan boshlang‘ich parolni kamida 8 ta belgidan iborat yangi, kuchli parolga almashtirishni majburiy talab qiladi.
- Parol serverda **PBKDF2** (100,000 iteratsiya, sha512) va alohida tuz (salt) bilan xeshlangan holda saqlanadi.
- Oddiy tashrif buyuruvchilar `role=admin` yuborish bilan admin huquqini ololmaydi. Boshqa administrator hisoblari ro‘yxatdan o‘tkazilmaydi.
- Admin paneliga to‘g‘ridan-to‘g‘ri kirish server tomonida JWT tokeni orqali qat’iy tekshiriladi.
- Spam va botlarga qarshi `rate limiter` himoyasi o‘rnatilgan.

---

## 6. Telegram Botni ulash bosqichlari

1. Telegramda **@BotFather** botiga kiring va `/newbot` buyrug‘ini yuboring.
2. Botga nom bering (masalan: `IELTS Camp Admissions`) va username tanlang (masalan: `ielts_camp_admission_bot`).
3. BotFather taqdim etgan **Token**ni oling.
4. Xabarlar borishi kerak bo‘lgan shaxsiy chat_id yoki guruh identifikatorini aniqlang (Guruhga botni qo‘shib, unga administrator huquqini bering).
5. `.env` fayliga quyidagi parametrlarni kiriting:
   ```env
   TELEGRAM_BOT_TOKEN="sizning_bot_tokeningiz"
   TELEGRAM_CHAT_ID="sizning_chat_yoki_guruh_id"
   ```
6. Admin panelidagi **Telegram Bot** bo‘limiga kirib, **“Sinov xabarini yuborish”** tugmasini bosing va integratsiyani tekshiring!

---

## 7. Avtomatlashtirilgan testlar natijasi

Loyihaning test to‘plami (`npm test`) quyidagi 15 ta talabni amalda to‘liq sinovdan o‘tkazadi:

| # | Test talabi | Natija |
|---|---|---|
| 1 | Kurslar ro‘yxati ochiladi va dastlabki kurslar mavjud | ✅ PASS |
| 2 | Ingliz tili / CEFR uchun ariza bazaga saqlanadi | ✅ PASS |
| 3 | Tarix kursi uchun ariza muvaffaqiyatli saqlanadi | ✅ PASS |
| 4 | Noto‘g‘ri telefon raqami formati aniqlanadi | ✅ PASS |
| 5 | Majburiy maydonlar bo‘sh bo‘lsa ariza to‘xtatiladi | ✅ PASS |
| 6 | Ariza ma’lumotlar bazasidan qayta o‘qiladi | ✅ PASS |
| 7 | Admin login va parolni tekshirish ishlaydi | ✅ PASS |
| 8 | Himoyalangan endpoint noto‘g‘ri tokenni rad etadi | ✅ PASS |
| 9 | Admin arizaning holatini yangilay oladi va tarix yoziladi | ✅ PASS |
| 10 | Telegram sozlamalari tekshiruvi xavfsiz ishlaydi | ✅ PASS |
| 11 | Telegram ishlamasa ham ariza bazaga saqlanadi | ✅ PASS |
| 12 | Guruh limiti tekshiruvi ortiqcha o‘quvchini bloklaydi | ✅ PASS |
| 13 | Tushunarli o‘zbek tilidagi xato xabarlari ta’minlangan | ✅ PASS |
| 14 | Bir xil raqamdan bir nechta kurs arizasi qonuniy qabul qilinadi | ✅ PASS |
| 15 | Ma’lumotlar bazasi doimiyligi (Persistence) | ✅ PASS |

**Xulosa: JAMI: 15 | O‘TDI: 15 | XATO: 0**
