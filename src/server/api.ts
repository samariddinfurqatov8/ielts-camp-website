import { Router, Request, Response } from 'express';
import { getDb, verifyPassword, hashPassword } from './db.js';
import { generateToken, requireAdminAuth, AuthenticatedRequest, createRateLimiter } from './auth.js';

export const apiRouter = Router();

// Rate limiter for application submission: max 10 requests per 5 minutes per IP
const applicationRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: 'Juda ko‘p so‘rov yuborildi. Iltimos, bir necha daqiqadan so‘ng qayta urinib ko‘ring.',
});

// Rate limiter for login: max 8 attempts per 5 minutes per IP
const loginRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 8,
  message: 'Kirish uchun juda ko‘p muvaffaqiyatsiz urinish. Iltimos, 5 daqiqa kuting.',
});

// Helper to normalize and validate Uzbek phone numbers (+998...)
function normalizePhone(phone: string): { valid: boolean; normalized: string } {
  if (!phone) return { valid: false, normalized: '' };
  const cleaned = phone.replace(/[^\d+]/g, '');
  const uzbRegex = /^(\+?998)[0-9]{9}$/;
  if (uzbRegex.test(cleaned)) {
    const norm = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    return { valid: true, normalized: norm };
  }
  const intlRegex = /^\+?[0-9]{9,15}$/;
  if (intlRegex.test(cleaned)) {
    const norm = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    return { valid: true, normalized: norm };
  }
  return { valid: false, normalized: cleaned };
}

function generateApplicationCode(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `IC-26-${randomNum}`;
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// 1. GET /settings & /api/settings - Public site contact and brand settings
apiRouter.get(['/settings', '/api/settings'], async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db.query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {
      phone: '+998 97 482 06 26',
      email: 'info@ieltscamp.uz',
      address: 'Toshkent shahri, Yunusobod tumani (Mo‘ljal: Shahriston metro yaqinida)',
      hero_title: 'Kelajagingizni bilim bilan quring!',
      hero_subtitle:
        'Ingliz tili, CEFR va tarix fanlaridan bilimlaringizni rivojlantiring. O‘zingizga mos kursni tanlang va IELTS CAMP bilan ta’lim yo‘lingizni boshlang.',
      work_hours: 'Dushanba – Shanba: 09:00 – 19:00',
    };

    for (const r of rows) {
      settings[r.key] = r.value;
    }

    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Sozlamalarni olishda xatolik yuz berdi.' });
  }
});

// 2. GET /courses & /api/courses - List active courses with real schedule, price, and teachers
apiRouter.get(['/courses', '/api/courses'], async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const courses = await db.query(
      `SELECT id, slug, name, description, price, duration, schedule_notes, levels_json, max_capacity, is_active
       FROM courses WHERE is_active = 1 ORDER BY id ASC`
    );

    const allTeachers = await db.query('SELECT * FROM teachers WHERE is_active = 1 ORDER BY id ASC');
    const allGroups = await db.query(`
      SELECT g.*, t.name as teacher_full_name, t.level as teacher_level
      FROM groups g
      LEFT JOIN teachers t ON g.teacher_id = t.id
      WHERE g.is_active = 1
      ORDER BY g.is_kids ASC, g.id ASC
    `);

    const formatted = courses.map((c) => {
      const matchingTeachers = allTeachers.filter((t) => {
        if (c.slug === 'english-cefr') {
          return t.subject.toLowerCase().includes('ingliz');
        }
        return t.subject.toLowerCase().includes('tarix');
      });

      const matchingGroups = allGroups.filter((g) => g.course_id === c.id);

      return {
        ...c,
        levels: JSON.parse(c.levels_json || '[]'),
        teachers: matchingTeachers,
        groups: matchingGroups,
      };
    });

    res.json({ success: true, courses: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Kurslar ro‘yxatini yuklashda xatolik yuz berdi' });
  }
});

