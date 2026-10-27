import React from 'react';
import { Calendar, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Group, Course } from '../types.js';

interface ScheduleSectionProps {
  onRegisterGroup: (courseSlug: string, isKids?: boolean) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ onRegisterGroup }) => {
  const scheduleItems = [
    {
      course: 'Ingliz tili / CEFR',
      slug: 'english-cefr',
      groupName: 'Ingliz tili (C1 daraja)',
      teacher: 'Diyorbek Mirzaolimov (C1)',
      days: 'Seshanba, Payshanba, Shanba',
      timeSlot: '16:30 – 18:30',
      duration: '2 soat / dars',
      isKids: false,
      capacity: '15 nafar',
      status: 'Qabul davom etmoqda',
    },
    {
      course: 'Ingliz tili (Kids guruhi)',
      slug: 'english-cefr',
      groupName: 'Kids guruhi (B2 daraja)',
      teacher: 'Doniyorbek Mirzaolimov (B2, Kids)',
      days: 'Seshanba, Payshanba, Shanba',
      timeSlot: '16:30 – 18:30',
      duration: '2 soat / dars',
      isKids: true,
      capacity: '12 nafar',
      status: 'Bo‘sh o‘rinlar cheklangan',
    },
    {
      course: 'Tarix kursi',
      slug: 'history',
      groupName: 'Tarix (A daraja)',
      teacher: 'Xolmirzayev Og‘abek (Daraja A)',
      days: 'Seshanba, Payshanba, Shanba',
      timeSlot: '16:00 – 18:00',
      duration: '2 soat / dars',
      isKids: false,
      capacity: '15 nafar',
      status: 'Qabul davom etmoqda',
    },
  ];

  return (
    <section id="schedule" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            IELTS CAMP · Haftalik Dars Jadvali
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Aniq va tizimli dars soatlari
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Darslar haftasiga 3 kun (Seshanba, Payshanba, Shanba) tashkil etilgan. O‘zingizga mos vaqt va yo‘nalishni tanlab, hoziroq joy band qiling.
          </p>
        </div>

        {/* Schedule Cards / Table View */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {scheduleItems.map((item, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/70 transition-colors"
              >
                {/* Column 1: Course & Group */}
                <div className="lg:w-1/3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      {item.course}
                    </span>
                    {item.isKids && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Kids Guruhi
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.groupName}</h3>
                  <p className="text-xs text-slate-500">
                    Ustoz: <strong className="text-slate-800">{item.teacher}</strong>
                  </p>
                </div>

                {/* Column 2: Days & Timeslot */}
                <div className="lg:w-1/3 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs sm:text-sm">
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3 w-full sm:w-auto">
                    <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Dars kunlari</div>
                      <div className="font-bold text-slate-900">{item.days}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-red-50/70 border border-red-100 flex items-center gap-3 w-full sm:w-auto">
                    <Clock className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Dars vaqti</div>
                      <div className="font-black text-red-700">{item.timeSlot}</div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Enrollment Status & CTA */}
                <div className="flex items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Sig‘im: {item.capacity}</div>
                  </div>

                  <button
                    onClick={() => onRegisterGroup(item.slug, item.isKids)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Jadvalga yozilish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick bottom note */}
        <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
          Darslar rejali tarzda olib boriladi. Guruhlar to‘lib qolganda yangi vaqtlar e’lon qilinadi. Savollar bo‘lsa administrator bilan bog‘laning:{' '}
          <a href="tel:+998974820626" className="text-red-600 font-bold hover:underline">
            +998 97 482 06 26
          </a>
        </div>
      </div>
    </section>
  );
};
