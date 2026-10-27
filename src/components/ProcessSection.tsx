import React from 'react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Online ariza topshirish',
      desc: 'Saytdagi forma orqali ismingiz, telefon raqamingiz va tanlangan kursingizni belgilab ariza yuborasiz.',
    },
    {
      num: '02',
      title: 'Konsultatsiya va darajani aniqlash',
      desc: 'Administratorimiz siz bilan bog‘lanib, boshlang‘ich bilimingizni bepul diagnostika qilishga taklif etadi.',
    },
    {
      num: '03',
      title: 'Mos guruhga biriktirish',
      desc: 'Bilim darajangiz va yoshingizga (Kids yoki kattalar guruhiga) asosan mos jadvaldagi guruh belgilanadi.',
    },
    {
      num: '04',
      title: 'Darslar va maqsadga erishish',
      desc: 'Seshanba, Payshanba, Shanba kunlari darslar, doimiy monitoring va rasmiy imtihonga to‘liq tayyorgarlik boshlanadi.',
    },
  ];

  return (
    <section id="process" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            IELTS CAMP · Bosqichma-bosqich qabul
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            O‘qish jarayoni qanday boshlanadi?
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Bizda o‘qishni boshlash juda oddiy va qulay. Har bir o‘quvchining darajasi xolis baholanadi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-red-300 hover:shadow-lg transition-all relative flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-red-600/30 block mb-3 font-mono">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
