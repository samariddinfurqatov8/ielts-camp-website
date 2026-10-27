/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, Group, Teacher, AdminUser, SiteSettings } from './types.js';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { CoursesSection } from './components/CoursesSection.js';
import { CourseDetailModal } from './components/CourseDetailModal.js';
import { TeachersSection } from './components/TeachersSection.js';
import { ScheduleSection } from './components/ScheduleSection.js';
import { AboutSection } from './components/AboutSection.js';
import { ProcessSection } from './components/ProcessSection.js';
import { FaqSection } from './components/FaqSection.js';
import { ContactSection } from './components/ContactSection.js';
import { PrivacyModal } from './components/PrivacyModal.js';
import { Footer } from './components/Footer.js';
import { EnrollSection } from './components/EnrollSection.js';
import { AdminLogin } from './components/AdminLogin.js';
import { AdminPanel } from './components/AdminPanel.js';
import { safeFetchJson } from './utils/api.js';

export default function App() {
  const [view, setView] = useState<'site' | 'admin_login' | 'admin_panel'>('site');
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Site Settings (Phone, address, hero texts, telegram admin)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    phone: '+998 97 482 06 26',
    email: 'info@ieltscamp.uz',
    address: 'Jizzax viloyati, Zomin tumani, Yom qishlog‘i',
    hero_title: 'Kelajagingizni bilim bilan quring!',
    hero_subtitle:
      'Ingliz tili, CEFR va tarix fanlaridan bilimlaringizni rivojlantiring. O‘zingizga mos kursni tanlang va IELTS CAMP bilan ta’lim yo‘lingizni boshlang.',
    work_hours: 'Dushanba – Shanba: 09:00 – 19:00',
    telegram_admin_url: 'https://t.me/diyorbek_mirzaolim0v',
    telegram_admin_username: '@diyorbek_mirzaolim0v',
  });


  // Course detail modal state
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);

  // Privacy modal state
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Admin auth state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string>('');

  useEffect(() => {
    fetchSettings();
    fetchCourses();
    fetchTeachers();
    checkExistingAdminSession();

    // Support URL paths and hashes: /admin, /admin/login, #admin, #admin/login
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (path.startsWith('/admin') || hash.startsWith('#admin')) {
      const savedToken = localStorage.getItem('ielts_camp_admin_token');
      if (savedToken) {
        setView('admin_panel');
      } else {
        setView('admin_login');
      }
    }
  }, []);

  const fetchSettings = async () => {
    const res = await safeFetchJson<{ settings: SiteSettings }>('/api/settings');
    if (res.success && res.data?.settings) {
      setSiteSettings(res.data.settings);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    const res = await safeFetchJson<{ courses: Course[] }>('/api/courses');
    if (res.success && res.data?.courses) {
      setCourses(res.data.courses);
    } else {
      setCoursesError(res.error || 'Kurslarni yuklab bo‘lmadi');
    }
    setCoursesLoading(false);
  };

  const fetchTeachers = async () => {
    const res = await safeFetchJson<{ teachers: Teacher[] }>('/api/teachers');
    if (res.success && res.data?.teachers) {
      setTeachers(res.data.teachers);
    }
  };

  const checkExistingAdminSession = async () => {
    const savedToken = localStorage.getItem('ielts_camp_admin_token');
    if (!savedToken) return;

    const res = await safeFetchJson<{ user: AdminUser }>('/api/admin/me', {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });

    if (res.success && res.data?.user) {
      setAdminUser(res.data.user);
      setAdminToken(savedToken);
    } else {
      localStorage.removeItem('ielts_camp_admin_token');
    }
  };

  // Ro‘yxatdan o‘tish endi Telegram orqali: barcha "yozilish" tugmalari
  // "Kurslarga yozilish" blokiga olib boradi.
  const handleOpenRegister = (_courseId?: number, _group?: Group) => {
    document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegisterBySlug = (slug: string, isKids?: boolean) => {
    const course = courses.find((c) => c.slug === slug);
    if (!course) {
      handleOpenRegister();
      return;
    }
    const matchingGroup = course.groups?.find((g) => (isKids ? g.is_kids === 1 : g.is_kids === 0));
    handleOpenRegister(course.id, matchingGroup);
  };

  const handleEnrollTeacher = (teacherName: string) => {
    const isHistory = teacherName.toLowerCase().includes('og‘abek') || teacherName.toLowerCase().includes('tarix');
    const slug = isHistory ? 'history' : 'english-cefr';
    const isKids = teacherName.toLowerCase().includes('doniyorbek');
    handleRegisterBySlug(slug, isKids);
  };

  const handleAdminSuccess = (user: AdminUser, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
    setView('admin_panel');
  };

  const handleAdminLogout = async () => {
    await safeFetchJson('/api/admin/logout', { method: 'POST' });
    localStorage.removeItem('ielts_camp_admin_token');
    setAdminUser(null);
    setAdminToken('');
    setView('site');
    window.location.hash = '';
  };

  // Render Admin View
  if (view === 'admin_panel' && adminUser) {
    return (
      <AdminPanel
        user={adminUser}
        token={adminToken}
        onLogout={handleAdminLogout}
        onViewSite={() => {
          setView('site');
          window.location.hash = '';
          fetchSettings();
        }}
      />
    );
  }

  if (view === 'admin_login' || (view === 'admin_panel' && !adminUser)) {
    return (
      <AdminLogin
        onSuccess={handleAdminSuccess}
        onBackToSite={() => {
          setView('site');
          window.location.hash = '';
        }}
      />
    );
  }

  // Render Public Site
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-red-600 selection:text-white font-sans antialiased">
      {/* 1. Header & Navigation */}
      <Navbar
        onOpenRegister={() => handleOpenRegister()}
        onOpenAdmin={() => setView(adminUser ? 'admin_panel' : 'admin_login')}
        isAdminLoggedIn={Boolean(adminUser)}
        phone={siteSettings.phone}
        telegramUrl={siteSettings.telegram_admin_url || 'https://t.me/diyorbek_mirzaolim0v'}
        telegramUsername={siteSettings.telegram_admin_username || '@diyorbek_mirzaolim0v'}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          onRegisterClick={() => handleOpenRegister()}
          onExploreCourses={() => {
            const el = document.getElementById('courses');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          phone={siteSettings.phone}
          telegramUrl={siteSettings.telegram_admin_url || 'https://t.me/diyorbek_mirzaolim0v'}
          telegramUsername={siteSettings.telegram_admin_username || '@diyorbek_mirzaolim0v'}
        />

        {/* 3. Courses Section */}
        <CoursesSection
          courses={courses}
          loading={coursesLoading}
          error={coursesError}
          onRetry={fetchCourses}
          onSelectCourse={(course, group) => handleOpenRegister(course.id, group)}
          onOpenDetails={(course) => setSelectedCourseForDetail(course)}
        />

        {/* 4. Teachers Section */}
        <TeachersSection
          teachers={teachers}
          onEnrollTeacher={handleEnrollTeacher}
        />

        {/* 5. Weekly Schedule Section */}
        <ScheduleSection
          onRegisterGroup={handleRegisterBySlug}
        />

        {/* 6. About Section */}
        <AboutSection />

        {/* 7. Process Section */}
        <ProcessSection />

        {/* 8. FAQ Section */}
        <FaqSection phone={siteSettings.phone} />

        {/* 9. Contact Section */}
        <ContactSection
          onRegisterClick={() => handleOpenRegister()}
          phone={siteSettings.phone}
          address={siteSettings.address}
          workHours={siteSettings.work_hours}
          telegramUrl={siteSettings.telegram_admin_url || 'https://t.me/diyorbek_mirzaolim0v'}
          telegramUsername={siteSettings.telegram_admin_username || '@diyorbek_mirzaolim0v'}
        />

        {/* 10. Enrollment (Telegram admin) */}
        <EnrollSection />
      </main>

      {/* 11. Footer */}
      <Footer
        onOpenAdmin={() => setView(adminUser ? 'admin_panel' : 'admin_login')}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        phone={siteSettings.phone}
        telegramUrl={siteSettings.telegram_admin_url || 'https://t.me/diyorbek_mirzaolim0v'}
        telegramUsername={siteSettings.telegram_admin_username || '@diyorbek_mirzaolim0v'}
      />

      {/* 12. Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourseForDetail}
        isOpen={Boolean(selectedCourseForDetail)}
        onClose={() => setSelectedCourseForDetail(null)}
        onSelectGroupAndRegister={(course, group) => {
          setSelectedCourseForDetail(null);
          handleOpenRegister(course.id, group);
        }}
      />

      {/* 13. Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
