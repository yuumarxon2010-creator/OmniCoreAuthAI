import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Transliterate Uzbek Latin to Cyrillic for background TTS engines
export function latinToCyrillicUzbek(input: string): string {
  if (!input) return '';
  let text = input;

  text = text.replace(/O['ʻ‘`’]/g, 'Ў');
  text = text.replace(/o['ʻ‘`’]/g, 'ў');
  text = text.replace(/G['ʻ‘`’]/g, 'Ғ');
  text = text.replace(/g['ʻ‘`’]/g, 'ғ');

  text = text.replace(/SH/g, 'Ш');
  text = text.replace(/Sh/g, 'Ш');
  text = text.replace(/sh/g, 'ш');

  text = text.replace(/CH/g, 'Ч');
  text = text.replace(/Ch/g, 'Ч');
  text = text.replace(/ch/g, 'ч');

  text = text.replace(/YO/g, 'Ё');
  text = text.replace(/Yo/g, 'Ё');
  text = text.replace(/yo/g, 'ё');

  text = text.replace(/YU/g, 'Ю');
  text = text.replace(/Yu/g, 'Ю');
  text = text.replace(/yu/g, 'ю');

  text = text.replace(/YA/g, 'Я');
  text = text.replace(/Ya/g, 'Я');
  text = text.replace(/ya/g, 'я');

  text = text.replace(/TS/g, 'Ц');
  text = text.replace(/Ts/g, 'Ц');
  text = text.replace(/ts/g, 'ц');

  text = text.replace(/(^|[\s\p{P}])Ye/gu, '$1Е');
  text = text.replace(/(^|[\s\p{P}])ye/gu, '$1е');
  text = text.replace(/([AEIOUaeiouЎў])Ye/g, '$1Е');
  text = text.replace(/([AEIOUaeiouЎў])ye/g, '$1е');

  text = text.replace(/(^|[\s\p{P}])E/gu, '$1Э');
  text = text.replace(/(^|[\s\p{P}])e/gu, '$1э');

  const charMap: Record<string, string> = {
    'A': 'А', 'a': 'а', 'B': 'Б', 'b': 'б', 'D': 'Д', 'd': 'д',
    'E': 'Е', 'e': 'е', 'F': 'Ф', 'f': 'ф', 'G': 'Г', 'g': 'г',
    'H': 'Ҳ', 'h': 'ҳ', 'I': 'И', 'i': 'и', 'J': 'Ж', 'j': 'ж',
    'K': 'К', 'k': 'к', 'L': 'Л', 'l': 'л', 'M': 'М', 'm': 'м',
    'N': 'Н', 'n': 'н', 'O': 'О', 'o': 'о', 'P': 'П', 'p': 'п',
    'Q': 'Қ', 'q': 'қ', 'R': 'Р', 'r': 'р', 'S': 'С', 's': 'с',
    'T': 'Т', 't': 'т', 'U': 'У', 'u': 'у', 'V': 'В', 'v': 'в',
    'X': 'Х', 'x': 'х', 'Y': 'Й', 'y': 'й', 'Z': 'З', 'z': 'з',
    "'": 'ъ', "ʻ": 'ъ', "’": 'ъ', "‘": 'ъ', "`": 'ъ'
  };

  return text.split('').map(char => charMap[char] || char).join('');
}

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export type GradeLevel = '1-4' | '5-8' | '9-11';

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
  closingQuestion: string; // Majburiy: "Mavzuni o'zlashtirib bo'ldingizmi? Mavzuga oid savol-javoblar qilamizmi keyingi mavzuga o'tishimiz uchun?"
  mermaidDiagram: string;
  speechScript: string;
  quizList: QuizQuestion[];
  passingScorePercent: number; // 60
  nextTopic: string;
  reviewExplanation: string;
  strictFeedback: string;
  happyFeedback: string;
}

// Generate questions list matching user's grade limit:
// 1-4 sinf: 10 ta savol
// 5-8 sinf: 20 ta savol
// 9-11 sinf: 30 ta savol
function generateQuestionsForGrade(
  subject: string,
  topic: string,
  gradeLevel: GradeLevel,
  baseQuiz: { question: string; options: string[]; correctIndex: number; explanation: string }
): QuizQuestion[] {
  const targetCount = gradeLevel === '1-4' ? 10 : gradeLevel === '5-8' ? 20 : 30;
  const questions: QuizQuestion[] = [];

  // Seed question 1 from base quiz
  questions.push({
    id: 1,
    question: baseQuiz.question,
    options: baseQuiz.options,
    correctIndex: baseQuiz.correctIndex,
    explanation: baseQuiz.explanation
  });

  // Generate subsequent domain-specific questions to reach exact target count
  for (let i = 2; i <= targetCount; i++) {
    let qText = '';
    let opts: string[] = [];
    let correct = 0;
    let exp = '';

    if (subject === 'Ingliz Tili') {
      const qTypes = [
        {
          q: `(${i}-savol) «They have ______ to Tashkent.» Bo'sh o'ringa mos fe'l shaklini qo'ying:`,
          o: ['gone', 'went', 'go'],
          c: 0,
          e: 'Present Perfect zamonida fe\'lning 3-shakli (V3: gone) ishlatiladi.'
        },
        {
          q: `(${i}-savol) «If it rains tomorrow, we ______ at home.» Shart ergash gapini to'ldiring:`,
          o: ['will stay', 'stayed', 'would stay'],
          c: 0,
          e: 'First Conditional da bosh gapda «will + fe\'l» ishlatiladi.'
        },
        {
          q: `(${i}-savol) «The letter was ______ by my teacher.» Majhul nisbatni to'ldiring:`,
          o: ['written', 'wrote', 'write'],
          c: 0,
          e: 'Passive Voice da «was + V3 (written)» qo\'llaniladi.'
        },
        {
          q: `(${i}-savol) Ingliz tilida «He» va «She» olmoshlaridan so'ng qaysi yordamchi fe'l qo'yiladi?`,
          o: ['has / is / does', 'have / are / do', 'am / were'],
          c: 0,
          e: '3-shaxs birlik uchun «has», «is», «does» ishlatiladi.'
        }
      ];
      const sel = qTypes[(i - 2) % qTypes.length];
      qText = sel.q;
      opts = sel.o;
      correct = sel.c;
      exp = sel.e;
    } else if (subject === 'Matematika') {
      const numA = (i * 2) % 10 + 3;
      const numB = (i * 3) % 10 + 2;
      const qTypes = [
        {
          q: `(${i}-savol) To'g'ri to'rtburchakning bo'yi ${numA} sm, eni ${numB} sm bo'lsa, uning yuzi (S) necha sm²?`,
          o: [`${numA * numB} sm²`, `${(numA + numB) * 2} sm²`, `${numA * 2 + numB} sm²`],
          c: 0,
          e: `Yuz formulasi: S = a · b = ${numA} · ${numB} = ${numA * numB} sm².`
        },
        {
          q: `(${i}-savol) Pifagor teoremasiga ko'ra katetlar kvadrati yig'indisi nimaga teng?`,
          o: ['Gipotenuza kvadratiga (c²)', 'Perimetrga', 'Burchaklar yig\'indisiga'],
          c: 0,
          e: 'Pifagor qoidasi: a² + b² = c².'
        },
        {
          q: `(${i}-savol) ${numA}x = ${numA * 5} chiziqli tenglamaning ildizi (x) nechaga teng?`,
          o: ['5', '10', '1'],
          c: 0,
          e: `x = ${numA * 5} / ${numA} = 5.`
        }
      ];
      const sel = qTypes[(i - 2) % qTypes.length];
      qText = sel.q;
      opts = sel.o;
      correct = sel.c;
      exp = sel.e;
    } else if (subject === 'Fizika') {
      const qTypes = [
        {
          q: `(${i}-savol) Nyutonning 2-qonuniga binoan kuch (F) formulasi qaysi?`,
          o: ['F = m · a', 'F = m / a', 'F = m · v²'],
          c: 0,
          e: 'Nyutonning ikkinchi qonuni: Kuch jism massasi va tezlanishining ko\'paytmasiga teng.'
        },
        {
          q: `(${i}-savol) Yer sirtida erkin tushish tezlanishi (g) taxminan nechaga teng?`,
          o: ['9.8 m/s²', '3.14 m/s²', '100 m/s²'],
          c: 0,
          e: 'Yer sirtida o\'rtacha erkin tushish tezlanishi g ≈ 9.81 m/s².'
        },
        {
          q: `(${i}-savol) Butunjahon gravitatsiya qonunida masofa ortsa, tortishish kuchi qanday o'zgaradi?`,
          o: ['Masofa kvadratiga teskari kamayadi', 'Teng ortadi', 'O\'zgarmaydi'],
          c: 0,
          e: 'F ~ 1/r² bo\'lgani uchun masofa ortganda kuch tez kamayadi.'
        }
      ];
      const sel = qTypes[(i - 2) % qTypes.length];
      qText = sel.q;
      opts = sel.o;
      correct = sel.c;
      exp = sel.e;
    } else if (subject === 'Kimyo') {
      const qTypes = [
        {
          q: `(${i}-savol) Suvning kimyoviy formulasi qaysi javobda to'g'ri ko'rsatilgan?`,
          o: ['H2O', 'CO2', 'NaCl'],
          c: 0,
          e: 'Suv molekulasi ikkita vodorod va bitta kislorod atomidan iborat.'
        },
        {
          q: `(${i}-savol) Davriy sistemada elementning tartib raqami nimani bildiradi?`,
          o: ['Yadrodagi protonlar sonini', 'Neytronlar sonini', 'Element massasini'],
          c: 0,
          e: 'Tartib raqami yadro zaryadi ya\'ni protonlar soniga teng.'
        },
        {
          q: `(${i}-savol) Qaysi gaz nafas olish va yonish jarayoni uchun hayotiy zarur?`,
          o: ['Kislorod (O2)', 'Azot (N2)', 'Argon (Ar)'],
          c: 0,
          e: 'Kislorod tirik organizmlarning nafas olishi va moddalar yonishini ta\'minlaydi.'
        }
      ];
      const sel = qTypes[(i - 2) % qTypes.length];
      qText = sel.q;
      opts = sel.o;
      correct = sel.c;
      exp = sel.e;
    } else if (subject === 'Tarix') {
      const qTypes = [
        {
          q: `(${i}-savol) Amir Temur davlatining poytaxti qaysi shahar bo'lgan?`,
          o: ['Samarqand', 'Buxoro', 'Toshkent'],
          c: 0,
          e: 'Sohibqiron Amir Temur Samarqand shahrini saltanat poytaxtiga aylantirgan.'
        },
        {
          q: `(${i}-savol) Buyuk Ipak yo'lining asosiy maqsadi nima bo'lgan?`,
          o: ['Sharq va G\'arb o\'rtasida savdo va madaniy aloqa', 'Faqat urush olib borish', 'Xorazm dengizini o\'rganish'],
          c: 0,
          e: 'Buyuk Ipak yo\'li qit\'alararo savdo, elchilik va madaniy almashinuv yo\'li bo\'lgan.'
        },
        {
          q: `(${i}-savol) «Kuch — adolatdadir» shiori kimga tegishli?`,
          o: ['Amir Temurga', 'Mirzo Ulug\'bekka', 'Zahiriddin Boburga'],
          c: 0,
          e: 'Bu shior Amir Temur davlat muhrida bitilgan asosiy qonun tamoyilidir.'
        }
      ];
      const sel = qTypes[(i - 2) % qTypes.length];
      qText = sel.q;
      opts = sel.o;
      correct = sel.c;
      exp = sel.e;
    } else {
      // Informatika/AI
      const qTypes = [
        {
          q: `(${i}-savol) Kompyuterning bosh miyasi hisoblangan qurilma nima?`,
          o: ['Protsessor (CPU)', 'Monitor', 'Klaviatura'],
          c: 0,
          e: 'CPU barcha hisoblash va mantiqiy amallarni bajaradi.'
        },
        {
          q: `(${i}-savol) Sun'iy neyron tarmoqlarining asosiy vazifasi nima?`,
          o: ['Ma\'lumotlardan qonuniyatlarni mustaqil o\'rganish', 'Faqat matn chop etish', 'Elektr energiyasini o\'chirish'],
          c: 0,
          e: 'Neyron tarmoqlar katta hajmdagi ma\'lumotlarni tahlil qilib o\'rganadi.'
        },
        {
          q: `(${i}-savol) Blokcheyn texnologiyasida ma'lumotlar nimalarda saqlanadi?`,
          o: ['Kriptografik bog\'langan bloklarda', 'Oddiy Word hujjatida', 'Qog\'oz papkalarda'],
          c: 0,
          e: 'Blokcheyn bloklarning xesh kodlari orqali uzilmas zanjir hosil qiladi.'
        }
      ];
      const sel = qTypes[(i - 2) % qTypes.length];
      qText = sel.q;
      opts = sel.o;
      correct = sel.c;
      exp = sel.e;
    }

    questions.push({
      id: i,
      question: qText,
      options: opts,
      correctIndex: correct,
      explanation: exp
    });
  }

  return questions;
}

// Adaptive Syllabus: Topics sequence per subject and grade
export const SYLLABUS_SEQUENCE: Record<string, Record<GradeLevel, string[]>> = {
  'Ingliz Tili': {
    '1-4': ['Ingliz Tili: Alifbo va Oddiy So\'zlar', 'Ingliz Tili: Ranglar va Sonlar', 'Ingliz Tili: To Be Fe\'li (am, is, are)', 'Ingliz Tili: Kundalik Salomlashuv'],
    '5-8': ['Ingliz Tili: Present Simple Tense', 'Ingliz Tili: Past Simple va Noto\'g\'ri Fe\'llar', 'Ingliz Tili: Present Continuous', 'Ingliz Tili: Sifat Darajalari'],
    '9-11': ['Ingliz Tili: Present Perfect Tense va Natijaviylik', 'Ingliz Tili: Second Conditional', 'Ingliz Tili: Passive Voice (Majhul Nisbat)', 'Ingliz Tili: Complex Object va Gerund']
  },
  'Matematika': {
    '1-4': ['Matematika: Qo\'shish va Ayirish Amallari', 'Matematika: Ko\'paytirish Jadvali', 'Matematika: Geometrik Shakllar (Kvadrat, Doira)', 'Matematika: Oddiy Masalalar'],
    '5-8': ['Matematika: Oddiy va O\'nli Kasrlar', 'Matematika: Pifagor Teoremasi va Geometriya', 'Matematika: Bir Noma\'lumli Tenglamalar', 'Matematika: Foizlar va Proportsiya'],
    '9-11': ['Matematika: Kvadrat Tenglamalar va Viyet Teoremasi', 'Matematika: Trigonometriya Asoslari', 'Matematika: Hosila va Funksiyalar Tekshiruvi', 'Matematika: Ehtimollar Nazariyasi']
  },
  'Fizika': {
    '1-4': ['Fizika: Tabiatdagi Harakat va Tezlik', 'Fizika: Issiqlik va Sovuqlik', 'Fizika: Tovush va Yorug\'lik', 'Fizika: Magnitning Sehrli Kuchlari'],
    '5-8': ['Fizika: Massa va Zichlik', 'Fizika: Bosim va Arximed Qonuni', 'Fizika: Nyutonning Harakat Qonunlari', 'Fizika: Ish, Quvvat va Energiya'],
    '9-11': ['Fizika: Butunjahon Gravitatsiya Qonuni', 'Fizika: Mexanik Tebranishlar va To\'lqinlar', 'Fizika: Termodinamika va Ideal Gaz Qonunlari', 'Fizika: Kvant Mexanikasi va Fotoeffekt']
  },
  'Kimyo': {
    '1-4': ['Kimyo: Tabiatdagi Suv va Havo', 'Kimyo: Qattiq, Suyuq va Gaz Holatlar', 'Kimyo: Aralashmalar va Toza Moddalar', 'Kimyo: Qiziqarli Uy Tajribalari'],
    '5-8': ['Kimyo: Moddalar va Atom Tuzilishi', 'Kimyo: Oddiy va Murakkab Moddalar', 'Kimyo: Kislorod va Yonish Reaksiyalari', 'Kimyo: Valentlik Asoslari'],
    '9-11': ['Kimyo: Mendeleyev Davriy Qonuni va Atom Tuzilishi', 'Kimyo: Kovalent va Ionli Bog\'lanish', 'Kimyo: Kislota, Asos va Tuzlar', 'Kimyo: Organik Moddalar (Uglevodorodlar)']
  },
  'Tarix': {
    '1-4': ['Tarix: Oila va Vatan Tarixi', 'Tarix: Qadimgi Odamlar Hayoti', 'Tarix: Qadimiy Shaharlarimiz', 'Tarix: Milliy Qadriyatlarimiz'],
    '5-8': ['Tarix: Qadimgi Turon va Baqtriya', 'Tarix: Buyuk Ipak Yo\'li Madaniyati', 'Tarix: Xorazmshohlar Davlati', 'Tarix: Mo\'g\'ullar Bosqini va Jaloliddin'],
    '9-11': ['Tarix: Amir Temur va Markazlashgan Davlat Boshqaruvi', 'Tarix: Temuriylar Renessansi va Mirzo Ulug\'bek', 'Tarix: O\'zbek Xonliklari Davri', 'Tarix: Turkiston Jadidchilik Harakati']
  },
  'Informatika/AI': {
    '1-4': ['Informatika: Kompyuter bilan Tanishuv', 'Informatika: Sichqoncha va Klaviatura', 'Informatika: Rangli Chizish Dasturlari', 'Informatika: Xavfsiz Internet'],
    '5-8': ['Informatika: Axborot va Sanash Sistemalari', 'Informatika: Algoritm Turlari va Chiziqli Bloklar', 'Informatika: Scratch Dasturlash Asoslari', 'Informatika: Matn Muharrirlari'],
    '9-11': ['Informatika: Sun\'iy Neyron Tarmoqlari', 'Informatika: Python Dasturlash Tili va Funksiyalar', 'Informatika: Ma\'lumotlar Bazasi va SQL', 'Informatika: Blokcheyn va Kiberxavfsizlik']
  }
};

// Fallback Generator with exact syllabus support
function getAdaptiveFallbackLesson(
  subject: string,
  topic: string,
  gradeLevel: GradeLevel,
  grade: number
): LessonData {
  const cleanTitle = topic || SYLLABUS_SEQUENCE[subject]?.[gradeLevel]?.[0] || `${subject} Darsi`;
  const closingSentence = "Mavzuni o'zlashtirib bo'ldingizmi? Mavzuga oid savol-javoblar qilamizmi keyingi mavzuga o'tishimiz uchun?";

  const baseQuiz = {
    question: `${cleanTitle} mavzusida o'rganilgan asosiy qoidaning mohiyati nimada?`,
    options: [
      'Fundamental qonuniyat va amaliy masalalarni to\'g\'ri yechishda',
      'Faqat kitobni tez o\'qib chiqishda',
      'Hech qanday qoidaga rioya qilmaslikda'
    ],
    correctIndex: 0,
    explanation: `${subject} fanida barcha masalalar fundamental qonuniyatlar va formulalarga asoslanadi.`
  };

  const quizList = generateQuestionsForGrade(subject, cleanTitle, gradeLevel, baseQuiz);
  const nextList = SYLLABUS_SEQUENCE[subject]?.[gradeLevel] || [];
  const currIdx = nextList.findIndex(t => t.toLowerCase().includes(cleanTitle.toLowerCase()));
  const nextTopic = (currIdx >= 0 && currIdx < nextList.length - 1) ? nextList[currIdx + 1] : nextList[0];

  return {
    topic: cleanTitle,
    category: `${subject} (${grade}-sinf)`,
    subject,
    gradeLevel,
    grade,
    simpleExplanation: `${cleanTitle} — ${grade}-sinf ${subject} fanining asosiy mavzusidir. Uning mohiyati jarayonlarning sabab-oqibat mexanizmini va amaliy yechimini aniq tushunishga asoslanadi.`,
    formulas: [
      `1-Qoida: ${cleanTitle} formulasiga qat'iy rioya qiling`,
      '2-Qoida: Olingan natijalarni nazariy qonuniyat bilan solishtiring',
      '3-Qoida: Masala shartidagi o\'lchov birliklarini to\'g\'ri tekshiring'
    ],
    exampleProblem: {
      problem: `${cleanTitle} mavzusi bo'yicha namunaviy masala: Berilgan parametrlar bo'yicha natijani toping.`,
      stepByStepSolution: 'Yechish bosqichlari: 1) Masala shartini yozamiz; 2) Asosiy formulani tanlaymiz; 3) Qiymatlarni qo\'yib, aniq hisoblaymiz.'
    },
    closingQuestion: closingSentence,
    mermaidDiagram: `graph TD
    A[Dastlabki Nazariya: ${cleanTitle.slice(0, 15)}] --> B[Asosiy Formula va Qoida]
    B --> C[Namuna Masala Yechimi]
    C --> D[Mustaqil Savol-Javob Sinovi]`,
    speechScript: `${cleanTitle} mavzusini tushuntirib beraman. Ushbu mavzuning asosiy formulasini diqqat bilan o'rganing. Namuna masalani bosqichma-bosqich yechib ko'rdik. ${closingSentence}`,
    quizList,
    passingScorePercent: 60,
    nextTopic,
    reviewExplanation: `Keling, ${cleanTitle} mavzusini qayta tushuntiraman: Asosiy qoidani eslab qoling, formulani to'g'ri qo'llang va masalani shoshilmasdan qayta hisoblang.`,
    strictFeedback: "Diqqatingizni jamlang! Natija 60% dan past bo'ldi. Keling, mavzuni qayta tushuntiraman!",
    happyFeedback: "Ajoyib! Natijangiz 60% dan yuqori bo'ldi va mavzuni muvaffaqiyatli o'zlashtirdingiz!"
  };
}

// API endpoint: Generate Adaptive Lesson
app.post('/api/generate-lesson', async (req: Request, res: Response) => {
  const {
    topic,
    subject = 'Fizika',
    gradeLevel = '5-8',
    grade = 7,
    voicePersona = 'jasur'
  } = req.body;

  const closingSentence = "Mavzuni o'zlashtirib bo'ldingizmi? Mavzuga oid savol-javoblar qilamizmi keyingi mavzuga o'tishimiz uchun?";
  const targetQuestionsCount = gradeLevel === '1-4' ? 10 : gradeLevel === '5-8' ? 20 : 30;

  if (ai) {
    try {
      const personaTone = voicePersona === 'jasur' 
        ? "Ustoz Jasur (vazmin, qat'iyatli, bilimdon erkak lektor)" 
        : "Ustoz Malika (do'stona, iliq, tushunarli ayol repetitor)";

      const systemInstruction = `Siz maktab o'quvchilari uchun interaktiv va moslashuvchan (adaptive) professional AI O'qituvchisiz.
QAT'IY PEDAGOGIK QOIDALAR:
1. TANLANGAN FAN: "${subject}". Faqat va faqat "${subject}" fani doirasida dars bering! Boshqa fanga chalg'imang!
2. FOYDALANUVCHI SINFI: ${grade}-sinf (Toifa: ${gradeLevel} sinf).
   - Savollar soni: Ushbu sinf toifasiga mos ravishda AYNAN ${targetQuestionsCount} ta savol bo'lishi shart! (1-4 sinf: 10 ta, 5-8 sinf: 20 ta, 9-11 sinf: 30 ta).
3. MAVZU TUSHUNTIRISH:
   Dastlab mavzuni, formula va masalalarni dona-dona, oddiy va tushunarli tilda tushuntiring.
   Har bir tushuntirish oxirida va speechScript oxirida albatta shunday deb so'rang:
   "${closingSentence}"
4. BARCHA MATNLAR TOZA O'ZBEK TILI LOTIN ALIFBOSIDA BO'LISHI SHART!`;

      const prompt = `O'qituvchi personasi: ${personaTone}.
Fan: "${subject}".
Sinf: ${grade}-sinf (${gradeLevel} toifasi).
Mavzu: "${topic}".
Savollar soni: ${targetQuestionsCount} ta test savoli.

Ushbu qoidalar asosida JSON formatda to'liq dars yarating.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              category: { type: Type.STRING },
              subject: { type: Type.STRING },
              gradeLevel: { type: Type.STRING },
              grade: { type: Type.INTEGER },
              simpleExplanation: { type: Type.STRING },
              formulas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              exampleProblem: {
                type: Type.OBJECT,
                properties: {
                  problem: { type: Type.STRING },
                  stepByStepSolution: { type: Type.STRING },
                },
                required: ['problem', 'stepByStepSolution'],
              },
              closingQuestion: { type: Type.STRING },
              mermaidDiagram: { type: Type.STRING },
              speechScript: { type: Type.STRING },
              quizList: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
                },
              },
              passingScorePercent: { type: Type.INTEGER },
              nextTopic: { type: Type.STRING },
              reviewExplanation: { type: Type.STRING },
              strictFeedback: { type: Type.STRING },
              happyFeedback: { type: Type.STRING },
            },
            required: [
              'topic', 'category', 'subject', 'gradeLevel', 'grade',
              'simpleExplanation', 'formulas', 'exampleProblem',
              'closingQuestion', 'mermaidDiagram', 'speechScript',
              'quizList', 'passingScorePercent', 'nextTopic', 'reviewExplanation',
              'strictFeedback', 'happyFeedback'
            ],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed: LessonData = JSON.parse(responseText);
        parsed.subject = subject;
        parsed.gradeLevel = gradeLevel as GradeLevel;
        parsed.grade = Number(grade);
        parsed.closingQuestion = closingSentence;
        
        // Guarantee formulas is always an array
        if (!Array.isArray(parsed.formulas) || parsed.formulas.length === 0) {
          parsed.formulas = [
            `1-Qoida: ${topic} bo'yicha asosiy tamoyil va formulalarni yodda tuting`,
            '2-Qoida: Nazariy bilimlarni amaliy masalalarda to\'g\'ri qo\'llang',
            '3-Qoida: Hisoblashda o\'lchov birliklariga qat\'iy e\'tibor bering'
          ];
        }

        // Guarantee exampleProblem is always present
        if (!parsed.exampleProblem || typeof parsed.exampleProblem !== 'object') {
          parsed.exampleProblem = {
            problem: `${topic} bo'yicha namunaviy masala: berilgan parametrlar bo'yicha hisoblang.`,
            stepByStepSolution: 'Bosqichma-bosqich yechim: 1) Formulani aniqlaymiz; 2) Berilganlarni qo\'yamiz; 3) Aniq natijani hisoblaymiz.'
          };
        }

        // Ensure quiz list has required count and options array
        if (!Array.isArray(parsed.quizList) || parsed.quizList.length < targetQuestionsCount) {
          parsed.quizList = generateQuestionsForGrade(
            subject,
            topic,
            gradeLevel as GradeLevel,
            parsed.quizList?.[0] || {
              question: `${topic} bo'yicha asosiy qoida qaysi?`,
              options: ['Asosiy qoida to\'g\'ri', 'Noto\'g\'ri qoida', 'Taxminiy qoida'],
              correctIndex: 0,
              explanation: 'Darsda o\'rganilgan formula va qoidaga tayaniladi.'
            }
          );
        } else {
          parsed.quizList = parsed.quizList.map((q, idx) => ({
            id: q.id || idx + 1,
            question: q.question || `${topic} bo'yicha ${idx + 1}-savol:`,
            options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['To\'g\'ri javob', 'Noto\'g\'ri javob', 'Taxminiy javob'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: q.explanation || 'Dars qoidalariga asosan yechiladi.'
          }));
        }
        return res.json(parsed);
      }
    } catch (err) {
      console.error('Gemini adaptive generation notice:', err);
    }
  }

  // Resilient Adaptive Fallback
  const fallback = getAdaptiveFallbackLesson(subject, topic, gradeLevel as GradeLevel, Number(grade));
  return res.json(fallback);
});

// Natural Uzbek Google TTS audio stream proxy with automatic Cyrillic transliteration
app.get('/api/tts', (req: Request, res: Response) => {
  const text = (req.query.text as string) || '';
  if (!text) {
    return res.status(400).send('Text is required');
  }

  const cyrillicText = latinToCyrillicUzbek(text);
  const cleanText = encodeURIComponent(cyrillicText.slice(0, 250));
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uz&client=tw-ob&q=${cleanText}`;

  https.get(googleTtsUrl, (ttsRes) => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    ttsRes.pipe(res);
  }).on('error', (e) => {
    console.warn('TTS streaming error:', e);
    res.status(502).send('TTS unavailable');
  });
});

// Single-file export endpoint
app.get('/api/export-single-file', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'voice_engine.html'));
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniCore Adaptive School AI Teacher running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
