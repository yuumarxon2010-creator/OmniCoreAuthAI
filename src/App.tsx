/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  BookOpen,
  GitFork,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Download,
  Code2,
  RefreshCw,
  Cpu,
  Trophy,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  User,
  AlertTriangle,
  Smile,
  Mic,
  Settings2,
  Layers,
  GraduationCap,
  Calculator,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award
} from 'lucide-react';
import { latinToCyrillicUzbek } from './utils/transliterate';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#070a12',
    primaryColor: '#0c1527',
    primaryBorderColor: '#06b6d4',
    primaryTextColor: '#f1f5f9',
    lineColor: '#818cf8',
    secondaryColor: '#172554',
    tertiaryColor: '#1e1b4b',
    fontFamily: 'Plus Jakarta Sans',
  },
});

export type SubjectType = 'Informatika/AI' | 'Matematika' | 'Fizika' | 'Kimyo' | 'Tarix' | 'Ingliz Tili';
export type GradeLevel = '1-4' | '5-8' | '9-11';
export type VoicePersona = 'jasur' | 'malika';
export type AvatarMood = 'idle' | 'speaking' | 'strict' | 'happy';
export type AudioEngine = 'google_natural' | 'web_speech';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonData {
  topic: string;
  category: string;
  subject: string;
  gradeLevel: GradeLevel;
  grade: number;
  simpleExplanation: string;
  formulas: string[];
  exampleProblem: {
    problem: string;
    stepByStepSolution: string;
  };
  closingQuestion: string;
  mermaidDiagram: string;
  speechScript: string;
  quizList: QuizQuestion[];
  passingScorePercent: number;
  nextTopic: string;
  reviewExplanation: string;
  strictFeedback: string;
  happyFeedback: string;
}

const MANDATORY_CLOSING_QUESTION = "Mavzuni o'zlashtirib bo'ldingizmi? Mavzuga oid savol-javoblar qilamizmi keyingi mavzuga o'tishimiz uchun?";

