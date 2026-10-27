import React, { useState, useEffect } from 'react';
import { Course, Group } from '../types.js';
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles, Phone, User, Calendar, Clock, BookOpen, FileText, Check } from 'lucide-react';
import { safeFetchJson } from '../utils/api.js';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialCourseId?: number | null;
  initialGroupId?: number | null;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialCourseId,
  initialGroupId,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [birthDate, setBirthDate] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | string>('');
  const [level, setLevel] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    applicationCode: string;
    courseName: string;
    coursePrice: string;
    groupName?: string;
  } | null>(null);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    } else if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [initialCourseId, courses]);

  // Sync groups when course changes
  const currentCourse = courses.find((c) => String(c.id) === String(selectedCourseId));
  const availableGroups = currentCourse?.groups || [];

  useEffect(() => {
    if (initialGroupId && availableGroups.some((g) => g.id === initialGroupId)) {
      setSelectedGroupId(initialGroupId);
    } else if (availableGroups.length > 0) {
      setSelectedGroupId(availableGroups[0].id);
    } else {
      setSelectedGroupId('');
    }
  }, [selectedCourseId, initialGroupId, courses]);

  // Auto-set preferred time based on course schedule
  useEffect(() => {
    if (currentCourse) {
      if (currentCourse.slug === 'english-cefr') {
        setPreferredTime('Seshanba, payshanba, shanba (16:30–18:30)');
      } else {
        setPreferredTime('Seshanba, payshanba, shanba (16:00–18:00)');
      }
    }
  }, [selectedCourseId, currentCourse]);

  if (!isOpen) return null;

  const isEnglishCourse = currentCourse?.slug === 'english-cefr';
  const selectedGroup = availableGroups.find((g) => String(g.id) === String(selectedGroupId));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim()) {
      setErrorMessage('Iltimos, ismingizni kiriting.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Iltimos, familiyangizni kiriting.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^\d]/g, '').length < 9) {
      setErrorMessage('Iltimos, to‘liq telefon raqamingizni kiriting (+998 90 123 45 67).');
      return;
    }
    if (!selectedCourseId) {
      setErrorMessage('Iltimos, o‘zingizga mos kursni tanlang.');
      return;
    }
    if (!preferredTime) {
      setErrorMessage('Iltimos, qulay dars vaqtini tanlang.');
      return;
    }
    if (!consent) {
      setErrorMessage('Shaxsiy ma’lumotlarni qayta ishlashga rozilik bildirishingiz lozim.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await safeFetchJson<{
        applicationCode: string;
        courseName: string;
        coursePrice: string;
        groupName?: string;
      }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          birthDate: birthDate.trim(),
          courseId: Number(selectedCourseId),
          groupId: selectedGroupId ? Number(selectedGroupId) : null,
          level: isEnglishCourse ? level : 'Daraja: A',
          preferredTime,
          comment: comment.trim(),
          consent: true,
        }),
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Arizani yuborishda xatolik yuz berdi. Qayta urinib ko‘ring.');
      }

      setSuccessData({
        applicationCode: result.data.applicationCode,
        courseName: result.data.courseName || currentCourse?.name || 'Kurs',
        coursePrice: currentCourse?.price || '200 000 so‘m',
        groupName: result.data.groupName || selectedGroup?.name,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Server bilan bog‘lanishda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setFirstName('');
    setLastName('');
    setPhone('+998 ');
    setBirthDate('');
    setLevel('');
    setComment('');
    setErrorMessage(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header bar */}
        <div className="bg-slate-950 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>IELTS CAMP · Qabul 2026</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white mt-0.5">
              Kursga ro‘yxatdan o‘tish
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 sm:p-8">
          {successData ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-5 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900">
                  Arizangiz muvaffaqiyatli qabul qilindi!
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  IELTS CAMP markazini tanlaganingiz uchun tashakkur. Mutaxassisimiz tez orada ko‘rsatilgan telefon raqamingiz orqali siz bilan bog‘lanadi.
                </p>
              </div>

              {/* Application Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">Ariza raqami:</span>
                  <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {successData.applicationCode}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Tanlangan kurs:</span>
                  <span className="font-bold text-slate-900">{successData.courseName}</span>
                </div>

                {successData.groupName && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Tanlangan guruh:</span>
                    <span className="font-bold text-red-700">{successData.groupName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Oylik to‘lov:</span>
                  <span className="font-black text-slate-900">{successData.coursePrice}</span>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Ma’lumot uchun: +998 97 482 06 26</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  Bosh sahifaga qaytish
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ismingiz <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Sardor"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Familiyangiz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Aliyev"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              {/* Phone and Birth date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefon raqamingiz <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 font-mono transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Aloqa va tasdiqlash uchun</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tug‘ilgan yili yoki sanasi
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Masalan: 2008 yoki 15.04.2008"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Guruh yoshini to‘g‘ri belgilash uchun</span>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kursni tanlang <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((course) => {
                    const isSelected = String(course.id) === String(selectedCourseId);
                    return (
                      <button
                        type="button"
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-red-50/60 border-red-600 ring-2 ring-red-600/20 text-slate-900'
                            : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900">{course.name}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-black text-red-600">{course.price || '200 000 so‘m'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group selection if groups exist */}
              {availableGroups.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guruh va Ustozni tanlang
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableGroups.map((grp) => {
                      const isSelected = String(grp.id) === String(selectedGroupId);
                      return (
                        <button
                          type="button"
                          key={grp.id}
                          onClick={() => setSelectedGroupId(grp.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-red-50 border-red-500 text-slate-900'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{grp.name}</span>
                              {grp.is_kids ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                                  Kids
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Ustoz: {grp.teacher} · {grp.days} ({grp.time_slot})
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-red-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preferred Time Display */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dars vaqti (Seshanba, Payshanba, Shanba)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={preferredTime}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Additional comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qo‘shimcha savol yoki istaklaringiz (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  placeholder="Masalan: Kids guruhiga qatnashmoqchiman yoki oldin B1 darajagacha o‘qiganman..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all resize-none"
                />
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-600 cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-slate-600 cursor-pointer leading-tight">
                  IELTS CAMP markazi tomonidan shaxsiy ma’lumotlarim qayta ishlanishiga va administrator bog‘lanishiga roziman.
                </label>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ariza yuborilmoqda...</span>
                    </>
                  ) : (
                    <span>Arizani yuborish</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