// 3. GET /teachers & /api/teachers - List public active teachers
apiRouter.get(['/teachers', '/api/teachers'], async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const teachers = await db.query(
      'SELECT id, name, subject, level, bio, photo_url FROM teachers WHERE is_active = 1 ORDER BY id ASC'
    );
    res.json({ success: true, teachers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Ustozlar ma’lumotini yuklashda xatolik yuz berdi' });
  }
});

// 4. GET /courses/:id & /api/courses/:id - Single course details
apiRouter.get(['/courses/:id', '/api/courses/:id'], async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const courseId = Number(req.params.id);
    const course = await db.get(
      `SELECT id, slug, name, description, price, duration, schedule_notes, levels_json, max_capacity, is_active
       FROM courses WHERE id = ? AND is_active = 1`,
      [courseId]
    );

    if (!course) {
      res.status(404).json({ success: false, error: 'Kurs topilmadi' });
      return;
    }

    const groups = await db.query(
      `SELECT g.*, t.name as teacher_full_name, t.level as teacher_level
       FROM groups g
       LEFT JOIN teachers t ON g.teacher_id = t.id
       WHERE g.course_id = ? AND g.is_active = 1 ORDER BY g.is_kids ASC, g.id ASC`,
      [courseId]
    );

    res.json({
      success: true,
      course: {
        ...course,
        levels: JSON.parse(course.levels_json || '[]'),
        groups,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Kurs ma’lumotini olishda xatolik yuz berdi' });
  }
});

// 5. GET /groups & /api/groups - Open groups
apiRouter.get(['/groups', '/api/groups'], async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const courseId = req.query.courseId ? Number(req.query.courseId) : null;

    let sql = `
      SELECT g.id, g.course_id, g.name, g.teacher, g.days, g.time_slot, g.start_date, g.max_students, g.is_kids, g.is_active,
             t.name as teacher_full_name, t.level as teacher_level,
             (SELECT COUNT(*) FROM applications a WHERE a.assigned_group_id = g.id AND a.status = 'ENROLLED') as enrolled_count
      FROM groups g
      LEFT JOIN teachers t ON g.teacher_id = t.id
      WHERE g.is_active = 1
    `;
    const params: any[] = [];

    if (courseId) {
      sql += ` AND g.course_id = ?`;
      params.push(courseId);
    }
    sql += ` ORDER BY g.is_kids ASC, g.id ASC`;

    const groups = await db.query(sql, params);
    res.json({ success: true, groups });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Guruhlar ma’lumotini olishda xatolik yuz berdi' });
  }
});

