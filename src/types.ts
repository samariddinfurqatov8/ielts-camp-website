export interface Teacher {
  id: number;
  name: string;
  subject: string;
  level: string;
  bio: string;
  photo_url: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  schedule_notes: string;
  levels: string[];
  max_capacity: number;
  is_active: number;
  teachers?: Teacher[];
  groups?: Group[];
}

export interface Group {
  id: number;
  course_id: number;
  course_name?: string;
  teacher_id?: number | null;
  name: string;
  teacher: string;
  teacher_level?: string;
  days: string;
  time_slot: string;
  start_date: string;
  max_students: number;
  enrolled_count?: number;
  is_kids: number;
  is_active: number;
}

export type ApplicationStatus = 'NEW' | 'REVIEWING' | 'CONTACTED' | 'APPROVED' | 'REJECTED' | 'ENROLLED';

export interface Application {
  id: number;
  application_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  course_id: number;
  course_name?: string;
  level: string;
  preferred_time: string;
  comment: string;
  consent: number;
  status: ApplicationStatus;
  assigned_group_id: number | null;
  group_name?: string;
  group_teacher?: string;
  is_kids?: number;
  group_is_kids?: number;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: number;
  application_id: number;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  new: number;
  reviewing: number;
  contacted: number;
  approved: number;
  rejected: number;
  enrolled: number;
  byCourse: { id: number; name: string; total_applications: number }[];
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  must_change_password?: boolean | number;
}

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  hero_title: string;
  hero_subtitle: string;
  work_hours: string;
  telegram_admin_url?: string;
  telegram_admin_username?: string;
}