// Initial high-fidelity lessons per subject and grade tier
const DEFAULT_SUBJECT_LESSONS: Record<SubjectType, LessonData> = {
  'Ingliz Tili': {
    topic: 'Ingliz Tili: Present Perfect Tense va Natijaviylik',
    category: 'Ingliz Tili Grammatikasi',
    subject: 'Ingliz Tili',
    gradeLevel: '5-8',
    grade: 7,
    simpleExplanation: 'Present Perfect zamoni (have/has + V3) o\'tmishda sodir bo\'lgan, ammo natijasi aynan hozirgi lahzada ko\'rinib turgan harakatlar uchun ishlatiladi. Masalan, "I have lost my key" jumlasi kalitning o\'tmishda yo\'qolgani va hozir ham uyga kira olmaslik natijasini bildiradi.',
    formulas: [
      'Darak gap: Ega + have/has + Past Participle (V3) + ikkinchi darajali bo\'laklar',
      'Inkor gap: Ega + have/has + not + V3 (haven\'t / hasn\'t)',
      'So\'roq gap: Have/Has + ega + V3?',
      'Signal so\'zlar: already, just, yet, ever, never, recently, so far'
    ],
    exampleProblem: {
      problem: '«She ______ already finished her homework.» bo\'sh o\'ringa to\'g\'ri yordamchi fe\'lni qo\'ying va gap ma\'nosini tahlil qiling.',
      stepByStepSolution: '1-qadam: Gapning egasiga qaraymiz — «She» (3-shaxs birlik). 2-qadam: 3-shaxs birlik uchun faqat «has» yordamchi fe\'li tanlanadi. 3-qadam: To\'g\'ri shakl: «She has already finished her homework». Natija: vazifa bajarib bo\'lingan va hozir daftari tayyor.'
    },
    closingQuestion: MANDATORY_CLOSING_QUESTION,
    mermaidDiagram: `graph LR
    A[O'tmishdagi Harakat Past Action] -->|have / has + V3| B[Hozirgi Natija Present Result]
    B --> C[Tajriba yoki Hozirgi Holat]
    C --> D[Signal so'zlar: already, just, yet, ever]`,
    speechScript: 'Present Perfect zamoni o\'tmishdagi harakatning hozirgi paytga bog\'liq natijasini ko\'rsatadi. Have yoki has yordamchi fe\'li va fe\'lning uchinchi shakli orqali yasaladi. ' + MANDATORY_CLOSING_QUESTION,
    quizList: Array.from({ length: 20 }, (_, idx) => {
      const qNum = idx + 1;
      const templates = [
        {
          q: `(${qNum}-savol) «She ______ already finished her homework.» Bo'sh o'ringa to'g'ri fe'lni qo'ying:`,
          o: ['has', 'have', 'is'],
          c: 0,
          e: 'Ingliz tilida 3-shaxs birlik (He, She, It) uchun Present Perfect da faqat «has» qo\'llaniladi.'
        },
        {
          q: `(${qNum}-savol) «They have ______ to Samarkand twice this year.» Mos fe'l shakli qaysi?`,
          o: ['been', 'went', 'go'],
          c: 0,
          e: 'Present Perfect da fe\'lning 3-shakli (V3) — «been» ishlatiladi.'
        },
        {
          q: `(${qNum}-savol) «I haven't completed my project ______». Inkor gap oxiriga qaysi signal so'z qo'yiladi?`,
          o: ['yet', 'already', 'just'],
          c: 0,
          e: '«yet» signal so\'zi Present Perfect da inkor va so\'roq gaplarning oxirida keladi.'
        },
        {
          q: `(${qNum}-savol) «______ you ever seen a real snow leopard?» So'roq gap boshiga nima qo'yiladi?`,
          o: ['Have', 'Has', 'Did'],
          c: 0,
          e: '«you» olmoshi bilan «Have» yordamchi fe\'li ishlatiladi.'
        }
      ];
      const sel = templates[idx % templates.length];
      return {
        id: qNum,
        question: sel.q,
        options: sel.o,
        correctIndex: sel.c,
        explanation: sel.e
      };
    }),
    passingScorePercent: 60,
    nextTopic: 'Past Continuous Tense (O\'tgan zamonda davom etgan harakat)',
    reviewExplanation: 'Ingliz tilida Present Perfect zamoni have/has + V3 orqali yasaladi. 3-shaxs birlikda (he/she/it) has, boshqalarda have ishlatilishini va signal so\'zlarni takrorlang.',
    strictFeedback: 'Diqqatsizlik! «She» olmoshidan keyin «have» emas, «has» yordamchi fe\'li qo\'yiladi!',
    happyFeedback: 'Excellent! Siz 3-shaxs birlik uchun «has» fe\'li qoidasini a\'lo darajada bilasiz!'
  },
  'Matematika': {
    topic: 'Matematika: Pifagor Teoremasi va Geometriya',
    category: 'Geometriya',
    subject: 'Matematika',
    gradeLevel: '5-8',
    grade: 8,
    simpleExplanation: 'Pifagor teoremasiga ko\'ra, to\'g\'ri burchakli uchburchakda gipotenuza kvadratining qiymati katetlar kvadratlarining yig\'indisiga doimo teng bo\'ladi. Ushbu teorema barcha fazoviy masofalarni va vektor uzunliklarini aniqlashda poydevor hisoblanadi.',
    formulas: [
      'Asosiy formula: a² + b² = c² (bu yerda a va b — katetlar, c — gipotenuza)',
      'Gipotenuzani topish: c = √(a² + b²)',
      'Katetni topish: a = √(c² - b²)',
      'Misr uchburchagi nisbatlari: 3 : 4 : 5'
    ],
    exampleProblem: {
      problem: 'To\'g\'ri burchakli uchburchakning katetlari a = 6 sm va b = 8 sm bo\'lsa, uning gipotenuzasini (c) toping.',
      stepByStepSolution: '1-qadam: Formulani yozamiz: c² = a² + b². 2-qadam: Qiymatlarni qo\'yamiz: c² = 6² + 8² = 36 + 64 = 100. 3-qadam: Kvadrat ildiz chiqaramiz: c = √100 = 10 sm. Javob: Gipotenuza 10 sm ga teng.'
    },
    closingQuestion: MANDATORY_CLOSING_QUESTION,
    mermaidDiagram: `graph TD
    A[To'g'ri Burchakli Uchburchak] --> B[Katet a va Katet b]
    B --> C[Katetlar Kvadratlari: a² + b²]
    C --> D[Gipotenuza Kvadrati c²]
    D --> E[Masofa va Vektor Formulalari]`,
    speechScript: 'Pifagor teoremasi to\'g\'ri burchakli uchburchakda gipotenuza kvadrati katetlar kvadratlarining yig\'indisiga teng ekanligini ta\'kidlaydi. ' + MANDATORY_CLOSING_QUESTION,
    quizList: Array.from({ length: 20 }, (_, idx) => {
      const qNum = idx + 1;
      const templates = [
        {
          q: `(${qNum}-savol) To'g'ri burchakli uchburchakning katetlari 3 va 4 bo'lsa, gipotenuzasi nechaga teng?`,
          o: ['5', '6', '7'],
          c: 0,
          e: 'Pifagor formulasi: c² = 3² + 4² = 9 + 16 = 25, demak c = √25 = 5.'
        },
        {
          q: `(${qNum}-savol) Gipotenuza c = 13 sm, bir katet a = 5 sm bo'lsa, ikkinchi katet b nechaga teng?`,
          o: ['12 sm', '10 sm', '8 sm'],
          c: 0,
          e: 'b = √(13² - 5²) = √(169 - 25) = √144 = 12 sm.'
        },
        {
          q: `(${qNum}-savol) Pifagor teoremasi qanday uchburchaklar uchun doimo o'rinli?`,
          o: ['Faqat to\'g\'ri burchakli uchburchaklar uchun', 'Barcha teng tomonli uchburchaklar uchun', 'O\'tmas burchakli uchburchaklar uchun'],
          c: 0,
          e: 'Pifagor teoremasi faqat 90 gradusli to\'g\'ri burchakka ega uchburchaklarda qo\'llanadi.'
        },
        {
          q: `(${qNum}-savol) Katetlari 6 sm va 8 sm bo'lgan to'g'ri burchakli uchburchak gipotenuzasi necha sm?`,
          o: ['10 sm', '14 sm', '12 sm'],
          c: 0,
          e: 'c = √(36 + 64) = √100 = 10 sm.'
        }
      ];
      const sel = templates[idx % templates.length];
      return {
        id: qNum,
        question: sel.q,
        options: sel.o,
        correctIndex: sel.c,
        explanation: sel.e
      };
    }),
    passingScorePercent: 60,
    nextTopic: 'Trigonometrik Funksiyalar (Sinus, Kosinus va Tangens qoidalari)',
    reviewExplanation: 'Pifagor teoremasi formulasi c² = a² + b² ekanligini, katetlar kvadratlari yig\'indisidan ildiz olinishini yana bir bor eslab qoling.',
    strictFeedback: 'Hisoblashda adashdingiz! 3² + 4² = 9 + 16 = 25, uning kvadrat ildizi esa 5 bo\'ladi!',
    happyFeedback: 'Ofarin! Qadimgi Misr uchburchagi va Pifagor teoremasini a\'lo darajada bilasiz!'
  },
  'Fizika': {
    topic: 'Fizika: Butunjahon Gravitatsiya Qonuni',
    category: 'Klassik Mexanika',
    subject: 'Fizika',
    gradeLevel: '5-8',
    grade: 7,
    simpleExplanation: "Gravitatsiya — barcha massaga ega jismlarning bir-birini o'zaro tortishish fundamental kuchidir. Jismning massasi qanchalik katta bo'lsa, uning gravitatsiya maydoni shunchalik kuchli bo'ladi va masofa ortishi bilan bu kuch tez pasayadi.",
    formulas: [
      "Nyuton tortishish qonuni: F = G · (m₁ · m₂) / r²",
      "Gravitatsiya doimiysi: G ≈ 6.674 × 10⁻¹¹ N·m²/kg²",
      "Erkin tushish tezlanishi: g = G · M_yer / R_yer² ≈ 9.8 m/s²",
      "Og'irlik kuchi formulasi: P = m · g"
    ],
    exampleProblem: {
      problem: "Massasi 10 kg bo'lgan jismga Yer yuzasida ta'sir qiluvchi og'irlik kuchini (g = 9.8 m/s²) hisoblang.",
      stepByStepSolution: "1-qadam: Formulani olamiz: F = m · g. 2-qadam: Berilganlarni qo'yamiz: m = 10 kg, g = 9.8 m/s². 3-qadam: Ko'paytiramiz: F = 10 · 9.8 = 98 N (Nyuton). Javob: Jismga 98 N kuch ta'sir qiladi."
    },
    closingQuestion: MANDATORY_CLOSING_QUESTION,
    mermaidDiagram: `graph TD
    A[Massaga ega jism M1] -->|Gravitatsiya kuchi F| C[O'zaro tortishish markazi]
    B[Massaga ega jism M2] -->|Gravitatsiya kuchi F| C
    C --> D[Masofa kvadrati R² ga teskari proportsional]
    D --> E[Sayyoralar orbital harakati]`,
    speechScript: "Gravitatsiya — barcha massaga ega jismlarning bir-birini o'zaro tortishish fundamental kuchidir. Jismning massasi qanchalik katta bo'lsa, uning tortishish kuchi shunchalik kuchli bo'ladi. " + MANDATORY_CLOSING_QUESTION,
    quizList: Array.from({ length: 20 }, (_, idx) => {
      const qNum = idx + 1;
      const templates = [
        {
          q: `(${qNum}-savol) Ikki jism orasidagi masofa 2 barobar oshirilsa, ularning gravitatsion tortishish kuchi qanday o'zgaradi?`,
          o: ['4 barobar kamayadi', '2 barobar kamayadi', '2 barobar ortadi'],
          c: 0,
          e: 'Gravitatsiya kuchi masofaning kvadratiga teskari proportsionaldir (F ~ 1/r²).'
        },
        {
          q: `(${qNum}-savol) Jismning massasi 2 marta ortsa, uning boshqa jism bilan tortishish kuchi qanday o'zgaradi?`,
          o: ['2 barobar ortadi', '2 barobar kamayadi', 'O\'zgarmaydi'],
          c: 0,
          e: 'Kuch massalar ko\'paytmasiga to\'g\'ri proportsional bo\'lgani uchun 2 marta ortadi.'
        },
        {
          q: `(${qNum}-savol) Butunjahon gravitatsiya qonunini birinchi bo'lib qaysi buyuk olim kashf qilgan?`,
          o: ['Isaak Nyuton', 'Galileo Galiley', 'Albert Eynshteyn'],
          c: 0,
          e: 'Ser Isaak Nyuton 1687-yilda gravitatsiya qonunini e\'lon qilgan.'
        },
        {
          q: `(${qNum}-savol) Yer sathidagi erkin tushish tezlanishi g ning o'rtacha qiymati qancha?`,
          o: ['9.8 m/s²', '3.14 m/s²', '100 m/s²'],
          c: 0,
          e: 'Yer uchun o\'rtacha standart erkin tushish tezlanishi g ≈ 9.8 m/s².'
        }
      ];
      const sel = templates[idx % templates.length];
      return {
        id: qNum,
        question: sel.q,
        options: sel.o,
        correctIndex: sel.c,
        explanation: sel.e
      };
    }),
    passingScorePercent: 60,
    nextTopic: 'Arximed Qonuni va Suyuqliklar Gidrostatikasi',
    reviewExplanation: 'Gravitatsiya kuchi jism massalari ko\'paytmasiga to\'g\'ri, masofa kvadratiga teskari proportsional: F = G · (m1 · m2) / r².',
    strictFeedback: 'Diqqat! Masofa kvadratiga e\'tibor bermadingiz. F = G·m1·m2/r² formulasini qayta ko\'rib chiqing!',
    happyFeedback: 'Ajoyib! Siz Nyutonning teskari kvadratlar qonunini to\'g\'ri tushundingiz!'
  },
  'Kimyo': {
    topic: 'Kimyo: Mendeleyev Davriy Qonuni va Atom Tuzilishi',
    category: 'Anorganik Kimyo',
    subject: 'Kimyo',
    gradeLevel: '5-8',
    grade: 8,
    simpleExplanation: 'Mendeleyev davriy qonuniga ko\'ra, kimyoviy elementlarning xossalari ularning atom yadrosi zaryadiga (protonlar soniga) davriy ravishda bog\'liqdir. Tashqi elektron qobig\'idagi elektronlar soni elementning qanday reaksiyaga kirishishini belgilab beradi.',
    formulas: [
      'Protonlar soni (Z) = Tartib raqami = Elektronlar soni',
      'Massaviy son (A) = Protonlar (Z) + Neytronlar (N)',
      'Neytronlar soni: N = A - Z',
      'Valentlik: Tashqi qavatdagi toq elektronlar soni'
    ],
    exampleProblem: {
      problem: 'Uglerod (C) elementining tartib raqami 6, massaviy soni 12 ga teng. Yadrodagi proton va neytronlar sonini toping.',
      stepByStepSolution: '1-qadam: Tartib raqami Z = 6, demak protonlar soni = 6. 2-qadam: Neytronlar soni N = A - Z formulasi bilan topiladi: N = 12 - 6 = 6. Javob: 6 ta proton va 6 ta neytron mavjud.'
    },
    closingQuestion: MANDATORY_CLOSING_QUESTION,
    mermaidDiagram: `graph TD
    A[Atom Yadrosi: Protonlar Z] --> B[Davriy Jadvaldagi Tartib Raqami]
    B --> C[Elektron Qobiqlar Pog'onasi]
    C --> D[Valent Elektronlar]
    D --> E[Elementning Kimyoviy Xossalari]`,
    speechScript: 'Mendeleyev davriy qonuniga ko\'ra, elementlarning xossalari ularning yadro zaryadiga davriy bog\'liqdir. ' + MANDATORY_CLOSING_QUESTION,
    quizList: Array.from({ length: 20 }, (_, idx) => {
      const qNum = idx + 1;
      const templates = [
        {
          q: `(${qNum}-savol) Atomning kimyoviy xossalarini va uning davriy jadvaldagi o'rnini asosan nima belgilaydi?`,
          o: ['Yadrodagi protonlar soni (zaryad)', 'Moddaning rangi', 'Yadrodagi neytronlar soni'],
          c: 0,
          e: 'Elementning tartib raqami aynan uning yadro zaryadiga (protonlar soniga) teng.'
        },
        {
          q: `(${qNum}-savol) Davriy jadvalda guruh raqami odatda nimani ifodalaydi?`,
          o: ['Tashqi qobiqdagi valent elektronlar sonini', 'Yadro massasini', 'Davrlar sonini'],
          c: 0,
          e: 'Bosh guruhlarda guruh raqami tashqi valent elektronlar sonini ko\'rsatadi.'
        },
        {
          q: `(${qNum}-savol) Neytral atomda protonlar soni qaysi zarrachalar soniga teng bo'ladi?`,
          o: ['Elektronlar soniga', 'Neytronlar soniga', 'Molekulalar soniga'],
          c: 0,
          e: 'Atom elektr neytral bo\'lishi uchun musbat protonlar soni manfiy elektronlar soniga teng bo\'ladi.'
        },
        {
          q: `(${qNum}-savol) Suv molekulasida (H2O) nechta vodorod va kislorod atomi bor?`,
          o: ['2 ta vodorod va 1 ta kislorod', '1 ta vodorod va 2 ta kislorod', '2 ta vodorod va 2 ta kislorod'],
          c: 0,
          e: 'H2O formulasi 2 ta vodorod va 1 ta kislorod atomidan iborat.'
        }
      ];
      const sel = templates[idx % templates.length];
      return {
        id: qNum,
        question: sel.q,
        options: sel.o,
        correctIndex: sel.c,
        explanation: sel.e
      };
    }),
    passingScorePercent: 60,
    nextTopic: 'Kovalent va Ion Kimyoviy Bog\'lanishlar Turlari',
    reviewExplanation: 'Mendeleyev davriy qonunida asosiy tayanch — atom yadrosi zaryadi (protonlar soni) ekanligini yodda tuting.',
    strictFeedback: 'Diqqat qiling! Neytronlar izotoplarni hosil qiladi, elementning xossalarini esa yadro zaryadi belgilaydi!',
    happyFeedback: 'Juda to\'g\'ri! Yadro zaryadi davriy qonunning eng asosiy fundamentidir!'
  },
  'Tarix': {
    topic: 'Tarix: Amir Temur va Markazlashgan Davlat Boshqaruvi',
    category: 'O\'zbekiston Tarixi',
    subject: 'Tarix',
    gradeLevel: '5-8',
    grade: 7,
    simpleExplanation: 'Sohibqiron Amir Temur tarqoq feodal bekliklarni birlashtirib, qudratli markazlashgan davlat va qonun ustuvorligiga asoslangan adolat tizimini barpo etdi. Uning «Kuch — adolatdadir» shiori Buyuk Ipak yo\'lida xavfsizlik va Temuriylar Renessansiga yo\'l ochdi.',
    formulas: [
      'Bosh mezon: «Kuch — adolatdadir» (Rosti-rusti)',
      'Tuzuklar qonuni: Davlat boshqaruvi 12 toifa vakillariga tayangan',
      'Savdo yo\'li: Sharq va G\'arbni bog\'lovchi Buyuk Ipak Yo\'li himoyasi',
      'Poytaxt: Samarqand — jahon ilm-fani va me\'morchilik markazi'
    ],
    exampleProblem: {
      problem: 'Amir Temur davlat boshqaruvida nima sababdan «Kuch — adolatdadir» tamoyilini bosh mezon qilib belgilagan?',
      stepByStepSolution: '1-qadam: Tarqoqlik davrida qonunsizlik avj olgan edi. 2-qadam: Sohibqiron davlat faqat kuchli armiya bilan emas, eng avvalo xalqqa adolat ko\'rsatish bilan mustahkam bo\'lishini anglagan. 3-qadam: Shu bois adolat tamoyili davlatning muhriga zarb etilgan.'
    },
    closingQuestion: MANDATORY_CLOSING_QUESTION,
    mermaidDiagram: `graph TD
    A[Tarqoq bekliklar birlashuvi] --> B[Markazlashgan Quvvatli Davlat]
    B --> C[Temur Tuzuklari: Adolat va Qonun]
    C --> D[Buyuk Ipak Yo'li Xavfsizligi]
    D --> E[Ilm-fan va Temuriylar Renessansi]`,
    speechScript: 'Amir Temur tarqoq bekliklarni birlashtirib, qudratli davlat va adolat tizimini yaratdi. ' + MANDATORY_CLOSING_QUESTION,
    quizList: Array.from({ length: 20 }, (_, idx) => {
      const qNum = idx + 1;
      const templates = [
        {
          q: `(${qNum}-savol) Amir Temur davlat boshqaruvida qaysi shiorni o'zining bosh strategik mezoni qilib olgan?`,
          o: ['Kuch — adolatdadir', 'Tinchlik — boylikdadir', 'G\'alaba — jasoratdadir'],
          c: 0,
          e: 'Amir Temurning davlat muhri va uzugida «Kuch — adolatdadir» (Rosti-rusti) so\'zlari yozilgan.'
        },
        {
          q: `(${qNum}-savol) Sohibqiron Amir Temurning saltanat boshqaruvi bo'yicha tuzgan qonunlar to'plami qanday nomlanadi?`,
          o: ['Temur tuzuklari', 'Boburnoma', 'Siyosatnoma'],
          c: 0,
          e: '«Temur tuzuklari» — davlatni boshqarish qonun-qoidalari aks etgan tarixiy asardir.'
        },
        {
          q: `(${qNum}-savol) Amir Temur davlatining poytaxti qaysi shahar bo'lgan?`,
          o: ['Samarqand', 'Buxoro', 'Kesh (Shahrisabz)'],
          c: 0,
          e: 'Amir Temur poytaxt sifatida Samarqand shahrini tanlagan va uni dunyo sayqaliga aylantirgan.'
        },
        {
          q: `(${qNum}-savol) Amir Temur qaysi yilda tug'ilgan?`,
          o: ['1336-yil 9-aprelda', '1340-yil 1-mayda', '1320-yil 15-martda'],
          c: 0,
          e: 'Sohibqiron Amir Temur 1336-yil 9-aprelda Kesh yaqinidagi Xoja Ilg\'or qishlog\'ida tug\'ilgan.'
        }
      ];
      const sel = templates[idx % templates.length];
      return {
        id: qNum,
        question: sel.q,
        options: sel.o,
        correctIndex: sel.c,
        explanation: sel.e
      };
    }),
    passingScorePercent: 60,
    nextTopic: 'Mirzo Ulug\'bek va Samarqand Astronomiya Maktabi',
    reviewExplanation: 'Sohibqiron Amir Temur 1336-yilda tug\'ilgan, Samarqandni poytaxt qilgan va davlat boshqaruvida «Kuch — adolatdadir» shioriga tayangan.',
    strictFeedback: 'Tarixiy manbalarni unutdingiz! Sohibqiron Amir Temurning bosh g\'oyasi aynan «Kuch — adolatdadir» bo\'lgan!',
    happyFeedback: 'Tasanno! Buyuk Sohibqironning o\'lmas adolat shiorini to\'g\'ri esladingiz!'
  },
  'Informatika/AI': {
    topic: 'Informatika: Sun\'iy Neyron Tarmoqlari',
    category: 'Sun\'iy Intellekt',
    subject: 'Informatika/AI',
    gradeLevel: '5-8',
    grade: 8,
    simpleExplanation: 'Sun\'iy neyron tarmoqlari — inson miyasi biologik neyronlari ishlash prinsipiga taqlid qiluvchi matematik hisoblash algoritmidir. Ular kiruvchi ma\'lumotlarni ko\'p qatlamli vaznlar va aktivatsiya funksiyalari orqali qayta ishlab, murakkab qonuniyatlarni mustaqil taniy oladi.',
    formulas: [
      'Neyron formulasi: y = f(∑(wᵢ · xᵢ) + b)',
      'xᵢ — kirish signallari, wᵢ — o\'rganiluvchi vaznlar, b — siljish (bias)',
      'Aktivatsiya funksiyasi: ReLU(x) = max(0, x)',
      'Xatolikni kamaytirish: Gradient Descent va Backpropagation'
    ],
    exampleProblem: {
      problem: 'Kirish qiymati x = 2, vazn w = 3, va bias b = 1 bo\'lsa, neyronga kiruvchi jami yig\'indini (z = w · x + b) hisoblang.',
      stepByStepSolution: '1-qadam: Formulaga qo\'yamiz: z = (3 · 2) + 1. 2-qadam: Ko\'paytiramiz: 3 · 2 = 6. 3-qadam: Biasni qo\'shamiz: 6 + 1 = 7. Natija z = 7.'
    },
    closingQuestion: MANDATORY_CLOSING_QUESTION,
    mermaidDiagram: `graph LR
    A[Kirish Qatlami x] -->|Vaznlar W| B[Yashirin Qatlam Neyronlari]
    B -->|Aktivatsiya ReLU| C[Chiqish Qatlami y]
    C -->|Xatolik Hisobi| D[Backpropagation & Gradient]
    D -.->|Vaznlarni yangilash| B`,
    speechScript: 'Sun\'iy neyron tarmoqlari inson miyasi tuzilishiga taqlid qiluvchi algoritmlardir. Ular qatlamlar orqali ma\'lumotlarni tahlil qilib, xatolarni kamaytirish orqali mukammallashadi. ' + MANDATORY_CLOSING_QUESTION,
    quizList: Array.from({ length: 20 }, (_, idx) => {
      const qNum = idx + 1;
      const templates = [
        {
          q: `(${qNum}-savol) Neyron tarmog'ini o'qitishda chiqishdagi xatolikni orqaga tarqatib vaznlarni yangilash algoritmi qanday ataladi?`,
          o: ['Backpropagation (Orqaga tarqalish)', 'Overfitting (Qayta moslashish)', 'Data Augmentation'],
          c: 0,
          e: 'Backpropagation algoritmi xatolik gradientini hisoblab, tarmoqdagi barcha vaznlarni teskari tartibda aniq yangilaydi.'
        },
        {
          q: `(${qNum}-savol) Sun'iy neyronda w koeffitsienti nima deb ataladi?`,
          o: ['Vazn (Weight)', 'Piksel', 'Kesh'],
          c: 0,
          e: 'w (weight) — har bir kirish signalining ahamiyatini belgilovchi vazndir.'
        },
        {
          q: `(${qNum}-savol) Neyron tarmog'ida chiziqsiz bog'liqliklarni o'rganish uchun nima ishlatiladi?`,
          o: ['Aktivatsiya funksiyalari (masalan, ReLU)', 'Faqat qo\'shish amali', 'Doimiy nol'],
          c: 0,
          e: 'Aktivatsiya funksiyalari neyron tarmog\'iga murakkab chiziqsiz masalalarni yechish imkonini beradi.'
        },
        {
          q: `(${qNum}-savol) Ko'p qatlamli neyron tarmoqlar sohasi nima deb ataladi?`,
          o: ['Chuqur o\'rganish (Deep Learning)', 'Blokcheyn', 'Kompyuter grafikasi'],
          c: 0,
          e: 'Deep Learning — ko\'p qatlamli neyron tarmoqlari bilan ishlash sohasidir.'
        }
      ];
      const sel = templates[idx % templates.length];
      return {
        id: qNum,
        question: sel.q,
        options: sel.o,
        correctIndex: sel.c,
        explanation: sel.e
      };
    }),
    passingScorePercent: 60,
    nextTopic: 'Kompyuter Ko\'rishi va Konvolyutiv Neyron Tarmoqlari (CNN)',
    reviewExplanation: 'Neyron modelida y = f(w*x + b) formulasi, ReLU aktivatsiyasi va Backpropagation algoritmining mohiyatini qayta takrorlang.',
    strictFeedback: 'Xato! Overfitting bu xatolikni tarqatish emas, balki tarmoqning haddan tashqari yodlab olish kasalligidir!',
    happyFeedback: 'Mukammal! Siz mashinali o\'rganishning eng muhim ustuni bo\'lgan Backpropagation algoritmini to\'g\'ri tanladingiz!'
  }
};