// 6. POST /applications & /api/applications - Submit new application
apiRouter.post(['/applications', '/api/applications'], applicationRateLimiter, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const {
      firstName,
      lastName,
      phone,
      birthDate,
      courseId,
      groupId,
      level,
      preferredTime,
      comment,
      consent,
    } = req.body;

    // Validation
    if (!firstName || !firstName.trim()) {
      res.status(400).json({ success: false, error: 'Ismingizni kiriting.' });
      return;
    }
    if (!lastName || !lastName.trim()) {
      res.status(400).json({ success: false, error: 'Familiyangizni kiriting.' });
      return;
    }
    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, error: 'Telefon raqamingizni kiriting.' });
      return;
    }

    const phoneCheck = normalizePhone(phone);
    if (!phoneCheck.valid) {
      res.status(400).json({
        success: false,
        error: 'Telefon raqami formati noto‘g‘ri. Masalan: +998 90 123 45 67',
      });
      return;
    }

    if (!courseId) {
      res.status(400).json({ success: false, error: 'Iltimos, o‘zingizga mos kursni tanlang.' });
      return;
    }

    const course = await db.get(
      'SELECT id, name, slug, price, schedule_notes FROM courses WHERE id = ? AND is_active = 1',
      [Number(courseId)]
    );
    if (!course) {
      res.status(400).json({ success: false, error: 'Tanlangan kurs mavjud emas yoki faol emas.' });
      return;
    }

    let assignedGroup: any = null;
    if (groupId) {
      assignedGroup = await db.get(
        'SELECT id, name, is_kids, teacher FROM groups WHERE id = ? AND course_id = ? AND is_active = 1',
        [Number(groupId), course.id]
      );
    }

    if (!preferredTime || !preferredTime.trim()) {
      res.status(400).json({ success: false, error: 'Qulay dars vaqtini tanlang.' });
      return;
    }

    if (!consent) {
      res.status(400).json({
        success: false,
        error: 'Shaxsiy ma’lumotlarni qayta ishlashga rozilik bildirishingiz shart.',
      });
      return;
    }

    // Generate unique application code
    let applicationCode = generateApplicationCode();
    let codeExists = await db.get('SELECT id FROM applications WHERE application_code = ?', [applicationCode]);
    while (codeExists) {
      applicationCode = generateApplicationCode();
      codeExists = await db.get('SELECT id FROM applications WHERE application_code = ?', [applicationCode]);
    }

    const now = new Date().toISOString();

    const insertResult = await db.run(
      `INSERT INTO applications (
        application_code, first_name, last_name, phone, birth_date,
        course_id, level, preferred_time, comment, consent, status,
        assigned_group_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?)`,
      [
        applicationCode,
        firstName.trim(),
        lastName.trim(),
        phoneCheck.normalized,
        birthDate ? birthDate.trim() : '',
        course.id,
        level ? level.trim() : '',
        preferredTime.trim(),
        comment ? comment.trim() : '',
        1,
        assignedGroup ? assignedGroup.id : null,
        now,
        now,
      ]
    );

    const applicationId = Number(insertResult.lastInsertRowid || 0);

    // Record initial status history
    await db.run(
      `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes, created_at)
       VALUES (?, 'NONE', 'NEW', 'system', ?, ?)`,
      [
        applicationId,
        assignedGroup
          ? `Ariza online yuborildi (Tanlangan guruh: ${assignedGroup.name})`
          : 'Ariza online yuborildi',
        now,
      ]
    );

    res.status(201).json({
      success: true,
      applicationCode,
      courseName: course.name,
      coursePrice: course.price,
      groupName: assignedGroup?.name,
      message: 'Arizangiz muvaffaqiyatli qabul qilindi! Administratorimiz tez orada siz bilan bog‘lanadi.',
    });
  } catch (err: any) {
    console.error('[Application Submit Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Arizani saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
    });
  }
});

// ==========================================
// ADMIN AUTH ENDPOINTS
// ==========================================

// POST /admin/login & /api/admin/login
apiRouter.post(['/admin/login', '/api/admin/login'], loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, error: 'Login va parolni kiriting.' });
      return;
    }

    const db = await getDb();
    const admin = await db.get(
      'SELECT id, username, password_hash, salt, role, must_change_password FROM admin_users WHERE username = ?',
      [username.trim()]
    );

    if (!admin) {
      res.status(401).json({ success: false, error: 'Login yoki parol noto‘g‘ri.' });
      return;
    }

    const isValid = verifyPassword(password, admin.password_hash, admin.salt);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Login yoki parol noto‘g‘ri.' });
      return;
    }

    const mustChangePassword = Boolean(admin.must_change_password);

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      must_change_password: mustChangePassword,
    });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      mustChangePassword,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        must_change_password: mustChangePassword,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Kirishda xatolik yuz berdi.' });
  }
});

// POST /admin/change-password & /api/admin/change-password
apiRouter.post(
  ['/admin/change-password', '/api/admin/change-password'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: 'Joriy va yangi parolni kiriting.' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ success: false, error: 'Yangi parol kamida 8 ta belgidan iborat bo‘lishi kerak.' });
        return;
      }

      if (newPassword === 'admin1010' || newPassword === currentPassword) {
        res.status(400).json({ success: false, error: 'Yangi parol boshlang‘ich paroldan farq qilishi lozim.' });
        return;
      }

      const db = await getDb();
      const admin = await db.get('SELECT * FROM admin_users WHERE id = ?', [req.adminUser!.id]);
      if (!admin) {
        res.status(404).json({ success: false, error: 'Admin topilmadi.' });
        return;
      }

      const isCurrentValid = verifyPassword(currentPassword, admin.password_hash, admin.salt);
      if (!isCurrentValid) {
        res.status(400).json({ success: false, error: 'Joriy parol noto‘g‘ri kiritildi.' });
        return;
      }

      const { hash, salt } = hashPassword(newPassword);
      await db.run(
        'UPDATE admin_users SET password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?',
        [hash, salt, admin.id]
      );

      const newToken = generateToken({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        must_change_password: false,
      });

      res.cookie('admin_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        token: newToken,
        message: 'Parol muvaffaqiyatli almashtirildi va tizim himoyalandi!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Parolni almashtirishda xatolik yuz berdi.' });
    }
  }
);

