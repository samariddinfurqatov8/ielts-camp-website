import React, { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

interface FaqSectionProps {
  phone?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ phone = '+998 97 482 06 26' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  const faqs = [
    {
      q: 'Kurslarning oylik to‘lovi qancha?',
      a: 'IELTS CAMP markazida barcha kurslar (Ingliz tili / CEFR va Tarix) uchun rasmiy oylik narx bir xil va qat’iy 200 000 so‘m qilib belgilangan. Hech qanday yashirin to‘lovlar yo‘q.',
    },
    {
      q: 'Darslar haftaning qaysi kunlari va soatlarida bo‘lib o‘tadi?',
      a: 'Darslar haftasiga 3 kun: Seshanba, Payshanba va Shanba kunlari o‘tiladi. Tarix kursi soat 16:00–18:00 oralig‘ida, Ingliz tili / CEFR va Kids guruhlari esa soat 16:30–18:30 oralig‘ida tashkil etiladi.',
    },
    {
      q: 'Kids guruhlariga necha yoshdan qabul qilinadi va kim dars beradi?',
      a: 'Kids guruhlariga maktab yoshidagi yosh o‘quvchilar qabul qilinadi. Darslarni Doniyorbek Mirzaolimov (B2 darajasi, bolalar bilan ishlashga ixtisoslashgan ustoz) interaktiv va o‘yin metodikasi asosida olib boradi.',
    },
    {
      q: 'Tarix kursida kim dars beradi va qanday yo‘nalishlar qamrab olingan?',
      a: 'Tarix fani bo‘yicha Xolmirzayev Og‘abek (Daraja A) dars beradi. Kurs O‘zbekiston tarixi, Jahon tarixi, sanalar bilan ishlash hamda DTM va litseylarga kirish testlariga to‘liq tayyorgarlikni o‘z ichiga oladi.',
    },
    {
      q: 'Ariza topshirgandan so‘ng qachon bog‘lanasiz?',
      a: 'Arizangiz sayt orqali yuborilgach, markazimiz koordinatori 24 soat ichida ko‘rsatilgan raqamingiz orqali bog‘lanadi va birinchi sinov darsi vaqtini tasdiqlaydi.',
    },
    {
      q: 'Bir guruhda necha nafar o‘quvchi ta’lim oladi?',
      a: 'Ta’lim sifati va har bir o‘quvchi bilan individual ishlashni ta’minlash maqsadida guruhlar sig‘imi ko‘pi bilan 12–15 nafar bilan chegaralangan.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            IELTS CAMP · Savol-javoblar
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ko‘p beriladigan savollar
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Qabul tartibi, guruhlar, jadvallar va to‘lov shartlariga oid eng muhim savollarga javoblar.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-red-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/70">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Phone Banner */}
        <div className="mt-10 p-5 rounded-3xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Savolingizga javob topmadingizmi?</div>
              <div className="text-xs text-slate-600">Administratorimiz bilan to‘g‘ridan-to‘g‘ri bog‘laning.</div>
            </div>
          </div>
          <a
            href={`tel:${cleanPhone}`}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
