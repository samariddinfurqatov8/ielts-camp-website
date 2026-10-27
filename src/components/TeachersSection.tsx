import React from 'react';
import { Teacher } from '../types.js';
import { Award, BookOpen, CheckCircle, ArrowRight, Star, GraduationCap } from 'lucide-react';

interface TeachersSectionProps {
  teachers: Teacher[];
  onEnrollTeacher: (teacherName: string) => void;
}

export const TeachersSection: React.FC<TeachersSectionProps> = ({ teachers, onEnrollTeacher }) => {
  // If teachers haven't loaded yet from API, provide fallback official list
  const defaultTeachers = [
    {
      id: 1,
      name: 'Diyorbek Mirzaolimov',
      subject: 'Ingliz tili / CEFR',
      level: 'C1 darajasi',
      bio: 'Ingliz tili va CEFR/IELTS imtihonlariga tayyorlash bo‘yicha tajribali mutaxassis, C1 sertifikati sohibi. O‘quvchilarni yuqori ballarga tayyorlashda maxsus interaktiv metodika qo‘llaydi.',
      is_kids: 0,
    },
    {
      id: 2,
      name: 'Doniyorbek Mirzaolimov',
      subject: 'Ingliz tili (Kids)',
      level: 'B2 darajasi',
      bio: 'Bolalar psixologiyasi va erta yoshdagi bolalarga ingliz tilini qiziqarli o‘yinlar orqali o‘rgatish bo‘yicha mutaxassis. Kids guruhlari bilan ishlashga ixtisoslashgan.',
      is_kids: 1,
    },
    {
      id: 3,
      name: 'Xolmirzayev Og‘abek',
      subject: 'Tarix',
      level: 'A darajasi',
      bio: 'O‘zbekiston va Jahon tarixi bo‘yicha malakali ustoz. DTM, litsey va oliy o‘quv yurtlariga kirish imtihonlarida maksimal natija ko‘rsatishga yo‘naltirilgan intensiv dastur muallifi.',
      is_kids: 0,
    },
  ];

  const displayTeachers = teachers && teachers.length > 0 ? teachers : defaultTeachers;

  return (
    <section id="teachers" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            IELTS CAMP · Malakali Murabbiylar Jamoasi
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tajribali va xalqaro sertifikatli ustozlarimiz
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Har bir o‘quvchiga individual yondashuv, zamonaviy o‘qitish usullari va ishonchli natijalar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTeachers.map((teacher) => {
            const isKids = teacher.subject.toLowerCase().includes('kids') || teacher.name.includes('Doniyorbek');
            return (
              <div
                key={teacher.id}
                className="bg-slate-50 rounded-3xl border border-slate-200 p-7 flex flex-col justify-between hover:border-red-300 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="space-y-5">
                  {/* Top Avatar badge & qualification badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-red-600/25 group-hover:scale-105 transition-transform">
                      {teacher.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-red-100 text-red-700 font-extrabold text-xs">
                        {teacher.level}
                      </span>
                      {isKids ? (
                        <div className="text-[10px] font-bold text-amber-700 mt-1">Kids Guruhi</div>
                      ) : null}
                    </div>
                  </div>

                  {/* Teacher info */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                      {teacher.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                      <GraduationCap className="w-4 h-4 text-red-600" />
                      <span>{teacher.subject}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {teacher.bio}
                  </p>

                  {/* Highlights */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Har darsda individual nazorat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Dars kunlari: Seshanba, Payshanba, Shanba</span>
                    </div>
                  </div>
                </div>

                {/* Enrollment button */}
                <div className="pt-6 mt-6 border-t border-slate-200">
                  <button
                    onClick={() => onEnrollTeacher(teacher.name)}
                    className="w-full py-3 bg-white hover:bg-red-600 hover:text-white text-slate-900 font-bold text-xs rounded-xl border border-slate-200 hover:border-red-600 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group-hover:shadow-md"
                  >
                    <span>{teacher.name.split(' ')[0]} domlaga yozilish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