// POST /admin/logout & /api/admin/logout
apiRouter.post(['/admin/logout', '/api/admin/logout'], (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Tizimdan muvaffaqiyatli chiqildi.' });
});

// GET /admin/me & /api/admin/me
apiRouter.get(['/admin/me', '/api/admin/me'], requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDb();
  const admin = await db.get('SELECT id, username, role, must_change_password FROM admin_users WHERE id = ?', [
    req.adminUser!.id,
  ]);
  if (!admin) {
    res.status(401).json({ success: false, error: 'Foydalanuvchi topilmadi.' });
    return;
  }
  res.json({
    success: true,
    user: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      must_change_password: Boolean(admin.must_change_password),
    },
  });
});

// ==========================================
// ADMIN DASHBOARD & STATS
// ==========================================

apiRouter.get(['/admin/stats', '/api/admin/stats'], requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();

    const totalRow = await db.get('SELECT COUNT(*) as count FROM applications');
    const newRow = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'NEW'");
    const reviewingRow = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'REVIEWING'");
    const contactedRow = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'CONTACTED'");
    const approvedRow = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'APPROVED'");
    const rejectedRow = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'REJECTED'");
    const enrolledRow = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'ENROLLED'");

    const byCourse = await db.query(`
      SELECT c.id, c.name, COUNT(a.id) as total_applications
      FROM courses c
      LEFT JOIN applications a ON c.id = a.course_id
      GROUP BY c.id, c.name
      ORDER BY c.id ASC
    `);

    res.json({
      success: true,
      stats: {
        total: Number(totalRow?.count || 0),
        new: Number(newRow?.count || 0),
        reviewing: Number(reviewingRow?.count || 0),
        contacted: Number(contactedRow?.count || 0),
        approved: Number(approvedRow?.count || 0),
        rejected: Number(rejectedRow?.count || 0),
        enrolled: Number(enrolledRow?.count || 0),
        byCourse,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Statistikalarni yuklashda xatolik yuz berdi.' });
  }
});

// ==========================================
// ADMIN APPLICATIONS MANAGEMENT
// ==========================================

apiRouter.get(
  ['/admin/applications', '/api/admin/applications'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.max(1, Math.min(100, Number(req.query.limit || 15)));
      const offset = (page - 1) * limit;

      const search = req.query.q ? String(req.query.q).trim() : '';
      const status = req.query.status ? String(req.query.status).trim() : '';
      const courseId = req.query.courseId ? Number(req.query.courseId) : null;

      let whereSql = 'WHERE 1=1';
      const params: any[] = [];

      if (search) {
        whereSql += ` AND (
          a.first_name LIKE ? OR
          a.last_name LIKE ? OR
          a.phone LIKE ? OR
          a.application_code LIKE ?
        )`;
        const wild = `%${search}%`;
        params.push(wild, wild, wild, wild);
      }

      if (status && status !== 'ALL') {
        whereSql += ` AND a.status = ?`;
        params.push(status);
      }

      if (courseId) {
        whereSql += ` AND a.course_id = ?`;
        params.push(courseId);
      }

      const countRow = await db.get(`SELECT COUNT(*) as total FROM applications a ${whereSql}`, params);
      const totalCount = Number(countRow?.total || 0);

      const applications = await db.query(
        `SELECT a.*, c.name as course_name, g.name as group_name, g.is_kids as group_is_kids
         FROM applications a
         LEFT JOIN courses c ON a.course_id = c.id
         LEFT JOIN groups g ON a.assigned_group_id = g.id
         ${whereSql}
         ORDER BY a.id DESC
         LIMIT ${limit} OFFSET ${offset}`,
        params
      );

      res.json({
        success: true,
        applications,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Arizalarni olishda xatolik yuz berdi.' });
    }
  }
);

apiRouter.get(
  ['/admin/applications/export/csv', '/api/admin/applications/export/csv'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const rows = await db.query(`
        SELECT a.application_code, a.first_name, a.last_name, a.phone, a.birth_date,
               c.name as course_name, a.level, a.preferred_time, a.status, g.name as group_name,
               a.admin_notes, a.created_at
        FROM applications a
        LEFT JOIN courses c ON a.course_id = c.id
        LEFT JOIN groups g ON a.assigned_group_id = g.id
        ORDER BY a.id DESC
      `);

      let csv = '\uFEFF';
      csv += 'Ariza Raqami,Ism,Familiya,Telefon,Tugilgan Sana,Kurs,Daraja,Qulay Vaqt,Holat,Biriktirilgan Guruh,Admin Izohi,Sana\n';

      for (const r of rows) {
        const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
        csv +=
          [
            escape(r.application_code),
            escape(r.first_name),
            escape(r.last_name),
            escape(r.phone),
            escape(r.birth_date),
            escape(r.course_name),
            escape(r.level),
            escape(r.preferred_time),
            escape(r.status),
            escape(r.group_name),
            escape(r.admin_notes),
            escape(r.created_at),
          ].join(',') + '\n';
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=ielts_camp_applications_${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'CSV eksport qilishda xatolik yuz berdi.' });
    }
  }
);

apiRouter.get(
  ['/admin/applications/:id', '/api/admin/applications/:id'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const id = Number(req.params.id);

      const application = await db.get(
        `SELECT a.*, c.name as course_name, g.name as group_name, g.teacher as group_teacher, g.is_kids as group_is_kids
         FROM applications a
         LEFT JOIN courses c ON a.course_id = c.id
         LEFT JOIN groups g ON a.assigned_group_id = g.id
         WHERE a.id = ?`,
        [id]
      );

      if (!application) {
        res.status(404).json({ success: false, error: 'Ariza topilmadi.' });
        return;
      }

      const history = await db.query(
        `SELECT * FROM application_status_history WHERE application_id = ? ORDER BY id DESC`,
        [id]
      );

      res.json({
        success: true,
        application,
        history,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Ariza ma’lumotini olishda xatolik yuz berdi.' });
    }
  }
);

apiRouter.patch(
  ['/admin/applications/:id', '/api/admin/applications/:id'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const id = Number(req.params.id);
      const { status, adminNotes } = req.body;

      const currentApp = await db.get('SELECT * FROM applications WHERE id = ?', [id]);
      if (!currentApp) {
        res.status(404).json({ success: false, error: 'Ariza topilmadi.' });
        return;
      }

      const validStatuses = ['NEW', 'REVIEWING', 'CONTACTED', 'APPROVED', 'REJECTED', 'ENROLLED'];
      const newStatus = status && validStatuses.includes(status) ? status : currentApp.status;
      const notes = typeof adminNotes === 'string' ? adminNotes : currentApp.admin_notes;
      const now = new Date().toISOString();

      await db.run(`UPDATE applications SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?`, [
        newStatus,
        notes,
        now,
        id,
      ]);

      if (newStatus !== currentApp.status) {
        await db.run(
          `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, currentApp.status, newStatus, req.adminUser?.username || 'admin', notes || '', now]
        );
      }

      res.json({ success: true, message: 'Ariza holati yangilandi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Holatni yangilashda xatolik yuz berdi.' });
    }
  }
);

apiRouter.post(
  ['/admin/applications/:id/assign-group', '/api/admin/applications/:id/assign-group'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const applicationId = Number(req.params.id);
      const { groupId } = req.body;

      const application = await db.get('SELECT * FROM applications WHERE id = ?', [applicationId]);
      if (!application) {
        res.status(404).json({ success: false, error: 'Ariza topilmadi.' });
        return;
      }

      if (!groupId) {
        await db.run('UPDATE applications SET assigned_group_id = NULL, updated_at = ? WHERE id = ?', [
          new Date().toISOString(),
          applicationId,
        ]);
        res.json({ success: true, message: 'Guruhdan ajratildi.' });
        return;
      }

      const group = await db.get('SELECT * FROM groups WHERE id = ?', [Number(groupId)]);
      if (!group) {
        res.status(404).json({ success: false, error: 'Tanlangan guruh topilmadi.' });
        return;
      }

      const countRow = await db.get(
        "SELECT COUNT(*) as count FROM applications WHERE assigned_group_id = ? AND status = 'ENROLLED'",
        [group.id]
      );
      const currentEnrolled = Number(countRow?.count || 0);

      if (currentEnrolled >= group.max_students) {
        res.status(400).json({
          success: false,
          error: `Guruh to‘lgan! Maksimal sig‘im: ${group.max_students} nafar o‘quvchi.`,
        });
        return;
      }

      const now = new Date().toISOString();
      await db.run(
        "UPDATE applications SET assigned_group_id = ?, status = 'ENROLLED', updated_at = ? WHERE id = ?",
        [group.id, now, applicationId]
      );

      await db.run(
        `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes, created_at)
         VALUES (?, ?, 'ENROLLED', ?, ?, ?)`,
        [
          applicationId,
          application.status,
          req.adminUser?.username || 'admin',
          `Guruhga biriktirildi: ${group.name}`,
          now,
        ]
      );

      res.json({ success: true, message: `O‘quvchi ${group.name} guruhiga muvaffaqiyatli biriktirildi!` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Guruhga biriktirishda xatolik yuz berdi.' });
    }
  }
);

// ==========================================
// ADMIN TEACHERS MANAGEMENT
// ==========================================

apiRouter.get(
  ['/admin/teachers', '/api/admin/teachers'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const teachers = await db.query('SELECT * FROM teachers ORDER BY id ASC');
      res.json({ success: true, teachers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Ustozlarni olishda xatolik.' });
    }
  }
);

apiRouter.post(
  ['/admin/teachers', '/api/admin/teachers'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const { name, subject, level, bio, photoUrl } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Ustoz ismi kiritilishi shart.' });
        return;
      }

      const now = new Date().toISOString();
      const result = await db.run(
        `INSERT INTO teachers (name, subject, level, bio, photo_url, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          name.trim(),
          subject ? subject.trim() : '',
          level ? level.trim() : '',
          bio ? bio.trim() : '',
          photoUrl ? photoUrl.trim() : '',
          now,
          now,
        ]
      );

      res.status(201).json({ success: true, id: Number(result.lastInsertRowid || 0), message: 'Ustoz qo‘shildi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Ustoz qo‘shishda xatolik yuz berdi.' });
    }
  }
);

apiRouter.patch(
  ['/admin/teachers/:id', '/api/admin/teachers/:id'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const id = Number(req.params.id);
      const { name, subject, level, bio, photoUrl, isActive } = req.body;

      const teacher = await db.get('SELECT * FROM teachers WHERE id = ?', [id]);
      if (!teacher) {
        res.status(404).json({ success: false, error: 'Ustoz topilmadi.' });
        return;
      }

      const now = new Date().toISOString();
      await db.run(
        `UPDATE teachers SET
          name = ?,
          subject = ?,
          level = ?,
          bio = ?,
          photo_url = ?,
          is_active = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          name !== undefined ? name.trim() : teacher.name,
          subject !== undefined ? subject.trim() : teacher.subject,
          level !== undefined ? level.trim() : teacher.level,
          bio !== undefined ? bio.trim() : teacher.bio,
          photoUrl !== undefined ? photoUrl.trim() : teacher.photo_url,
          isActive !== undefined ? (isActive ? 1 : 0) : teacher.is_active,
          now,
          id,
        ]
      );

      res.json({ success: true, message: 'Ustoz ma’lumoti yangilandi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Ustozni tahrirlashda xatolik.' });
    }
  }
);

// ==========================================
// ADMIN COURSES & GROUPS MANAGEMENT
// ==========================================

apiRouter.get(
  ['/admin/courses', '/api/admin/courses'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const courses = await db.query('SELECT * FROM courses ORDER BY id ASC');
      const formatted = courses.map((c) => ({
        ...c,
        levels: JSON.parse(c.levels_json || '[]'),
      }));
      res.json({ success: true, courses: formatted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Kurslarni olishda xatolik.' });
    }
  }
);

apiRouter.post(
  ['/admin/courses', '/api/admin/courses'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const { slug, name, description, price, duration, scheduleNotes, levels, maxCapacity } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Kurs nomi kiritilishi shart.' });
        return;
      }

      const courseSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();
      const now = new Date().toISOString();

      const result = await db.run(
        `INSERT INTO courses (slug, name, description, price, duration, schedule_notes, levels_json, max_capacity, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          courseSlug,
          name.trim(),
          description ? description.trim() : '',
          price ? price.trim() : '200 000 so‘m',
          duration ? duration.trim() : '',
          scheduleNotes ? scheduleNotes.trim() : '',
          JSON.stringify(levels || []),
          Number(maxCapacity || 15),
          now,
          now,
        ]
      );

      res.status(201).json({ success: true, id: Number(result.lastInsertRowid || 0), message: 'Kurs yaratildi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Kurs yaratishda xatolik yuz berdi.' });
    }
  }
);

