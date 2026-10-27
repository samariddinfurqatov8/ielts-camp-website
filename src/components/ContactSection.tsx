import React from 'react';
import { Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { TelegramIcon } from './TelegramIcon.js';

interface ContactSectionProps {
  onRegisterClick: () => void;
  phone?: string;
  address?: string;
  workHours?: string;
  telegramUrl?: string;
  telegramUsername?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  onRegisterClick,
  phone = '+998 97 482 06 26',
  address = 'Toshkent shahri, Yunusobod tumani (Mo‘ljal: Shahriston metro yaqinida)',
  workHours = 'Dushanba – Shanba: 09:00 – 19:00',
  telegramUrl = 'https://t.me/diyorbek_mirzaolim0v',
  telegramUsername = '@diyorbek_mirzaolim0v',
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  return (
    <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 uppercase tracking-wider">
              <span>Aloqa va Manzil</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Savollaringiz bormi? Administrator bilan bog‘laning
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Kurslar haqida to‘liq ma’lumot olish, sinov darslariga yozilish yoki markazimizga tashrif buyurish uchun quyidagi ma’lumotlar orqali murojaat qiling.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Phone Card */}
              <a
                href={`tel:${cleanPhone}`}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-red-300 hover:shadow-md transition-all space-y-2 group block"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Administrator telefoni</h4>
                <p className="text-sm font-bold text-red-600 font-mono">
                  {phone}
                </p>
                <p className="text-[11px] text-slate-400">
                  Qo‘ng‘iroq qilish uchun bosing
                </p>
              </a>

              {/* Telegram Admin Card */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#229ED9] hover:shadow-md transition-all space-y-2 group block"
                title={`Telegram orqali bog‘lanish: ${telegramUsername}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center group-hover:bg-[#229ED9] group-hover:text-white transition-colors">
                  <TelegramIcon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>Telegram admin</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#229ED9]/15 text-[#0088cc]">Direct</span>
                </h4>
                <p className="text-sm font-bold text-[#0088cc] font-mono">
                  {telegramUsername}
                </p>
                <p className="text-[11px] text-slate-500">
                  Admin bilan bog‘lanish uchun bosing
                </p>
              </a>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Ish tartibi</h4>
                <p className="text-xs text-slate-700 font-semibold">
                  {workHours}
                </p>
                <p className="text-[11px] text-slate-400">
                  Yakshanba — dam olish kuni
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">O‘quv markazi manzili</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Banner */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Kurslarga ro‘yxatdan o‘tishga tayyormisiz?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Online ariza qoldiring yoki administratorimiz bilan Telegram orqali to‘g‘ridan-to‘g‘ri bog‘laning.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onRegisterClick}
                  className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>Kursga yozilish</span>
                  <Send className="w-4 h-4" />
                </button>

                {/* Admin bilan bog'lanish — Telegram orqali */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-[#229ED9] hover:bg-[#1e8ec3] active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-[#229ED9]/25 transition-all flex items-center justify-center gap-2.5 text-sm"
                  title={`Admin bilan bog‘lanish (${telegramUsername})`}
                >
                  <TelegramIcon className="w-4 h-4" />
                  <span>Admin bilan bog‘lanish ({telegramUsername})</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full py-2.5 px-6 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-semibold rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>Qo‘ng‘iroq: {phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

