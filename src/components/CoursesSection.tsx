import React from 'react';
import { Course, Group } from '../types.js';
import { ArrowRight, Clock, Calendar, Info, MapPin } from 'lucide-react';

const CENTER_ADDRESS = "Jizzax viloyati, Zomin tumani, Yom qishlog'i";

const STATIC_COURSES: Course[] = [
  {
    id: 1,
    slug: 'english-cefr',
    name: 'Ingliz tili / CEFR',
    description: 'Ingliz tili bilimini bosqichma-bosqich rivojlantirish, CEFR va IELTS imtihonlariga tayyorlanish hamda maxsus Kids guruhlari.',
    price: '200 000 so‘m',
    duration: '3 oy - 6 oy',
    schedule_notes: 'Seshanba, payshanba, shanba (16:30–18:30)',
    levels: [],
    max_capacity: 15,
    is_active: 1,
    groups: [
      { id: 1, course_id: 1, name: 'Ingliz tili (C1 daraja)', teacher: 'Diyorbek Mirzaolimov (C1)', days: 'Seshanba, payshanba, shanba', time_slot: '16:30–18:30', start_date: '2026-11-03', max_capacity: 15, is_kids: 0 },
      { id: 2, course_id: 1, name: 'Kids guruhi (B2 daraja)', teacher: 'Doniyorbek Mirzaolimov (B2, Kids)', days: 'Seshanba, payshanba, shanba', time_slot: '16:30–18:30', start_date: '2026-11-03', max_capacity: 15, is_kids: 1 },
    ],
  },
  {
    id: 2,
    slug: 'history',
    name: 'Tarix',
    description: 'Tarixiy bilimlarni mustahkamlash, mavzularni o‘rganish va imtihonlarga tayyorlanish.',
    price: '200 000 so‘m',
    duration: '4 oy - 8 oy',
    schedule_notes: 'Seshanba, payshanba, shanba (16:00–18:00)',
    levels: [],
    max_capacity: 15,
    is_active: 1,
    groups: [
      { id: 3, course_id: 2, name: 'Tarix (A daraja)', teacher: 'Kholmirzayev Og‘abek (Daraja A)', days: 'Seshanba, payshanba, shanba', time_slot: '16:00–18:00', start_date: '2026-11-03', max_capacity: 15, is_kids: 0 },
    ],
  },
];

interface CoursesSectionProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectCourse: (course: Course, group?: Group) => void;
  onOpenDetails: (course: Course) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  onSelectCourse,
  onOpenDetails,
}) => {
  const displayCourses = courses && courses.length > 0 ? courses : STATIC_COURSES;

  return (
    <section id="courses" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            IELTS CAMP · Kurslar va Ta’lim Dasturlari
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bizning ta’lim yo‘nalishlarimiz va narxlar
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Haqiqiy guruhlar, malakali ustozlar va rasmiy dars jadvallari. Oylik to‘lov barcha kurslar uchun qat’iy va ochiq: <strong className="text-slate-900">200 000 so‘m</strong>.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-10 -mt-8">
          <MapPin className="w-4 h-4 text-red-600 shrink-0" />
          <span>Manzil: <strong className="text-slate-900">{CENTER_ADDRESS}</strong></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {displayCourses.map((course) => {
            const isEnglish = course.slug === 'english-cefr';
            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-slate-100 to-slate-200" />
                  <div className="relative z-10 text-center px-6">
                    <div className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 border border-red-100">
                      {isEnglish ? 'Ingliz tili / CEFR' : 'Tarix'}
                    </div>
                    <div className="mt-4 text-3xl font-black text-slate-900">{course.name}</div>
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10">
                    {isEnglish ? 'Ingliz tili / CEFR / Kids' : 'Tarix / DTM / Litsey'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 text-sm font-extrabold px-4 py-2 rounded-xl shadow-lg border border-slate-200 tabular-num">
                    <span className="text-red-600 text-base font-black">{course.price || '200 000 so‘m'}</span>
                    <span className="text-xs font-semibold text-slate-500"> / oy</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                        <div>
                          <div className="text-slate-400 font-medium">Dars kunlari</div>
                          <div className="font-bold text-slate-800">Seshanba, Payshanba, Shanba</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-red-600 shrink-0" />
                        <div>
                          <div className="text-slate-400 font-medium">Dars vaqti</div>
                          <div className="font-bold text-slate-800">
                            {isEnglish ? '16:30 – 18:30' : '16:00 – 18:00'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {course.groups && course.groups.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Mavjud guruhlar:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {course.groups.map((g) => (
                            <button
                              key={g.id}
                              onClick={() => onSelectCourse(course, g)}
                              className="p-3 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/30 text-left transition-all text-xs flex flex-col justify-between group/btn"
                            >
                              <div className="font-bold text-slate-900 group-hover/btn:text-red-600 flex items-center justify-between">
                                <span>{g.name}</span>
                                {g.is_kids ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                    Kids
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-slate-500 mt-1">{g.time_slot}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => onOpenDetails(course)}
                      className="px-4 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      title="Batafsil ma’lumot"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Batafsil</span>
                    </button>

                    <button
                      onClick={() => onSelectCourse(course)}
                      className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Kursga yozilish</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
