apiRouter.patch(
  ['/admin/courses/:id', '/api/admin/courses/:id'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const id = Number(req.params.id);
      const { name, description, price, duration, scheduleNotes, levels, maxCapacity, isActive } = req.body;

      const course = await db.get('SELECT * FROM courses WHERE id = ?', [id]);
      if (!course) {
        res.status(404).json({ success: false, error: 'Kurs topilmadi.' });
        return;
      }

      const now = new Date().toISOString();
      await db.run(
        `UPDATE courses SET
          name = ?,
          description = ?,
          price = ?,
          duration = ?,
          schedule_notes = ?,
          levels_json = ?,
          max_capacity = ?,
          is_active = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          name !== undefined ? name.trim() : course.name,
          description !== undefined ? description.trim() : course.description,
          price !== undefined ? price.trim() : course.price,
          duration !== undefined ? duration.trim() : course.duration,
          scheduleNotes !== undefined ? scheduleNotes.trim() : course.schedule_notes,
          levels !== undefined ? JSON.stringify(levels) : course.levels_json,
          maxCapacity !== undefined ? Number(maxCapacity) : course.max_capacity,
          isActive !== undefined ? (isActive ? 1 : 0) : course.is_active,
          now,
          id,
        ]
      );

      res.json({ success: true, message: 'Kurs muvaffaqiyatli yangilandi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Kursni yangilashda xatolik yuz berdi.' });
    }
  }
);

apiRouter.get(
  ['/admin/groups', '/api/admin/groups'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const groups = await db.query(`
        SELECT g.*, c.name as course_name, t.name as teacher_name, t.level as teacher_level,
               (SELECT COUNT(*) FROM applications a WHERE a.assigned_group_id = g.id AND a.status = 'ENROLLED') as enrolled_count
        FROM groups g
        LEFT JOIN courses c ON g.course_id = c.id
        LEFT JOIN teachers t ON g.teacher_id = t.id
        ORDER BY g.is_kids ASC, g.id ASC
      `);

      res.json({ success: true, groups });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Guruhlarni olishda xatolik.' });
    }
  }
);

apiRouter.post(
  ['/admin/groups', '/api/admin/groups'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const { courseId, teacherId, name, teacher, days, timeSlot, startDate, maxStudents, isKids } = req.body;

      if (!courseId || !name || !name.trim()) {
        res.status(400).json({ success: false, error: 'Kurs va guruh nomi kiritilishi shart.' });
        return;
      }

      const now = new Date().toISOString();
      const result = await db.run(
        `INSERT INTO groups (course_id, teacher_id, name, teacher, days, time_slot, start_date, max_students, is_kids, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          Number(courseId),
          teacherId ? Number(teacherId) : null,
          name.trim(),
          teacher ? teacher.trim() : '',
          days ? days.trim() : '',
          timeSlot ? timeSlot.trim() : '',
          startDate ? startDate.trim() : '',
          Number(maxStudents || 12),
          isKids ? 1 : 0,
          now,
        ]
      );

      res.status(201).json({ success: true, id: Number(result.lastInsertRowid || 0), message: 'Guruh yaratildi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Guruh yaratishda xatolik.' });
    }
  }
);

