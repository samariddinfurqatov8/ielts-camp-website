import React from 'react';
import { ArrowRight, BookOpen, CheckCircle, Phone, Award, Sparkles } from 'lucide-react';
import { TelegramIcon } from './TelegramIcon.js';
import heroImg from '../assets/images/hero_ielts_students_1793011909052.jpg';

interface HeroProps {
  onRegisterClick: () => void;
  onExploreCourses: () => void;
  phone?: string;
  telegramUrl?: string;
  telegramUsername?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onRegisterClick,
  onExploreCourses,
  phone = '+998 97 482 06 26',
  telegramUrl = 'https://t.me/diyorbek_mirzaolim0v',
  telegramUsername = '@diyorbek_mirzaolim0v',
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  return (
    <section id="hero" className="relative bg-slate-950 text-white pt-10 pb-20 overflow-hidden">
      {/* Background radial gradients for depth */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Red Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>IELTS CAMP · 2026 Yangi Qabul Mavsumi</span>
            </div>

            {/* Sarlavha */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white max-w-2xl text-balance">
              Kelajagingizni bilim bilan quring!
            </h1>

            {/* Tavsif */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Ingliz tili, CEFR va tarix fanlaridan bilimlaringizni rivojlantiring. O‘zingizga mos kursni tanlang va IELTS CAMP bilan ta’lim yo‘lingizni boshlang.
            </p>

            {/* Action Buttons: Kursga yozilish, Kurslarni ko'rish, Admin bilan bog'lanish (Telegram) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onRegisterClick}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer"
              >
                <span>Kursga yozilish</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCourses}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-red-400" />
                <span>Kurslarni ko‘rish</span>
              </button>

              {/* Admin bilan bog'lanish — Telegram orqali to'g'ridan-to'g'ri ochish */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-white font-bold rounded-xl border border-[#229ED9]/50 hover:border-[#229ED9] shadow-md shadow-[#229ED9]/15 transition-all flex items-center justify-center gap-2.5 text-base group"
                title={`Admin bilan Telegram orqali bog‘lanish (${telegramUsername})`}
              >
                <TelegramIcon className="w-5 h-5 text-[#229ED9] group-hover:scale-110 transition-transform" />
                <span>Admin bilan bog‘lanish</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                title={`Qo‘ng‘iroq qilish: ${phone}`}
              >
                <Phone className="w-4 h-4 text-red-400" />
                <span>{phone}</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span>Har bir kurs 200 000 so‘m/oy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span>C1 & B2 darajali ustozlar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span>Alohida Kids guruhlari</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Anchor */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/60 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] group">
              <img
                src={heroImg}
                alt="IELTS CAMP o‘quvchilari"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />

              {/* Red-accented overlay card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                      IELTS CAMP Ta’lim Sifati
                    </p>
                    <p className="text-sm font-bold text-white">
                      CEFR, IELTS & Tarix DTM tayyorgarligi
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item Feature Strip Below Hero */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-red-500/40 transition-colors">
            <div className="text-red-500 font-black text-xl mb-1">200 000 so‘m</div>
            <div className="text-sm font-semibold text-white">Hamyonbop oylik to‘lov</div>
            <div className="text-xs text-slate-400 mt-1">Ingliz tili / CEFR va Tarix kurslari uchun bir xil ochiq narx.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-red-500/40 transition-colors">
            <div className="text-red-500 font-black text-xl mb-1">Seshanba · Pay · Shanba</div>
            <div className="text-sm font-semibold text-white">Qulay dars jadvali</div>
            <div className="text-xs text-slate-400 mt-1">16:00–18:00 (Tarix) va 16:30–18:30 (Ingliz tili / CEFR).</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-red-500/40 transition-colors">
            <div className="text-red-500 font-black text-xl mb-1">Kids & CEFR</div>
            <div className="text-sm font-semibold text-white">Alohida ixtisoslashgan guruhlar</div>
            <div className="text-xs text-slate-400 mt-1">Bolalar va kattalar alohida guruhlarda o‘rganadi.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-red-500/40 transition-colors">
            <div className="text-red-500 font-black text-xl mb-1">+998 97 482 06 26</div>
            <div className="text-sm font-semibold text-white">To‘g‘ridan-to‘g‘ri aloqa</div>
            <div className="text-xs text-slate-400 mt-1">Administratorimiz har doim konsultatsiyaga tayyor.</div>
          </div>
        </div>
      </div>
    </section>
  );
};
