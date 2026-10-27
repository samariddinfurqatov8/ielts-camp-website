import React from 'react';
import { Course, Group } from '../types.js';
import { ArrowRight, Clock, Calendar, AlertCircle, RefreshCw, Info, CheckCircle, Sparkles } from 'lucide-react';

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
  loading,
  error,
  onRetry,
  onSelectCourse,
  onOpenDetails,
}) => {
  const getCourseImage = (slug: string) => {
    if (slug === 'english-cefr') {
      return '/src/assets/images/course_english_cefr_1793011909104.jpg';
    }
    return '/src/assets/images/course_history_study_1793011909432.jpg';
  };

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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4 shadow-xs"
              >
                <div className="w-full h-56 bg-slate-200 rounded-2xl" />
                <div className="h-6 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Kurslarni yuklab bo‘lmadi</h3>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Qayta urinish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {courses.map((course) => {
              const isEnglish = course.slug === 'english-cefr';
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Course Image & Price Badge */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getCourseImage(course.slug)}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10">
                      {isEnglish ? 'Ingliz tili / CEFR / Kids' : 'Tarix / DTM / Litsey'}
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 text-sm font-extrabold px-4 py-2 rounded-xl shadow-lg border border-slate-200 tabular-nums">
                      <span className="text-red-600 text-base font-black">{course.price || '200 000 so‘m'}</span>{' '}
                      <span className="text-xs font-semibold text-slate-500">/ oy</span>
                    </div>
                  </div>

                  {/* Course Body */}
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

                      {/* Official Schedule & Time info */}
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

                      {/* Real Teachers preview */}
                      {course.teachers && course.teachers.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Kurs ustozlari:
                          </div>
                          <div className="flex flex-col gap-2">
                            {course.teachers.map((teacher) => (
                              <div
                                key={teacher.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/50 border border-red-100/80 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[11px]">
                                    {teacher.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900">{teacher.name}</span>
                                    <span className="text-slate-400 mx-1.5">·</span>
                                    <span className="font-semibold text-red-700">{teacher.level}</span>
                                  </div>
                                </div>
                                {teacher.subject.toLowerCase().includes('kids') && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    Kids guruhi
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Groups with direct registration */}
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
                                className="p-3 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/30 text-left transition-all text-xs flex flex-col justify-between group/btn cursor-pointer"
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

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <button
                        onClick={() => onOpenDetails(course)}
                        className="px-4 py-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Batafsil ma’lumot"
                      >
                        <Info className="w-4 h-4 text-slate-400" />
                        <span>Batafsil</span>
                      </button>

                      <button
                        onClick={() => onSelectCourse(course)}
                        className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
        )}
      </div>
    </section>
  );
};