apiRouter.patch(
  ['/admin/groups/:id', '/api/admin/groups/:id'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const id = Number(req.params.id);
      const { teacherId, name, teacher, days, timeSlot, startDate, maxStudents, isKids, isActive } = req.body;

      const group = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
      if (!group) {
        res.status(404).json({ success: false, error: 'Guruh topilmadi.' });
        return;
      }

      await db.run(
        `UPDATE groups SET
          teacher_id = ?,
          name = ?,
          teacher = ?,
          days = ?,
          time_slot = ?,
          start_date = ?,
          max_students = ?,
          is_kids = ?,
          is_active = ?
         WHERE id = ?`,
        [
          teacherId !== undefined ? (teacherId ? Number(teacherId) : null) : group.teacher_id,
          name !== undefined ? name.trim() : group.name,
          teacher !== undefined ? teacher.trim() : group.teacher,
          days !== undefined ? days.trim() : group.days,
          timeSlot !== undefined ? timeSlot.trim() : group.time_slot,
          startDate !== undefined ? startDate.trim() : group.start_date,
          maxStudents !== undefined ? Number(maxStudents) : group.max_students,
          isKids !== undefined ? (isKids ? 1 : 0) : group.is_kids,
          isActive !== undefined ? (isActive ? 1 : 0) : group.is_active,
          id,
        ]
      );

      res.json({ success: true, message: 'Guruh muvaffaqiyatli yangilandi.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Guruhni yangilashda xatolik.' });
    }
  }
);

