import React from 'react';
import { Target, CheckCircle, ShieldCheck, TrendingUp, Award, Users } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Overview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 uppercase tracking-wider">
              <span>Biz haqimizda</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              IELTS CAMP — ta’limda sifat, intizom va haqiqiy natija
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              IELTS CAMP o‘quv markazi yoshlar va abituriyentlarga ingliz tili, CEFR va tarix fanlarini chuqur, tizimli va xalqaro talablarga mos ravishda o‘rgatishga ixtisoslashgan zamonaviy ta’lim markazidir.
            </p>

            <p className="text-slate-600 text-sm leading-relaxed">
              Bizning asosiy maqsadimiz — shunchaki quruq dars o‘tish emas, balki har bir o‘quvchini CEFR (B1, B2, C1), IELTS hamda oliy ta’lim muassasalariga kirish testlarida maksimal natijaga yetaklashdir.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Aniq o‘quv rejasi</h4>
                  <p className="text-xs text-slate-500">Bosqichma-bosqich tuzilgan metodologiya</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Doimiy Mock imtihonlar</h4>
                  <p className="text-xs text-slate-500">Real imtihon muhiti va individual tahlil</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sinovdan o‘tgan materiallar</h4>
                  <p className="text-xs text-slate-500">Cambridge, Oxford va DTM rasmiy standartlari</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Kichik auditoriyalar</h4>
                  <p className="text-xs text-slate-500">Guruhda ko‘pi bilan 12–15 nafar o‘quvchi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Values Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 hover:border-red-200 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-red-600">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Natijadorlik</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Darslarning har bir daqiqasi imtihonda talab qilinadigan ko‘nikmalarni rivojlantirishga qaratiladi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 hover:border-red-200 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-red-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Shaffoflik va mas’uliyat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O‘quvchining har bir sinov natijasi, davomati va o‘zlashtirishi ota-onalar bilan ochiq tahlil qilinadi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 sm:col-span-2 hover:border-red-200 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-red-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Individual qo‘llab-quvvatlash</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Darsdan tashqari qo‘shimcha mashg‘ulotlar, Speaking club va tarix fanidan mavzuli seminar mashg‘ulotlari tashkil etiladi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
