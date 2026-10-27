import React from 'react';
import { Shield, Phone, Heart } from 'lucide-react';
import { Logo } from './Logo.js';
import { TelegramIcon } from './TelegramIcon.js';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenPrivacy?: () => void;
  phone?: string;
  telegramUrl?: string;
  telegramUsername?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenPrivacy,
  phone = '+998 97 482 06 26',
  telegramUrl = 'https://t.me/diyorbek_mirzaolim0v',
  telegramUsername = '@diyorbek_mirzaolim0v',
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-slate-800">
          {/* Brand */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-white/5 p-2 rounded-2xl border border-white/10">
              <Logo size="md" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-semibold">
                Ingliz tili / CEFR & Tarix ta’lim markazi
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Oylik to‘lov: 200 000 so‘m · Dars kunlari: Seshanba, Payshanba, Shanba
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
            <a href="#hero" className="hover:text-red-400 transition-colors">Bosh sahifa</a>
            <a href="#courses" className="hover:text-red-400 transition-colors">Kurslar</a>
            <a href="#teachers" className="hover:text-red-400 transition-colors">Ustozlar</a>
            <a href="#schedule" className="hover:text-red-400 transition-colors">Dars jadvali</a>
            <a href="#about" className="hover:text-red-400 transition-colors">Biz haqimizda</a>
            <a href="#faq" className="hover:text-red-400 transition-colors">Savol-javob</a>
            <a href="#contact" className="hover:text-red-400 transition-colors">Aloqa</a>
          </div>

          {/* Actions: Telegram, Phone & Admin */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#229ED9]/20 text-slate-200 hover:text-white transition-colors flex items-center gap-2 border border-transparent hover:border-[#229ED9]/40"
              title={`Admin bilan Telegram orqali bog‘lanish (${telegramUsername})`}
            >
              <TelegramIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Admin: {telegramUsername}</span>
            </a>

            <a
              href={`tel:${cleanPhone}`}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors flex items-center gap-2"
              title="Qo‘ng‘iroq qilish"
            >
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>{phone}</span>
            </a>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Administrator boshqaruv paneli"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} IELTS CAMP o‘quv markazi. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            {onOpenPrivacy && (
              <button
                onClick={onOpenPrivacy}
                className="hover:text-red-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Maxfiylik siyosati
              </button>
            )}
            <span aria-hidden="true">·</span>
            <span>Zomin, Jizzax viloyati</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