// ==========================================
// ADMIN SETTINGS MANAGEMENT
// ==========================================

apiRouter.get(
  ['/admin/settings', '/api/admin/settings'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const rows = await db.query('SELECT key, value FROM site_settings');
      const settings: Record<string, string> = {
        phone: '+998 97 482 06 26',
        email: 'info@ieltscamp.uz',
        address: 'Toshkent shahri, Yunusobod tumani (Mo‘ljal: Shahriston metro yaqinida)',
        hero_title: 'Kelajagingizni bilim bilan quring!',
        hero_subtitle:
          'Ingliz tili, CEFR va tarix fanlaridan bilimlaringizni rivojlantiring. O‘zingizga mos kursni tanlang va IELTS CAMP bilan ta’lim yo‘lingizni boshlang.',
        work_hours: 'Dushanba – Shanba: 09:00 – 19:00',
      };

      for (const r of rows) {
        settings[r.key] = r.value;
      }

      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Sozlamalarni olishda xatolik.' });
    }
  }
);

apiRouter.patch(
  ['/admin/settings', '/api/admin/settings'],
  requireAdminAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const db = await getDb();
      const { phone, email, address, hero_title, hero_subtitle, work_hours } = req.body;
      const updates = { phone, email, address, hero_title, hero_subtitle, work_hours };
      const now = new Date().toISOString();

      for (const [key, val] of Object.entries(updates)) {
        if (typeof val === 'string') {
          const exists = await db.get('SELECT key FROM site_settings WHERE key = ?', [key]);
          if (exists) {
            await db.run('UPDATE site_settings SET value = ?, updated_at = ? WHERE key = ?', [val.trim(), now, key]);
          } else {
            await db.run('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)', [key, val.trim(), now]);
          }
        }
      }

      res.json({ success: true, message: 'Sayt sozlamalari muvaffaqiyatli saqlandi!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Sozlamalarni yangilashda xatolik yuz berdi.' });
    }
  }
);
