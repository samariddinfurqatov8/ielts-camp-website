import React, { useState, useEffect } from 'react';
import {
  Course,
  Group,
  Teacher,
  Application,
  DashboardStats,
  AdminUser,
  ApplicationStatus,
  StatusHistory,
  SiteSettings,
} from '../types.js';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  LogOut,
  Search,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  ExternalLink,
  Loader2,
  Check,
  X,
  History,
  GraduationCap,
  KeyRound,
  Settings,
  Phone,
  Edit,
  Trash2,
  Eye,
  Sliders,
} from 'lucide-react';
import { Logo } from './Logo.js';
import { safeFetchJson } from '../utils/api.js';

interface AdminPanelProps {
  user: AdminUser;
  token: string;
  onLogout: () => void;
  onViewSite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, token, onLogout, onViewSite }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'courses' | 'teachers' | 'groups' | 'settings'>('dashboard');

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppsCount, setTotalAppsCount] = useState(0);

  // Selected Application Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appHistory, setAppHistory] = useState<StatusHistory[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Courses, Teachers & Groups
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Site Settings
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

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '200 000 so‘m',
    duration: '',
    scheduleNotes: '',
    maxCapacity: 15,
  });

  // Teacher Modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    subject: 'Ingliz tili / CEFR',
    level: '',
    bio: '',
    photoUrl: '',
  });

  // Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({
    courseId: '',
    teacherId: '',
    name: '',
    teacher: '',
    days: 'Seshanba, payshanba, shanba',
    timeSlot: '16:30–18:30',
    startDate: '',
    maxStudents: 15,
    isKids: false,
  });

  // Password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isSavingPass, setIsSavingPass] = useState(false);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchTeachers();
    fetchGroups();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications' || activeTab === 'dashboard') {
      fetchApplications();
    }
  }, [activeTab, page, statusFilter, courseFilter]);

  const fetchStats = async () => {
    setStatsLoading(true);
    const res = await safeFetchJson<{ stats: DashboardStats }>('/api/admin/stats', { headers: authHeaders });
    if (res.success && res.data?.stats) {
      setStats(res.data.stats);
    }
    setStatsLoading(false);
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    let url = `/api/admin/applications?page=${page}&limit=12`;
    if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery.trim())}`;
    if (statusFilter && statusFilter !== 'ALL') url += `&status=${statusFilter}`;
    if (courseFilter) url += `&courseId=${courseFilter}`;

    const res = await safeFetchJson<{
      applications: Application[];
      pagination: { total: number; totalPages: number };
    }>(url, { headers: authHeaders });

    if (res.success && res.data) {
      setApplications(res.data.applications || []);
      setTotalPages(res.data.pagination.totalPages || 1);
      setTotalAppsCount(res.data.pagination.total || 0);
    }
    setAppsLoading(false);
  };

  const fetchCourses = async () => {
    const res = await safeFetchJson<{ courses: Course[] }>('/api/admin/courses', { headers: authHeaders });
    if (res.success && res.data?.courses) {
      setCourses(res.data.courses);
    }
  };

  const fetchTeachers = async () => {
    const res = await safeFetchJson<{ teachers: Teacher[] }>('/api/admin/teachers', { headers: authHeaders });
    if (res.success && res.data?.teachers) {
      setTeachers(res.data.teachers);
    }
  };

  const fetchGroups = async () => {
    const res = await safeFetchJson<{ groups: Group[] }>('/api/admin/groups', { headers: authHeaders });
    if (res.success && res.data?.groups) {
      setGroups(res.data.groups);
    }
  };

  const fetchSettings = async () => {
    const res = await safeFetchJson<{ settings: SiteSettings }>('/api/admin/settings', { headers: authHeaders });
    if (res.success && res.data?.settings) {
      setSiteSettings(res.data.settings);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSavedMsg(null);

    const res = await safeFetchJson('/api/admin/settings', {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify(siteSettings),
    });

    if (res.success) {
      setSettingsSavedMsg('Sozlamalar muvaffaqiyatli saqlandi!');
      setTimeout(() => setSettingsSavedMsg(null), 3500);
    } else {
      alert(res.error || 'Sozlamalarni saqlashda xatolik yuz berdi.');
    }
    setSettingsLoading(false);
  };

  const handleOpenAppDetail = async (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setAdminNotes(app.admin_notes || '');
    setSelectedGroupId(app.assigned_group_id ? String(app.assigned_group_id) : '');
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await safeFetchJson<{
      application: Application;
      history: StatusHistory[];
    }>(`/api/admin/applications/${app.id}`, { headers: authHeaders });

    if (res.success && res.data) {
      setAppHistory(res.data.history || []);
    }
  };

  const handleUpdateAppStatus = async () => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await safeFetchJson(`/api/admin/applications/${selectedApp.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        status: newStatus,
        adminNotes,
      }),
    });

    if (res.success) {
      setActionSuccessMsg('Ariza holati yangilandi!');
      fetchApplications();
      fetchStats();
      handleOpenAppDetail({ ...selectedApp, status: newStatus, admin_notes: adminNotes });
    } else {
      setActionErrorMsg(res.error || 'Yangilashda xatolik yuz berdi.');
    }
    setIsUpdatingStatus(false);
  };

  const handleAssignGroup = async () => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const res = await safeFetchJson(`/api/admin/applications/${selectedApp.id}/assign-group`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        groupId: selectedGroupId ? Number(selectedGroupId) : null,
      }),
    });

    if (res.success) {
      setActionSuccessMsg('O‘quvchi guruhga muvaffaqiyatli biriktirildi!');
      fetchApplications();
      fetchGroups();
      fetchStats();
    } else {
      setActionErrorMsg(res.error || 'Guruhga biriktirishda xatolik yuz berdi.');
    }
    setIsUpdatingStatus(false);
  };

  const handleExportCsv = () => {
    window.location.href = `/api/admin/applications/export/csv?token=${token}`;
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass.length < 8) {
      setPassError('Yangi parol kamida 8 ta belgidan iborat bo‘lishi shart.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Parollar bir-biriga mos kelmadi.');
      return;
    }

    setIsSavingPass(true);
    const res = await safeFetchJson('/api/admin/change-password', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        currentPassword: currentPass,
        newPassword: newPass,
      }),
    });

    if (res.success) {
      setPassSuccess('Parol muvaffaqiyatli yangilandi!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setIsPasswordModalOpen(false), 1500);
    } else {
      setPassError(res.error || 'Parolni yangilashda xatolik.');
    }
    setIsSavingPass(false);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = Boolean(editingCourse);
    const endpoint = isEdit ? `/api/admin/courses/${editingCourse!.id}` : '/api/admin/courses';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await safeFetchJson(endpoint, {
      method,
      headers: authHeaders,
      body: JSON.stringify(courseForm),
    });

    if (res.success) {
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } else {
      alert(res.error || 'Kursni saqlashda xatolik yuz berdi.');
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = Boolean(editingTeacher);
    const endpoint = isEdit ? `/api/admin/teachers/${editingTeacher!.id}` : '/api/admin/teachers';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await safeFetchJson(endpoint, {
      method,
      headers: authHeaders,
      body: JSON.stringify(teacherForm),
    });

    if (res.success) {
      setIsTeacherModalOpen(false);
      setEditingTeacher(null);
      fetchTeachers();
    } else {
      alert(res.error || 'Ustozni saqlashda xatolik yuz berdi.');
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = Boolean(editingGroup);
    const endpoint = isEdit ? `/api/admin/groups/${editingGroup!.id}` : '/api/admin/groups';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await safeFetchJson(endpoint, {
      method,
      headers: authHeaders,
      body: JSON.stringify(groupForm),
    });

    if (res.success) {
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      fetchGroups();
    } else {
      alert(res.error || 'Guruhni saqlashda xatolik yuz berdi.');
    }
  };

  const statusColors: Record<ApplicationStatus, string> = {
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    REVIEWING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONTACTED: 'bg-purple-50 text-purple-700 border-purple-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ENROLLED: 'bg-red-50 text-red-700 border-red-200 font-bold',
    REJECTED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const statusLabels: Record<ApplicationStatus, string> = {
    NEW: 'Yangi ariza',
    REVIEWING: 'Ko‘rib chiqilmoqda',
    CONTACTED: 'Bog‘lanildi',
    APPROVED: 'Qabul qilindi',
    ENROLLED: 'Guruhga biriktirildi',
    REJECTED: 'Rad etildi',
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Logo size="sm" />
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Umumiy Ko‘rsatkichlar</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>O‘quvchilar Arizalari</span>
              </div>
              {stats?.new ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-extrabold">
                  {stats.new}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kurslar va Narxlar</span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ustozlar</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Guruhlar va Jadvallar</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Sayt Sozlamalari</span>
            </button>
          </nav>
        </div>

        {/* Bottom user & actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="font-bold text-white flex items-center justify-between">
              <span>{user.username}</span>
              <span className="text-[10px] text-red-400 uppercase font-black">Admin</span>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 mt-1 cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-red-500" />
              <span>Parolni o‘zgartirish</span>
            </button>
          </div>

          <button
            onClick={onViewSite}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Saytni ko‘rish</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Umumiy Boshqaruv Paneli'}
              {activeTab === 'applications' && 'O‘quvchilar Arizalari'}
              {activeTab === 'courses' && 'Kurslar va Narxlarni Boshqarish'}
              {activeTab === 'teachers' && 'Ustozlar Ro‘yxati va Malakalari'}
              {activeTab === 'groups' && 'Guruhlar va Haftalik Jadvallar'}
              {activeTab === 'settings' && 'Sayt va Aloqa Sozlamalari'}
            </h1>
            <p className="text-xs text-slate-500">IELTS CAMP boshqaruv va ro‘yxatdan o‘tkazish tizimi</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>Admin: {siteSettings.phone}</span>
            </span>
            <button
              onClick={() => {
                fetchStats();
                fetchApplications();
                fetchCourses();
                fetchTeachers();
                fetchGroups();
              }}
              title="Yangilash"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Jami Arizalar</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{stats?.total ?? 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
                  <div className="text-xs font-semibold text-blue-700">Yangi</div>
                  <div className="text-2xl font-black text-blue-700 mt-1">{stats?.new ?? 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
                  <div className="text-xs font-semibold text-amber-700">Ko‘rilmoqda</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{stats?.reviewing ?? 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-xs">
                  <div className="text-xs font-semibold text-purple-700">Bog‘lanildi</div>
                  <div className="text-2xl font-black text-purple-700 mt-1">{stats?.contacted ?? 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                  <div className="text-xs font-semibold text-emerald-700">Qabul Qilindi</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{stats?.approved ?? 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs">
                  <div className="text-xs font-semibold text-red-700">Guruhda O‘qimoqda</div>
                  <div className="text-2xl font-black text-red-700 mt-1">{stats?.enrolled ?? 0}</div>
                </div>
              </div>

              {/* Course-wise Stats */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
                  Kurslar kesimida arizalar soni
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats?.byCourse?.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">200 000 so‘m/oy</div>
                      </div>
                      <div className="text-2xl font-black text-red-600">{c.total_applications}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications Quick List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">So‘nggi qabul qilingan arizalar</h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Barcha arizalarni ko‘rish →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 6).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleOpenAppDetail(app)}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {app.first_name} {app.last_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {app.phone} · <span className="text-slate-700">{app.course_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusColors[app.status]}`}
                        >
                          {statusLabels[app.status]}
                        </span>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {/* Filter and Action Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ism, telefon, ariza kodi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    <option value="ALL">Barcha holatlar</option>
                    <option value="NEW">Yangi</option>
                    <option value="REVIEWING">Ko‘rilmoqda</option>
                    <option value="CONTACTED">Bog‘lanildi</option>
                    <option value="APPROVED">Qabul qilindi</option>
                    <option value="ENROLLED">Guruhga biriktirildi</option>
                    <option value="REJECTED">Rad etildi</option>
                  </select>

                  {/* Course Filter */}
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    <option value="">Barcha kurslar</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV Eksport</span>
                  </button>
                </div>
              </div>

              {/* Applications Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Kodi</th>
                        <th className="p-4">F.I.O.</th>
                        <th className="p-4">Telefon</th>
                        <th className="p-4">Kurs / Guruh</th>
                        <th className="p-4">Dars vaqti</th>
                        <th className="p-4">Holati</th>
                        <th className="p-4 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appsLoading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                            Arizalar yuklanmoqda...
                          </td>
                        </tr>
                      ) : applications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            Hech qanday ariza topilmadi.
                          </td>
                        </tr>
                      ) : (
                        applications.map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                            onClick={() => handleOpenAppDetail(app)}
                          >
                            <td className="p-4 font-mono font-bold text-slate-800">{app.application_code}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">
                                {app.first_name} {app.last_name}
                              </div>
                              {app.birth_date && (
                                <div className="text-[10px] text-slate-400">Tug‘ilgan: {app.birth_date}</div>
                              )}
                            </td>
                            <td className="p-4 font-mono text-slate-700">{app.phone}</td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-900">{app.course_name}</div>
                              {app.group_name ? (
                                <div className="text-[10px] text-red-600 font-bold">
                                  Guruh: {app.group_name} {app.group_is_kids ? '(Kids)' : ''}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400">Guruh belgilanmagan</div>
                              )}
                            </td>
                            <td className="p-4 text-slate-600">{app.preferred_time}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[app.status]}`}
                              >
                                {statusLabels[app.status]}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAppDetail(app);
                                }}
                                className="px-2.5 py-1 text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Ko‘rish
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Jami: <strong>{totalAppsCount}</strong> ta ariza (Sahifa {page} / {totalPages})
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                      >
                        Avvalgi
                      </button>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                      >
                        Keyingi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Faol Kurslar</h3>
                  <p className="text-xs text-slate-500">Kurs narxi, jadvali va ma’lumotlarini tahrirlash</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseForm({
                      name: '',
                      slug: '',
                      description: '',
                      price: '200 000 so‘m',
                      duration: '',
                      scheduleNotes: 'Seshanba, payshanba, shanba (16:30–18:30)',
                      maxCapacity: 15,
                    });
                    setIsCourseModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Kurs Qo‘shish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{course.slug}</span>
                        <h4 className="text-xl font-black text-slate-900">{course.name}</h4>
                      </div>
                      <span className="text-base font-black text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-200">
                        {course.price}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Dars kunlari/vaqti:</span>
                        <span className="font-bold text-slate-800">{course.schedule_notes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Davomiyligi:</span>
                        <span className="font-bold text-slate-800">{course.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Maksimal sig‘im:</span>
                        <span className="font-bold text-slate-800">{course.max_capacity} nafar</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setCourseForm({
                            name: course.name,
                            slug: course.slug,
                            description: course.description,
                            price: course.price,
                            duration: course.duration,
                            scheduleNotes: course.schedule_notes,
                            maxCapacity: course.max_capacity,
                          });
                          setIsCourseModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Tahrirlash</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEACHERS */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ustozlar Jamoasi</h3>
                  <p className="text-xs text-slate-500">IELTS CAMP rasmiy ustozlari va ularning darajalari</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTeacher(null);
                    setTeacherForm({
                      name: '',
                      subject: 'Ingliz tili / CEFR',
                      level: 'C1 darajasi',
                      bio: '',
                      photoUrl: '',
                    });
                    setIsTeacherModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Ustoz Qo‘shish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-black text-lg flex items-center justify-center">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 font-extrabold text-xs">
                          {teacher.level}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-slate-900">{teacher.name}</h4>
                        <p className="text-xs font-bold text-slate-500">{teacher.subject}</p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{teacher.bio}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setEditingTeacher(teacher);
                          setTeacherForm({
                            name: teacher.name,
                            subject: teacher.subject,
                            level: teacher.level,
                            bio: teacher.bio,
                            photoUrl: teacher.photo_url || '',
                          });
                          setIsTeacherModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Tahrirlash</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GROUPS */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Guruhlar va Jadvallar</h3>
                  <p className="text-xs text-slate-500">Kids va oddiy guruhlar, joy bandligi va vaqtlari</p>
                </div>
                <button
                  onClick={() => {
                    setEditingGroup(null);
                    setGroupForm({
                      courseId: courses[0]?.id ? String(courses[0].id) : '',
                      teacherId: teachers[0]?.id ? String(teachers[0].id) : '',
                      name: '',
                      teacher: '',
                      days: 'Seshanba, payshanba, shanba',
                      timeSlot: '16:30–18:30',
                      startDate: '',
                      maxStudents: 15,
                      isKids: false,
                    });
                    setIsGroupModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Guruh Qo‘shish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => {
                  const enrolled = group.enrolled_count || 0;
                  const percent = Math.min(100, Math.round((enrolled / group.max_students) * 100));
                  return (
                    <div key={group.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-600 uppercase">{group.course_name}</span>
                        {group.is_kids ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Kids Guruhi
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-slate-900">{group.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Ustoz: {group.teacher}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dars kunlari:</span>
                          <span className="font-bold text-slate-800">{group.days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dars vaqti:</span>
                          <span className="font-black text-red-700">{group.time_slot}</span>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-500">Joy bandligi:</span>
                            <span className="font-bold text-slate-800">
                              {enrolled} / {group.max_students} nafar ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${percent >= 100 ? 'bg-red-600' : 'bg-emerald-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setEditingGroup(group);
                            setGroupForm({
                              courseId: String(group.course_id),
                              teacherId: group.teacher_id ? String(group.teacher_id) : '',
                              name: group.name,
                              teacher: group.teacher,
                              days: group.days,
                              timeSlot: group.time_slot,
                              startDate: group.start_date || '',
                              maxStudents: group.max_students,
                              isKids: Boolean(group.is_kids),
                            });
                            setIsGroupModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Tahrirlash</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Sayt va Aloqa Sozlamalari</h3>
                <p className="text-xs text-slate-500">
                  Ushbu ma’lumotlar butun saytda (Hero, Navbar, Aloqa, Footer) real vaqt rejimida yangilanadi.
                </p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rasmiy Administrator Telefoni <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Standart: +998 97 482 06 26 (Saytdagi barcha qo‘ng‘iroq tugmalari ushbu raqamga ulanadi)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Telegram Admin Username
                    </label>
                    <input
                      type="text"
                      placeholder="@diyorbek_mirzaolim0v"
                      value={siteSettings.telegram_admin_username || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, telegram_admin_username: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-[#0088cc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Masalan: @diyorbek_mirzaolim0v
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Telegram Admin URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://t.me/diyorbek_mirzaolim0v"
                      value={siteSettings.telegram_admin_url || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, telegram_admin_url: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-[#0088cc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Masalan: https://t.me/diyorbek_mirzaolim0v
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Markaz manzili
                  </label>
                  <input
                    type="text"
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ish tartibi (soatlari)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.work_hours}
                    onChange={(e) => setSiteSettings({ ...siteSettings, work_hours: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bosh sahifa shiori (Hero sarlavhasi)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.hero_title}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bosh sahifa tavsifi (Hero subtitri)
                  </label>
                  <textarea
                    rows={3}
                    value={siteSettings.hero_subtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {settingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Sozlamalarni Saqlash</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: APPLICATION DETAIL & GROUP ASSIGNMENT */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="sticky top-0 bg-white/95 px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div>
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {selectedApp.application_code}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedApp.first_name} {selectedApp.last_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {actionSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  {actionSuccessMsg}
                </div>
              )}
              {actionErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                  {actionErrorMsg}
                </div>
              )}

              {/* Applicant Info Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Telefon:</span>
                  <a
                    href={`tel:${selectedApp.phone}`}
                    className="font-mono font-bold text-red-600 hover:underline"
                  >
                    {selectedApp.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Kurs:</span>
                  <span className="font-bold text-slate-900">{selectedApp.course_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Daraja:</span>
                  <span className="font-semibold text-slate-700">{selectedApp.level || 'Belgilanmagan'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Qulay dars vaqti:</span>
                  <span className="font-semibold text-slate-700">{selectedApp.preferred_time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tug‘ilgan sana:</span>
                  <span className="font-semibold text-slate-700">{selectedApp.birth_date || 'Noma’lum'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Ariza topshirilgan:</span>
                  <span className="text-slate-600">
                    {new Date(selectedApp.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>

              {selectedApp.comment && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong className="block mb-0.5">O‘quvchi izohi:</strong>
                  {selectedApp.comment}
                </div>
              )}

              {/* Group Assignment */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Guruhga biriktirish
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold"
                  >
                    <option value="">Guruh tanlanmagan (Ajratish)</option>
                    {groups
                      .filter((g) => g.course_id === selectedApp.course_id)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} · {g.teacher} ({g.time_slot}) [{g.enrolled_count || 0}/{g.max_students}]
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAssignGroup}
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    Biriktirish
                  </button>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ariza holati va Admin izohi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Holat:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                    >
                      <option value="NEW">Yangi ariza</option>
                      <option value="REVIEWING">Ko‘rib chiqilmoqda</option>
                      <option value="CONTACTED">Bog‘lanildi</option>
                      <option value="APPROVED">Qabul qilindi</option>
                      <option value="ENROLLED">Guruhga biriktirildi</option>
                      <option value="REJECTED">Rad etildi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Admin Izohi:</label>
                    <input
                      type="text"
                      placeholder="Qo‘ng‘iroq natijasi yoki eslatma..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateAppStatus}
                  disabled={isUpdatingStatus}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Holatni Yangilash
                </button>
              </div>

              {/* History */}
              {appHistory.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Holat o‘zgarish tarixi</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600 max-h-36 overflow-y-auto">
                    {appHistory.map((h) => (
                      <div key={h.id} className="p-2 rounded-lg bg-slate-50 text-[11px] flex justify-between">
                        <span>
                          {h.old_status} → <strong>{h.new_status}</strong> ({h.notes})
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(h.created_at).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COURSE CREATE / EDIT */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {editingCourse ? 'Kursni Tahrirlash' : 'Yangi Kurs Qo‘shish'}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kurs Nomi</label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Oylik Narx</label>
                  <input
                    type="text"
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Davomiyligi</label>
                  <input
                    type="text"
                    placeholder="3 oy - 6 oy"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dars Kunlari va Vaqti</label>
                <input
                  type="text"
                  required
                  placeholder="Seshanba, payshanba, shanba (16:30–18:30)"
                  value={courseForm.scheduleNotes}
                  onChange={(e) => setCourseForm({ ...courseForm, scheduleNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tavsif</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER CREATE / EDIT */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {editingTeacher ? 'Ustozni Tahrirlash' : 'Yangi Ustoz Qo‘shish'}
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ism Familiya</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Diyorbek Mirzaolimov"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fan / Yo‘nalish</label>
                  <input
                    type="text"
                    required
                    placeholder="Ingliz tili / CEFR yoki Tarix"
                    value={teacherForm.subject}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daraja</label>
                  <input
                    type="text"
                    required
                    placeholder="C1 darajasi, B2, A"
                    value={teacherForm.level}
                    onChange={(e) => setTeacherForm({ ...teacherForm, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biografiya / Malaka</label>
                <textarea
                  rows={3}
                  value={teacherForm.bio}
                  onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: GROUP CREATE / EDIT */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {editingGroup ? 'Guruhni Tahrirlash' : 'Yangi Guruh Qo‘shish'}
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kursni Tanlang</label>
                <select
                  required
                  value={groupForm.courseId}
                  onChange={(e) => setGroupForm({ ...groupForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guruh Nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Ingliz tili (C1 daraja)"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ustoz</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Diyorbek Mirzaolimov (C1)"
                  value={groupForm.teacher}
                  onChange={(e) => setGroupForm({ ...groupForm, teacher: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dars Kunlari</label>
                  <input
                    type="text"
                    required
                    value={groupForm.days}
                    onChange={(e) => setGroupForm({ ...groupForm, days: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dars Vaqti</label>
                  <input
                    type="text"
                    required
                    value={groupForm.timeSlot}
                    onChange={(e) => setGroupForm({ ...groupForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maksimal Sig‘im</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={groupForm.maxStudents}
                    onChange={(e) => setGroupForm({ ...groupForm, maxStudents: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isKids"
                    checked={groupForm.isKids}
                    onChange={(e) => setGroupForm({ ...groupForm, isKids: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="isKids" className="font-bold text-slate-800 cursor-pointer">
                    Kids Guruhi
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CHANGE PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-slate-900 text-lg">Parolni O‘zgartirish</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {passSuccess}
              </div>
            )}
            {passError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                {passError}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Joriy Parol</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yangi Parol (kamida 8 belgi)</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yangi Parolni Qayta Tering</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingPass}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
