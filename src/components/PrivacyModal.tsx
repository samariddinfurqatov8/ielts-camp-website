import React from 'react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest">
                IELTS CAMP Rasmiy Hujjat
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Maxfiylik Siyosati</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">1. Umumiy qoidalar</h3>
            <p>
              Ushbu Maxfiylik siyosati “IELTS CAMP” o‘quv markazining veb-sayti orqali foydalanuvchilar (o‘quvchilar va ularning ota-onalari) tomonidan taqdim etilgan shaxsiy ma’lumotlarni to‘plash, saqlash va qayta ishlash tartibini belgilaydi.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">2. To‘planadigan ma’lumotlar</h3>
            <p>
              Kurslarga ro‘yxatdan o‘tish jarayonida quyidagi ma’lumotlar ixtiyoriy ravishda olinadi:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-700">
              <li>Foydalanuvchining ismi va familiyasi;</li>
              <li>Telefon raqami (aloqa va dars jadvalini tasdiqlash uchun);</li>
              <li>Tug‘ilgan yili yoki sanasi (bolalar va kattalar guruhlarini to‘g‘ri taqsimlash uchun);</li>
              <li>Tanlangan fan, daraja va qulay dars vaqti.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">3. Ma’lumotlardan foydalanish maqsadi</h3>
            <p>
              Olingan barcha ma’lumotlar faqat o‘quv jarayonini tashkil etish, o‘quvchini mos guruhga biriktirish, to‘lov va dars boshlanishi haqida xabardor qilish maqsadida ishlatiladi. Hech qanday ma’lumot uchinchi shaxslarga berilmaydi yoki sotilmaydi.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">4. Xavfsizlik choralari</h3>
            <p>
              Foydalanuvchilarning barcha arizalari xavfsiz ma’lumotlar bazasida himoyalangan tarzda saqlanadi. Administrator paneli zamonaviy kriptografik algoritmlar (PBKDF2) va xavfsiz sessiya tokenlari orqali himoyalangan.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">5. Bog‘lanish</h3>
            <p>
              Maxfiylik siyosati bo‘yicha qo‘shimcha savollar yoki o‘z ma’lumotlaringizni o‘chirish talabi bo‘yicha administrator bilan bog‘lanishingiz mumkin:
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              Telefon:{' '}
              <a href="tel:+998974820626" className="text-red-600 hover:underline">
                +998 97 482 06 26
              </a>
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 sm:px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  );
};
