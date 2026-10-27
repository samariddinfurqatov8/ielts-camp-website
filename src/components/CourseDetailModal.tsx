import React from 'react';
import { Course, Group, Teacher } from '../types.js';
import { X, Calendar, Clock, DollarSign, Award, Users, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectGroupAndRegister: (course: Course, group?: Group) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onSelectGroupAndRegister,
}) => {
  if (!isOpen || !course) return null;

  const isEnglish = course.slug === 'english-cefr';

  const topics = isEnglish
    ? [
        {
          title: 'Grammatika va Leksika',
          desc: 'CEFR standartlari asosida so‘z boyligini kengaytirish va grammatik qoidalarni amalda qo‘llash.',
        },
        {
          title: 'Speaking & Pronunciation',
          desc: 'Har dars jonli muloqot, to‘g‘ri talaffuz va erkin fikr bildirish ko‘nikmasi.',
        },
        {
          title: 'Listening & Reading Comprehension',
          desc: 'Audio materiallar va turli matnlarni chuqur tahlil qilish hamda test ishlash texnikalari.',
        },
        {
          title: 'Kids Guruhlarga Xos Metodika',
          desc: 'O‘yinlar, interaktiv topshiriqlar va vizual materiallar orqali bolalarda fanga mehr uyg‘otish.',
        },
        {
          title: 'IELTS / CEFR Mock Imtihonlari',
          desc: 'Haqiqiy imtihon muhiti bilan darajani sinovdan o‘tkazish va individual xatolarni tahlil qilish.',
        },
      ]
    : [
        {
          title: 'O‘zbekiston Tarixi to‘liq kursi',
          desc: 'Qadimgi davrdan boshlab eng yangi davrgacha bo‘lgan barcha davrlar xronologiyasi va chuqur tahlili.',
        },
        {
          title: 'Jahon Tarixi asoslari',
          desc: 'Buyuk davlatlar, kashfiyotlar, imperiyalar va jahon sivilizatsiyalari tarixi.',
        },
        {
          title: 'DTM va Litsey Testlari bilan ishlash',
          desc: 'A darajadagi test savollari, mantiqiy savollar va vaqtdan unumli foydalanish strategiyalari.',
        },
        {
          title: 'Xaritalar va sanalar bilan mashqlar',
          desc: 'Tarixiy sanalar, shaxslar va tarixiy xaritalarni yodda saqlashning zamonaviy mnemotexnikasi.',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Kurs Tafsilotlari · IELTS CAMP
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{course.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Main Key Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Oylik to‘lov</div>
                <div className="text-lg font-black text-slate-900">{course.price || '200 000 so‘m'}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Dars kunlari</div>
                <div className="text-sm font-bold text-slate-900">Seshanba, Payshanba, Shanba</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Dars vaqti</div>
                <div className="text-sm font-bold text-slate-900">
                  {isEnglish ? '16:30 – 18:30' : '16:00 – 18:00'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Kurs haqida umumiy ma’lumot
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{course.description}</p>
          </div>

          {/* Ustozlar */}
          {course.teachers && course.teachers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Kurs ustozlari va malakasi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.teachers.map((teacher: Teacher) => (
                  <div
                    key={teacher.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-200 transition-colors flex items-start gap-3.5"
                  >
                    <div className="w-11 h-11 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0 text-sm">
                      {teacher.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{teacher.name}</h4>
                      <p className="text-xs font-semibold text-red-600">{teacher.level}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{teacher.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus / Topics */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Kurs dasturida nimalar o‘rgatiladi?
            </h3>
            <div className="space-y-3">
              {topics.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{t.title}</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups Available */}
          {course.groups && course.groups.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Mavjud guruhlar va jadvallar
              </h3>
              <div className="space-y-3">
                {course.groups.map((group: Group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-red-400 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{group.name}</span>
                        {group.is_kids ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                            Kids Guruhi
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                        <span>Ustoz: {group.teacher}</span>
                        <span>·</span>
                        <span>{group.days}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">{group.time_slot}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectGroupAndRegister(course, group);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>Ushbu guruhga yozilish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">To‘liq oylik kurs narxi:</div>
            <div className="text-xl font-black text-slate-900">{course.price || '200 000 so‘m'}</div>
          </div>
          <button
            onClick={() => {
              onClose();
              onSelectGroupAndRegister(course);
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 active:scale-[0.98] transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <span>Ro‘yxatdan o‘tish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