const SUBJECT_CONFIGS: Record<SubjectType, {
  icon: string;
  defaultTopic: string;
  topics: string[];
}> = {
  'Informatika/AI': {
    icon: '💻',
    defaultTopic: 'Sun\'iy Neyron Tarmoqlari',
    topics: ['Sun\'iy Neyron Tarmoqlari', 'Python Dasturlash Asoslari', 'Algoritmlar va O(n) Murakkablik', 'Transformer Arxitekturasi']
  },
  'Matematika': {
    icon: '📐',
    defaultTopic: 'Pifagor Teoremasi va Geometriya',
    topics: ['Pifagor Teoremasi', 'Kvadrat Tenglamalar va Diskriminant', 'Trigonometrik Funksiyalar', 'Hosilalar va Limitlar']
  },
  'Fizika': {
    icon: '⚡',
    defaultTopic: 'Butunjahon Gravitatsiya Qonuni',
    topics: ['Butunjahon Gravitatsiya Qonuni', 'Nyuton Dinamika Qonunlari', 'Om Qonuni va Elektr Zanjirlari', 'Kvant Mexanikasi Asoslari']
  },
  'Kimyo': {
    icon: '🧪',
    defaultTopic: 'Mendeleyev Davriy Qonuni va Atom Tuzilishi',
    topics: ['Mendeleyev Davriy Jadvali', 'Kovalent va Ion Bog\'lanish', 'Oksidlanish-Qaytarilish Reaksiyalari', 'Organik Kimyo va Uglevodorodlar']
  },
  'Tarix': {
    icon: '🏛️',
    defaultTopic: 'Amir Temur va Markazlashgan Davlat Boshqaruvi',
    topics: ['Amir Temur Saltanati', 'Qadimgi Baqtriya va So\'g\'diyona', 'Buyuk Ipak Yo\'li Madaniyati', 'Jadidlar Harakati va Ma\'rifat']
  },
  'Ingliz Tili': {
    icon: '🇬🇧',
    defaultTopic: 'Present Perfect Tense va Natijaviylik',
    topics: ['Present Perfect Tense', 'First Conditional Shart Gaplari', 'Passive Voice (Majhul Nisbat)', 'IELTS Lug\'at va Idiomalar']
  }
};

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Ingliz Tili');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('5-8');
  const [gradeNumber, setGradeNumber] = useState<number>(7);
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonData>(DEFAULT_SUBJECT_LESSONS['Ingliz Tili']);

  // Quiz state machine
  // 'ready_check' -> user reads explanation & sees mandatory question
  // 'in_progress' -> answering questions one by one
  // 'completed' -> score >= 60% unlocks next topic, < 60% triggers strict review
  const [quizMode, setQuizMode] = useState<'ready_check' | 'in_progress' | 'completed'>('ready_check');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<{ selected: number; isCorrect: boolean }>>([]);
  const [score, setScore] = useState(0);

  // Audio & Voice Engine States
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('jasur');
  const [audioEngine, setAudioEngine] = useState<AudioEngine>('google_natural');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('idle');
  const [avatarSpeechText, setAvatarSpeechText] = useState("Assalomu alaykum! Men sizning AI O'qituvchingizman. Darsni boshlashga tayyormisiz?");

  // UI helpers
  const [showRawCode, setShowRawCode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const mermaidRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const quizSectionRef = useRef<HTMLDivElement>(null);
  const explanationSectionRef = useRef<HTMLDivElement>(null);

  // Adjust grade number when grade level changes and dynamically adapt quiz count
  const handleGradeLevelChange = (lvl: GradeLevel) => {
    setGradeLevel(lvl);
    const newGradeNum = lvl === '1-4' ? 3 : lvl === '5-8' ? 7 : 10;
    setGradeNumber(newGradeNum);
    const targetCount = lvl === '1-4' ? 10 : lvl === '5-8' ? 20 : 30;
    const baseLesson = DEFAULT_SUBJECT_LESSONS[selectedSubject] || DEFAULT_SUBJECT_LESSONS['Ingliz Tili'];
    setLesson(prev => ({
      ...prev,
      gradeLevel: lvl,
      grade: newGradeNum,
      quizList: (baseLesson.quizList || []).slice(0, targetCount),
      formulas: Array.isArray(prev.formulas) ? prev.formulas : (baseLesson.formulas || [])
    }));
    setQuizMode('ready_check');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
  };

  // Re-render Mermaid whenever diagram changes
  useEffect(() => {
    if (mermaidRef.current && lesson?.mermaidDiagram) {
      mermaidRef.current.removeAttribute('data-processed');
      try {
        mermaid.contentLoaded();
      } catch (err) {
        console.warn('Mermaid render issue:', err);
      }
    }
  }, [lesson?.mermaidDiagram]);

  // When subject changes, set initial isolated default for that subject
  const handleSelectSubject = (subj: SubjectType) => {
    setSelectedSubject(subj);
    stopPlayback();
    setQuizMode('ready_check');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);

    const baseLesson = DEFAULT_SUBJECT_LESSONS[subj] || DEFAULT_SUBJECT_LESSONS['Ingliz Tili'];
    // Adapt question count to current gradeLevel
    const targetCount = gradeLevel === '1-4' ? 10 : gradeLevel === '5-8' ? 20 : 30;
    const adaptedQuizList = (baseLesson.quizList || []).slice(0, targetCount);
    
    const adaptedLesson: LessonData = {
      ...baseLesson,
      gradeLevel,
      grade: gradeNumber,
      quizList: adaptedQuizList,
      formulas: Array.isArray(baseLesson.formulas) ? baseLesson.formulas : []
    };

    setLesson(adaptedLesson);
    setTopicInput('');
    setAvatarMood('idle');
    setAvatarSpeechText(adaptedLesson.speechScript || adaptedLesson.simpleExplanation);
  };

  // Stop any active audio playback
  const stopPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAvatarMood('idle');
  };

  // Speak text with Background Latin -> Cyrillic Transliteration
  const speakLessonText = (customText?: string) => {
    stopPlayback();

    const textToSpeak = customText || lesson.speechScript || lesson.simpleExplanation;
    if (!textToSpeak) return;

    setIsSpeaking(true);
    setAvatarMood('speaking');
    setAvatarSpeechText(textToSpeak);

    if (audioEngine === 'google_natural') {
      try {
        const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}`;
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.playbackRate = speechRate;
        audio.volume = speechVolume;

        audio.onended = () => {
          setIsSpeaking(false);
          setAvatarMood('idle');
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          console.warn('Google TTS failed, falling back to Web Speech API');
          fallbackWebSpeech(textToSpeak);
        };

        audio.play().catch(() => {
          fallbackWebSpeech(textToSpeak);
        });
      } catch {
        fallbackWebSpeech(textToSpeak);
      }
    } else {
      fallbackWebSpeech(textToSpeak);
    }
  };

  // Web Speech API with background Cyrillic conversion for Uzbek
  const fallbackWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setAvatarMood('idle');
      return;
    }

    const cyrillicText = latinToCyrillicUzbek(text);
    const utterance = new SpeechSynthesisUtterance(cyrillicText);
    utterance.lang = 'uz-UZ';
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = speechVolume;

    const voices = window.speechSynthesis.getVoices();
    const uzVoice = voices.find(v => v.lang.includes('uz')) || voices.find(v => v.lang.includes('ru'));
    if (uzVoice) {
      utterance.voice = uzVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarMood('idle');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setAvatarMood('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Generate Lesson with Server API
  const handleGenerate = async (customTopic?: string) => {
    const rawTopic = (customTopic || topicInput).trim();
    const effectiveTopic = rawTopic ? `${selectedSubject} - ${rawTopic}` : SUBJECT_CONFIGS[selectedSubject].defaultTopic;

    setLoading(true);
    stopPlayback();
    setQuizMode('ready_check');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          subject: selectedSubject,
          gradeLevel,
          grade: gradeNumber
        }),
      });

      if (!res.ok) throw new Error('API server error');
      const data: LessonData = await res.json();

      const fallback = DEFAULT_SUBJECT_LESSONS[selectedSubject] || DEFAULT_SUBJECT_LESSONS['Ingliz Tili'];
      const targetCount = gradeLevel === '1-4' ? 10 : gradeLevel === '5-8' ? 20 : 30;

      const safeData: LessonData = {
        ...data,
        gradeLevel,
        grade: gradeNumber,
        formulas: Array.isArray(data?.formulas) && data.formulas.length > 0
          ? data.formulas
          : (fallback.formulas || [
              "Asosiy qoidaga e'tibor bering",
              "Formulalarni to'g'ri qo'llang",
              "Natijalarni tekshiring"
            ]),
        exampleProblem: (data?.exampleProblem && typeof data.exampleProblem === 'object')
          ? {
              problem: data.exampleProblem.problem || "Namunaviy masala",
              stepByStepSolution: data.exampleProblem.stepByStepSolution || "Formulaga asosan bosqichma-bosqich yechiladi."
            }
          : fallback.exampleProblem,
        quizList: Array.isArray(data?.quizList) && data.quizList.length > 0
          ? data.quizList.map((q, idx) => ({
              id: q?.id || idx + 1,
              question: q?.question || `${data.topic || selectedSubject} bo'yicha ${idx + 1}-savol`,
              options: Array.isArray(q?.options) && q.options.length >= 2
                ? q.options
                : ['A varianti', 'B varianti', 'C varianti'],
              correctIndex: typeof q?.correctIndex === 'number' ? q.correctIndex : 0,
              explanation: q?.explanation || "Mavzuga oid formulalar orqali aniqlanadi."
            }))
          : (fallback.quizList || []).slice(0, targetCount)
      };

      setLesson(safeData);
      setAvatarMood('speaking');
      setAvatarSpeechText(safeData.speechScript || safeData.simpleExplanation);

      // Play introductory lecture audio
      setTimeout(() => {
        speakLessonText(safeData.speechScript || safeData.simpleExplanation);
      }, 500);
    } catch (e) {
      console.warn('API fallback to subject-isolated default', e);
      const fallback = DEFAULT_SUBJECT_LESSONS[selectedSubject] || DEFAULT_SUBJECT_LESSONS['Ingliz Tili'];
      const targetCount = gradeLevel === '1-4' ? 10 : gradeLevel === '5-8' ? 20 : 30;
      setLesson({
        ...fallback,
        gradeLevel,
        grade: gradeNumber,
        quizList: (fallback.quizList || []).slice(0, targetCount),
        formulas: fallback.formulas || []
      });
      setAvatarSpeechText(fallback.speechScript || fallback.simpleExplanation);
    } finally {
      setLoading(false);
    }
  };

  // Safe quiz getters
  const activeQuizList = Array.isArray(lesson?.quizList) ? lesson.quizList : [];
  const totalQuestions = activeQuizList.length;
  const currentQ = activeQuizList[currentQuestionIndex] || activeQuizList[0] || {
    id: 1,
    question: "Mavzu bo'yicha savol yuklanmoqda...",
    options: ["Variant A", "Variant B", "Variant C"],
    correctIndex: 0,
    explanation: "Dars materiallariga tayaniladi."
  };

  // Agree to test
  const handleStartQuiz = () => {
    stopPlayback();
    setQuizMode('in_progress');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setAvatarMood('idle');
    const startMsg = `Dars bo'yicha ${totalQuestions} ta test savoli boshlandi. Diqqat bilan javob bering!`;
    setAvatarSpeechText(startMsg);
    
    if (quizSectionRef.current) {
      quizSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // "Tushunmadim, qayta tushuntiring" action
  const handleReviewExplanation = () => {
    stopPlayback();
    setAvatarMood('speaking');
    const reviewMsg = `Hech qisi yo'q! Keling, ${selectedSubject} bo'yicha qoidalarni va namunaviy masalani qaytadan ko'rib chiqamiz.`;
    setAvatarSpeechText(reviewMsg);
    
    if (explanationSectionRef.current) {
      explanationSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    speakLessonText(`${lesson?.simpleExplanation || ''} ${lesson?.exampleProblem?.problem || ''} ${lesson?.exampleProblem?.stepByStepSolution || ''}`);
  };

  // Select option in active quiz
  const handleSelectQuizOption = (optIdx: number) => {
    if (selectedOption !== null) return; // already answered this question
    setSelectedOption(optIdx);

    const isCorrect = optIdx === currentQ.correctIndex;
    const newAnswers = [...userAnswers, { selected: optIdx, isCorrect }];
    setUserAnswers(newAnswers);

    if (isCorrect) {
      setScore(prev => prev + 100);
      setAvatarMood('happy');
      const happyMsg = "✅ A'lo! To'g'ri javobni tanladingiz!";
      setAvatarSpeechText(happyMsg);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#a855f7']
      });
    } else {
      setAvatarMood('strict');
      const strictMsg = "⚠️ Xatolik! Tushuntirishga diqqat bilan qarang!";
      setAvatarSpeechText(strictMsg);
    }
  };

  // Move to next question or complete quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setAvatarMood('idle');
    } else {
      // Quiz finished! Calculate passing grade
      setQuizMode('completed');
      const correctTotal = userAnswers.filter(a => a.isCorrect).length;
      const percent = Math.round((correctTotal / totalQuestions) * 100);

      if (percent >= 60) {
        setAvatarMood('happy');
        const passMsg = `🎉 Tabriklaymiz! Siz ${percent}% natija bilan testdan muvaffaqiyatli o'tdingiz. Keyingi mavzuga o'tishimiz mumkin!`;
        setAvatarSpeechText(passMsg);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#a855f7']
        });
        setTimeout(() => speakLessonText(passMsg), 400);
      } else {
        setAvatarMood('strict');
        const failMsg = `⚠️ Natijangiz ${percent}%. Bu 60% lik o'tish balidan past. Mavzuning tushunarsiz qismlarini qayta o'rganishingiz zarur!`;
        setAvatarSpeechText(failMsg);
        setTimeout(() => speakLessonText(failMsg), 400);
      }
    }
  };

  // Retake quiz
  const handleRetakeQuiz = () => {
    stopPlayback();
    setQuizMode('in_progress');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setAvatarMood('idle');
    setAvatarSpeechText("Testni qayta topshirish boshlandi. Bu safar yanada e'tiborli bo'ling!");
  };

  // Advance to next topic
  const handleAdvanceToNextTopic = () => {
    if (lesson.nextTopic) {
      setTopicInput(lesson.nextTopic);
      handleGenerate(lesson.nextTopic);
    }
  };

  const correctAnswersCount = userAnswers.filter(a => a.isCorrect).length;
  const currentPercentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
  const isPassing = currentPercentage >= 60;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 cyber-grid flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* TOP BAR: Brand | Diqqat Bali | Sinf Cheklovi */}
      <header className="border-b border-cyan-500/15 bg-[#070a12]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Cpu className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                OmniCore AI — Adaptive School AI Teacher
              </span>
              <span className="text-[10px] text-cyan-400 font-mono hidden sm:inline">
                Maktab o'quvchilari uchun interaktiv repetitor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Grade tier badge */}
            <div className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>{gradeNumber}-sinf ({gradeLevel === '1-4' ? '10 ta savol' : gradeLevel === '5-8' ? '20 ta savol' : '30 ta savol'})</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Ball:</span>
              <span className="font-bold text-white text-sm tabular-nums">{score}</span>
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Single-File</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6 w-full">

        {/* 1. SINF VA FANLARNI TANLASH PANEL (GRADE & SUBJECT CONTROLS) */}
        <section className="cyber-card rounded-2xl p-5 relative overflow-hidden space-y-4">
          
          {/* SINF TANLOVI (GRADE LEVEL TIER - 1-4, 5-8, 9-11) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  1. O'quvchi Sinfiga Qarab Moslashuvchanlik
                </h2>
                <p className="text-[11px] text-slate-400">
                  Sinfga qarab test savollari soni avtomatik cheklanadi (10, 20 yoki 30 ta)
                </p>
              </div>
            </div>

            {/* Grade Tier Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGradeLevelChange('1-4')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  gradeLevel === '1-4'
                    ? 'bg-purple-950/90 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50'
                    : 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🎒 1-4 Sinf</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Max 10 savol
                </span>
              </button>

              <button
                onClick={() => handleGradeLevelChange('5-8')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  gradeLevel === '5-8'
                    ? 'bg-purple-950/90 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50'
                    : 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>📚 5-8 Sinf</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Max 20 savol
                </span>
              </button>

              <button
                onClick={() => handleGradeLevelChange('9-11')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  gradeLevel === '9-11'
                    ? 'bg-purple-950/90 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50'
                    : 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🎓 9-11 Sinf</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Max 30 savol
                </span>
              </button>

              {/* Specific Grade Number Picker */}
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-700">
                <span className="text-xs text-slate-400">Aniq sinf:</span>
                <select
                  value={gradeNumber}
                  onChange={(e) => setGradeNumber(Number(e.target.value))}
                  className="bg-[#0a0f1d] border border-cyan-500/40 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  {gradeLevel === '1-4' && [1, 2, 3, 4].map(g => <option key={g} value={g}>{g}-sinf</option>)}
                  {gradeLevel === '5-8' && [5, 6, 7, 8].map(g => <option key={g} value={g}>{g}-sinf</option>)}
                  {gradeLevel === '9-11' && [9, 10, 11].map(g => <option key={g} value={g}>{g}-sinf</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* FANLAR RO'YXATI (STRICT SUBJECT SELECTION) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                2. Fan Tanlovi (Qat'iy cheklov — faqat tanlangan fanga mos mavzular):
              </span>
              <span className="text-[11px] font-mono text-cyan-300">
                Faol fan: <strong>{selectedSubject}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(Object.keys(SUBJECT_CONFIGS) as SubjectType[]).map((subj) => {
                const cfg = SUBJECT_CONFIGS[subj];
                const isSelected = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    onClick={() => handleSelectSubject(subj)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? `bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50 scale-[1.02]`
                        : `bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white`
                    }`}
                  >
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="whitespace-nowrap">{subj}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* 2. AVATAR & TOPIC GENERATOR HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 5 COLS: INTERACTIVE AI AVATAR */}
          <section className="lg:col-span-5 cyber-card-purple rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  AI O'qituvchi Mimikalari (GoPrep.gg Style)
                </h2>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                avatarMood === 'strict'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : avatarMood === 'happy'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : avatarMood === 'speaking'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                {avatarMood === 'strict' && '⚠️ QATTIQ / JIDDIY'}
                {avatarMood === 'happy' && '✨ TABASSUM / OFARIN'}
                {avatarMood === 'speaking' && '🗣️ TUSHUNTIRMOQDA'}
                {avatarMood === 'idle' && '🧘 TAYYOR'}
              </span>
            </div>

            {/* Speech bubble */}
            <div className={`w-full mb-3 p-3 rounded-xl border text-xs font-medium transition-all duration-300 leading-relaxed shadow-lg ${
              avatarMood === 'strict'
                ? 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                : avatarMood === 'happy'
                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                : avatarMood === 'speaking'
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100 ring-1 ring-cyan-500/30'
                : 'bg-[#0a0f1d] border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">
                  {voicePersona === 'jasur' ? '👨' : '👩'}
                </span>
                <div>
                  <span className="font-bold text-[10px] block opacity-75">
                    {voicePersona === 'jasur' ? 'Ustoz Jasur:' : 'Ustoz Malika:'}
                  </span>
                  <p className="line-clamp-3">{avatarSpeechText}</p>
                </div>
              </div>
            </div>

            {/* SVG Avatar with Expressive Eyebrows & Mouth */}
            <div className="flex flex-col items-center">
              <div className={`relative w-44 h-44 rounded-full flex items-center justify-center p-3 transition-all duration-500 ${
                avatarMood === 'strict'
                  ? 'bg-gradient-to-b from-rose-950/80 via-red-900/40 to-[#070a12] ring-4 ring-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
                  : avatarMood === 'happy'
                  ? 'bg-gradient-to-b from-emerald-950/80 via-teal-900/40 to-[#070a12] ring-4 ring-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.4)]'
                  : avatarMood === 'speaking'
                  ? 'bg-gradient-to-b from-cyan-950/80 via-blue-900/40 to-[#070a12] ring-4 ring-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.4)] animate-pulse'
                  : 'bg-gradient-to-b from-slate-900 to-[#070a12] ring-2 ring-slate-700'
              }`}>
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                  {/* Cyber aura & background rings */}
                  <circle cx="100" cy="100" r="92" fill="none" stroke={avatarMood === 'strict' ? '#f43f5e' : avatarMood === 'happy' ? '#10b981' : '#06b6d4'} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" className="animate-spin-slow" />
                  
                  {/* Head base */}
                  <rect x="55" y="45" width="90" height="110" rx="45" fill="#0d1424" stroke="#1e293b" strokeWidth="2" />
                  <path d="M 60 85 Q 100 65 140 85" fill="none" stroke="#334155" strokeWidth="1.5" />

                  {/* Expressive Eyebrows (GoPrep.gg Style) */}
                  {avatarMood === 'strict' ? (
                    // V-shaped strict/angry furrowed eyebrows
                    <g stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round">
                      <line x1="68" y1="78" x2="94" y2="90" />
                      <line x1="132" y1="78" x2="106" y2="90" />
                    </g>
                  ) : avatarMood === 'happy' ? (
                    // Curved high cheerful eyebrows
                    <g stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round">
                      <path d="M 68 76 Q 81 68 94 76" />
                      <path d="M 106 76 Q 119 68 132 76" />
                    </g>
                  ) : (
                    // Neutral / explaining eyebrows
                    <g stroke="#06b6d4" strokeWidth="3" fill="none" strokeLinecap="round">
                      <path d="M 68 79 Q 81 74 94 79" />
                      <path d="M 106 79 Q 119 74 132 79" />
                    </g>
                  )}

                  {/* Cyber Visor Eyes */}
                  <rect x="66" y="88" width="68" height="24" rx="12" fill="#050811" stroke={avatarMood === 'strict' ? '#e11d48' : avatarMood === 'happy' ? '#059669' : '#0284c7'} strokeWidth="1.5" />
                  
                  {/* Left & Right Pupils / Glow */}
                  {avatarMood === 'strict' ? (
                    <g fill="#f43f5e">
                      <circle cx="82" cy="100" r="4.5" />
                      <circle cx="118" cy="100" r="4.5" />
                    </g>
                  ) : avatarMood === 'happy' ? (
                    <g fill="#10b981">
                      <path d="M 76 102 Q 82 96 88 102" stroke="#10b981" strokeWidth="3" fill="none" />
                      <path d="M 112 102 Q 118 96 124 102" stroke="#10b981" strokeWidth="3" fill="none" />
                    </g>
                  ) : (
                    <g fill="#06b6d4">
                      <circle cx="83" cy="100" r="4" />
                      <circle cx="117" cy="100" r="4" />
                    </g>
                  )}

                  {/* Nose indicator */}
                  <line x1="100" y1="114" x2="100" y2="120" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Expressive Mouth (Speaking Bounce / Smile / Strict Frown) */}
                  {avatarMood === 'strict' ? (
                    // Downward strict grimace
                    <path d="M 82 138 Q 100 130 118 138" fill="none" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
                  ) : avatarMood === 'happy' ? (
                    // Big smiling warm curve
                    <path d="M 80 132 Q 100 148 120 132" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
                  ) : isSpeaking ? (
                    // Speaking animated mouth oval
                    <ellipse cx="100" cy="135" rx="12" ry="7" fill="#0891b2" stroke="#22d3ee" strokeWidth="2" className="animate-pulse" />
                  ) : (
                    // Calm neutral smile
                    <path d="M 86 135 Q 100 140 114 135" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                  )}
                </svg>
              </div>

              {/* Persona selector tabs */}
              <div className="flex items-center gap-2 mt-3 w-full">
                <button
                  onClick={() => setVoicePersona('jasur')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    voicePersona === 'jasur'
                      ? 'bg-cyan-950 border-cyan-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>👨 Ustoz Jasur</span>
                </button>
                <button
                  onClick={() => setVoicePersona('malika')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    voicePersona === 'malika'
                      ? 'bg-purple-950 border-purple-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>👩 Ustoz Malika</span>
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT 7 COLS: TOPIC INPUT & LECTURE GENERATION */}
          <section className="lg:col-span-7 space-y-4">
            
            {/* Input Card */}
            <div className="cyber-card rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                    Mavzu Kiritish & AI Leksiyani Boshlash
                  </h2>
                </div>
                <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  {selectedSubject} ({gradeNumber}-sinf)
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder={`Masalan: ${SUBJECT_CONFIGS[selectedSubject]?.defaultTopic || 'Mavzuni kiriting'}`}
                    className="flex-1 bg-[#0a0f1d] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dars Tayyorlanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ Darsni Tushuntirish</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Subject Topics Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="text-slate-400 text-[11px]">Tavsiya mavzular:</span>
                  {(SUBJECT_CONFIGS[selectedSubject]?.topics || []).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTopicInput(t);
                        handleGenerate(t);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[11px] transition cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* NATURAL UZBEK TTS CONTROLS */}
            <div className="cyber-card-purple rounded-2xl p-4 relative space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white uppercase tracking-wide">
                    Natural Uzbek Audio (Lotin UI + Fon Kirill TTS)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (isSpeaking ? stopPlayback() : speakLessonText())}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isSpeaking ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>{isSpeaking ? "To'xtatish" : "Ovozli O'qish"}</span>
                  </button>
                </div>
              </div>

              {/* Sliders: Speed, Pitch, Volume */}
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Tezlik:</span>
                    <span className="font-mono text-cyan-300">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.6"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Ohang:</span>
                    <span className="font-mono text-purple-300">{speechPitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Balandlik:</span>
                    <span className="font-mono text-emerald-300">{Math.round(speechVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    value={speechVolume}
                    onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1"
                  />
                </div>
              </div>
            </div>

          </section>

        </div>

        {/* 3. MAVZU TUSHUNTIRISH (DONA-DONA NAZARIYA, FORMULALAR VA NAMUNAVIY MASALA) */}
        <section ref={explanationSectionRef} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 7 COLS: EXPLANATION, FORMULAS & EXAMPLE PROBLEM */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* NAZARIY TUSHUNTIRISH */}
              <div className="cyber-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                      📖 Nazariy Tushuntirish: {lesson.topic}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    Lotin Alifbosi
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#090e1c] border border-cyan-500/20 text-slate-100 text-sm sm:text-base leading-relaxed">
                  {lesson.simpleExplanation}
                </div>
              </div>

              {/* FORMULALAR VA ASOSIY QOIDALAR */}
              <div className="cyber-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                      📐 Asosiy Formulalar va Qoidalar
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {(Array.isArray(lesson?.formulas) ? lesson.formulas : []).map((formula, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800 text-xs sm:text-sm font-mono text-cyan-300 flex items-start gap-2.5">
                      <span className="text-purple-400 font-bold shrink-0">{idx + 1}.</span>
                      <span className="text-slate-200">{formula}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NAMUNAVIY MASALA VA YECHIMI (STEP-BY-STEP SOLUTION) */}
              <div className="cyber-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                      💡 Namunaviy Masala va Bosqichma-bosqich Yechim
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs sm:text-sm">
                    <span className="font-bold text-yellow-300 block mb-1">Masala sharti:</span>
                    <p className="text-slate-200">{lesson?.exampleProblem?.problem || "Namunaviy topshiriq tayyorlanmoqda..."}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs sm:text-sm">
                    <span className="font-bold text-emerald-300 block mb-1">Dona-dona yechimi:</span>
                    <p className="text-emerald-100 font-mono text-xs leading-relaxed">
                      {lesson?.exampleProblem?.stepByStepSolution || "Formulaga tayanib bosqichma-bosqich yechiladi."}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT 5 COLS: MERMAID DIAGRAM & MANDATORY TRANSITION PROMPT */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* MERMAID DIAGRAM */}
              <div className="cyber-card rounded-2xl p-5 relative">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                      📊 Mavzuning Oqim Sxemasi
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Mermaid.js</span>
                </div>

                <div className="rounded-xl bg-[#090e1c] border border-cyan-500/20 p-4 overflow-x-auto min-h-[180px] flex items-center justify-center">
                  <div ref={mermaidRef} className="mermaid w-full text-center">
                    {lesson.mermaidDiagram}
                  </div>
                </div>
              </div>

              {/* MANDATORY CLOSING QUESTION & INTERACTIVE CONSENT PROMPT */}
              <div className="cyber-card-purple rounded-2xl p-5 relative border-2 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/30">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    O'qituvchining O'zlashtirish So'rovi
                  </span>
                </div>

                {/* THE MANDATORY PHRASE EXACTLY AS REQUIRED */}
                <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-400/50 mb-4 text-xs sm:text-sm text-purple-100 font-semibold leading-relaxed">
                  «{MANDATORY_CLOSING_QUESTION}»
                </div>

                {/* Interactive Consent Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleStartQuiz}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ha, savol-javobni boshlaymiz! ({lesson.quizList.length} ta test)</span>
                  </button>

                  <button
                    onClick={handleReviewExplanation}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tushunmadim, qayta tushuntiring</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* 4. ADAPTIVE TEST RUNNER (SINF CHEKLOVIGA MOS: 10, 20 yoki 30 TA SAVOL & 60% O'TISH BALI) */}
        <section ref={quizSectionRef} id="kognitiv-test" className="cyber-card rounded-2xl p-6 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                  Adaptive Kognitiv Test ({gradeNumber}-sinf · {totalQuestions} ta savol)
                </h2>
                <span className="text-[11px] text-slate-400">
                  O'tish bali: kamida <strong>60%</strong> to'plansa yangi mavzuga ruxsat beriladi
                </span>
              </div>
            </div>

            {/* Progress indicator */}
            {quizMode === 'in_progress' && (
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-cyan-300">
                  Savol: <strong>{currentQuestionIndex + 1}</strong> / {totalQuestions}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-400">
                  To'g'ri: {correctAnswersCount}
                </span>
              </div>
            )}
          </div>

          {/* STATE 1: READY CHECK (WAITING FOR CONSENT) */}
          {quizMode === 'ready_check' && (
            <div className="py-8 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {gradeNumber}-sinf uchun {totalQuestions} ta test savoli tayyor
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Mavzuni to'liq o'zlashtirganingizga ishonchingiz komil bo'lgach, «Savol-javobni boshlash» tugmasini bosing.
                </p>
              </div>
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Savol-javobni Boshlash ({totalQuestions} ta savol)
              </button>
            </div>
          )}

          {/* STATE 2: IN PROGRESS (STEPPING THROUGH 10, 20, OR 30 QUESTIONS) */}
          {quizMode === 'in_progress' && currentQ && (
            <div className="space-y-5">
              
              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-xl bg-[#090e1c] border border-cyan-500/30">
                <div className="text-xs font-mono text-cyan-400 mb-1">
                  {currentQuestionIndex + 1}-SAVOL ({totalQuestions} tadan):
                </div>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* 3 Variant Options */}
              <div className="space-y-2.5">
                {(Array.isArray(currentQ?.options) ? currentQ.options : []).map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrectAnswer = idx === currentQ.correctIndex;

                  let btnStyle = "bg-[#0a0f1d] border-slate-800 hover:border-cyan-400 text-slate-200";
                  if (selectedOption !== null) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
                    } else if (isChosen) {
                      btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40";
                    } else {
                      btnStyle = "bg-[#0a0f1d] border-slate-900 text-slate-600 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="font-mono text-cyan-400 font-bold">
                          {String.fromCharCode(65 + idx)})
                        </span>
                        <span>{opt}</span>
                      </span>

                      {selectedOption !== null && isCorrectAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {selectedOption !== null && isChosen && !isCorrectAnswer && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate feedback after answer */}
              {selectedOption !== null && (
                <div className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 transition-all ${
                  selectedOption === currentQ.correctIndex
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
                    : 'border-rose-500/50 bg-rose-950/40 text-rose-200'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {selectedOption === currentQ.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>✅ To'g'ri javob! (+100 ball)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>❌ Noto'g'ri. To'g'ri variant: {String.fromCharCode(65 + (currentQ.correctIndex || 0))}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-mono opacity-80">
                      Hozirgi aniqlik: {userAnswers.length > 0 ? Math.round((userAnswers.filter(a => a.isCorrect).length / userAnswers.length) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentQuestionIndex < totalQuestions - 1 ? "Keyingi Savol" : "Natijani Ko'rish"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STATE 3: COMPLETED (SCORE CHECK: >= 60% PASS VS < 60% REVIEW) */}
          {quizMode === 'completed' && (
            <div className="py-6 space-y-6">
              
              <div className={`p-6 rounded-2xl border text-center space-y-4 ${
                isPassing
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/50 to-[#070a12]'
                  : 'border-rose-500/50 bg-gradient-to-b from-rose-950/50 to-[#070a12]'
              }`}>
                
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl ${
                  isPassing
                    ? 'bg-emerald-950 border border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                    : 'bg-rose-950 border border-rose-400 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                }`}>
                  {isPassing ? '🎉' : '⚠️'}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {isPassing ? "Tabriklaymiz! Mavzu Muvaffaqiyatli O'zlashtirildi!" : "Diqqat! O'tish Bali Yetarli Emas!"}
                  </h3>
                  <div className="flex items-center justify-center gap-3 mt-2 font-mono text-sm">
                    <span className="text-slate-300">To'plangan natija:</span>
                    <span className={`font-bold text-lg ${isPassing ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentPercentage}% ({correctAnswersCount} / {totalQuestions})
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">Cheklov: kamida 60%</span>
                  </div>
                </div>

                {/* Outcome Explanation */}
                {isPassing ? (
                  <p className="text-xs sm:text-sm text-emerald-200 max-w-lg mx-auto leading-relaxed">
                    Siz {lesson.subject} bo'yicha berilgan barcha asosiy tushunchalar va formulalarni chuqur o'zlashtirdingiz. Endi keyingi yangi mavzuga o'tishingiz mumkin!
                  </p>
                ) : (
                  <div className="max-w-xl mx-auto space-y-3 text-left">
                    <p className="text-xs sm:text-sm text-rose-200 leading-relaxed text-center">
                      Natijangiz 60% dan past bo'lganligi sababli yangi mavzuga o'tish qulflangan. Avval ushbu mavzuning tushunarsiz qismlarini qayta o'rganing!
                    </p>
                    <div className="p-3.5 rounded-xl bg-black/50 border border-rose-500/30 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-rose-400 block">Qayta takrorlanishi zarur bo'lgan qismlar:</span>
                      <p>{lesson.reviewExplanation}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {isPassing ? (
                    <button
                      onClick={handleAdvanceToNextTopic}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <span>🚀 Keyingi Mavzuga O'tish: {lesson.nextTopic}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleReviewExplanation}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Mavzuni Qayta O'rganish</span>
                      </button>

                      <button
                        onClick={handleRetakeQuiz}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Testni Qayta Topshirish</span>
                      </button>
                    </>
                  )}
                </div>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* SINGLE-FILE EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl max-w-xl w-full p-6 space-y-4 border border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Single-File HTML (voice_engine.html)
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Barcha funksiyalar — o'quvchi sinfiga mos savollar soni (10, 20, 30), majburiy tushuntirish va o'zlashtirish so'rovi, 60% o'tish bali va fon Kirill TTS — <code className="text-cyan-300 font-mono">public/voice_engine.html</code> fayliga jamlangan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="/voice_engine.html"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Single-File HTML ni Ochish / Yuklash</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/voice_engine.html');
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{codeCopied ? "Nusxalandi!" : "Havolani nusxalash"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-cyan-500/10 mt-12 py-5 bg-[#05070e] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-slate-400 font-medium">OmniCore AI Ecosystem · Adaptive AI Teacher</span>
          </div>
          <p className="font-mono text-slate-500 text-[11px]">
            1-4 sinf (10 savol) · 5-8 sinf (20 savol) · 9-11 sinf (30 savol) · 60% O'tish Bali
          </p>
          <div className="text-slate-400 text-[11px]">
            Holat: <span className="text-emerald-400 font-medium">● Moslashuvchan Ta'lim Faol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
