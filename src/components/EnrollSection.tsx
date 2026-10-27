import React from 'react';
import { AlertTriangle, MapPin, BookOpen, GraduationCap, ArrowUpRight } from 'lucide-react';
import { TelegramIcon } from './TelegramIcon.js';

// Arizalar faqat Telegram orqali admin bilan bog‘lanib qabul qilinadi.
export const ADMIN_TELEGRAM_URL = 'https://t.me/diyorbek_mirzaolim0v';

const courses = [
  { name: 'Ingliz tili / CEFR', price: '200 000 so‘m/oy' },
  { name: 'Tarix', price: '200 000 so‘m/oy' },
];

export const EnrollSection: React.FC = () => {
  return (
    <section id="enroll" className="py-20 bg-white border-t border-slate-200 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-red-600/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#229ED9]/20 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-10 p-6 sm:p-10 lg:p-12">
            {/* Left: heading, warning, Telegram button */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-6 text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                IELTS CAMP · Ro‘yxatga olish
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Kurslarga yozilish
              </h2>

              <div
                role="note"
                className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3.5 text-left"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base font-semibold text-amber-100 leading-relaxed">
                  Arizadan o‘tish uchun admin bilan bog‘laning
                </p>
              </div>

              <a
                href={ADMIN_TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full sm:w-auto self-center lg:self-start items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec3] active:scale-[0.98] text-white text-base font-bold shadow-lg shadow-[#229ED9]/30 transition-all"
              >
                <TelegramIcon className="w-6 h-6" />
                <span>Admin bilan bog‘lanish</span>
                <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <p className="text-xs text-slate-400 font-mono">@diyorbek_mirzaolim0v</p>
            </div>

            {/* Right: center info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Kurslar</div>
                  <ul className="space-y-1.5">
                    {courses.map((c) => (
                      <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="font-black text-red-400 tabular-nums">{c.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">O‘qituvchi</div>
                  <div className="text-sm font-semibold text-white">Diyorbek Mirzaolimov (C1)</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Manzil</div>
                  <div className="text-sm font-semibold text-white leading-relaxed">
                    Jizzax viloyati, Zomin tumani, Yom qishlog‘i
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
