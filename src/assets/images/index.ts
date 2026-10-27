// Rasmlar Vite orqali import qilinadi: build paytida fayllar dist/assets ga
// hash bilan ko‘chiriladi va to‘g‘ri URL qaytariladi. "/src/assets/..." kabi
// qatorli yo‘llar faqat dev serverda ishlaydi, production’da 404 beradi.
import heroStudents from './hero_ielts_students_1793011909052.jpg';
import courseEnglish from './course_english_cefr_1793011909104.jpg';
import courseHistory from './course_history_study_1793011909432.jpg';

export const images = {
  heroStudents,
  courseEnglish,
  courseHistory,
};
