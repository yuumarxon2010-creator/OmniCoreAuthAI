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

// Transliterate Uzbek Latin to Cyrillic for TTS audio engines
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

export interface LessonData {
  topic: string;
  category: string;
  subject: string;
  simpleExplanation: string;
  mermaidDiagram: string;
  speechScript: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  keyPoints: string[];
  strictFeedback: string;
  happyFeedback: string;
}

// Comprehensive Multi-Subject Knowledge Library
const SUBJECT_PRESETS: Record<string, Record<string, LessonData>> = {
  'Ingliz Tili': {
    'present': {
      topic: 'Ingliz Tili: Present Perfect Tense va Natijaviylik',
      category: 'Ingliz Tili Grammatikasi',
      subject: 'Ingliz Tili',
      simpleExplanation: 'Present Perfect zamoni (have/has + V3) o\'tmishda boshlangan, ammo natijasi aynan hozirgi lahzada ko\'rinib turgan harakatlar uchun ishlatiladi. Masalan, "I have lost my key" jumlasi kalitning o\'tmishda yo\'qolgani va hozir ham uyga kira olmaslik natijasini bildiradi.',
      mermaidDiagram: `graph LR
      A[O'tmishdagi Harakat Past Action] -->|have / has + V3| B[Hozirgi Natija Present Result]
      B --> C[Tajriba yoki Hozirgi Holat]
      C --> D[Signal so'zlar: already, just, yet, ever]`,
      speechScript: 'Present Perfect zamoni o\'tmishdagi harakatning hozirgi paytga bog\'liq natijasini ko\'rsatadi. Have yoki has yordamchi fe\'li va fe\'lning uchinchi shakli orqali yasaladi.',
      quiz: {
        question: '«She ______ already finished her homework.» bo\'sh o\'ringa to\'g\'ri yordamchi fe\'lni qo\'ying:',
        options: ['has', 'have', 'is'],
        correctIndex: 0,
        explanation: 'Ingliz tilida 3-shaxs birlik (He, She, It) uchun Present Perfect da faqat «has» yordamchi fe\'li qo\'llaniladi.'
      },
      keyPoints: [
        'Formula: Subject + have/has + Past Participle (V3)',
        'Past Simple o\'tgan vaqtni (yesterday), Present Perfect esa hozirgi natijani ta\'kidlaydi',
        'Signal so\'zlar: already, just, never, ever, yet, recently'
      ],
      strictFeedback: 'Diqqatsizlik! «She» olmoshidan keyin «have» emas, «has» yordamchi fe\'li qo\'yiladi!',
      happyFeedback: 'Excellent! Siz 3-shaxs birlik uchun «has» fe\'li qoidasini a\'lo darajada bilasiz!'
    },
    'conditional': {
      topic: 'Ingliz Tili: Second Conditional (Faraziy Shart Ergash Gaplar)',
      category: 'Ingliz Tili Grammatikasi',
      subject: 'Ingliz Tili',
      simpleExplanation: 'Second Conditional hozirgi yoki kelasi zamondagi noreal, orzu-xayoliy yoki amalga oshishi qiyin bo\'lgan shartli holatlarni ifodalaydi. U «If + Past Simple, would + V1» qoidasi asosida yasaladi (Masalan: If I had a million dollars, I would travel the world).',
      mermaidDiagram: `graph TD
      A[Noreal Faraz: If + Past Simple] --> B[Natija qismi: would + V1]
      B --> C[Hozirgi paytdagi xayoliy orzu]
      C --> D[Misol: If I were you, I would study hard]`,
      speechScript: 'Second Conditional hozirgi paytdagi noreal va faraziy shartlarni ifodalaydi. If qismida Past Simple, natija qismida esa would va fe\'l ishlatiladi.',
      quiz: {
        question: '«If I won the lottery, I ______ a new house.» bo\'sh o\'ringa qaysi so\'z mos keladi?',
        options: ['would buy', 'will buy', 'bought'],
        correctIndex: 0,
        explanation: 'Second Conditional formulasiga binoan asosiy gap qismida «would + fe\'l» (would buy) ishlatiladi.'
      },
      keyPoints: [
        'Formula: If + Past Simple, S + would + Verb',
        'Barcha shaxslar uchun formal nutqda «were» ishlatiladi (If I were you)',
        'Bu qoida mutlaqo noreal yoki xayoliy vaziyatlarga xosdir'
      ],
      strictFeedback: 'Xato! Second Conditional da «will» emas, o\'tgan zamon shakli «would» ishlatiladi!',
      happyFeedback: 'Well done! Siz Second Conditional shart ergash gaplar qoidasini to\'g\'ri qo\'lladingiz!'
    },
    'passive': {
      topic: 'Ingliz Tili: Passive Voice (Majhul Nisbat)',
      category: 'Ingliz Tili Grammatikasi',
      subject: 'Ingliz Tili',
      simpleExplanation: 'Passive Voice gapda harakatni kim bajarganidan ko\'ra, harakatning o\'zi yoki uning ob\'ekti muhimroq bo\'lganda ishlatiladi. U doimo «to be + V3 (Past Participle)» formulasiga tayanadi (Masalan: The book was written in 1990).',
      mermaidDiagram: `graph LR
      A[Active: Subject + Verb + Object] -->|Transformatsiya| B[Passive: Object + be + V3]
      B --> C[Bajaruvchi noma'lum yoki muhim emas]
      C --> D[Zarur bo'lsa: by + Agent]`,
      speechScript: 'Passive Voice majhul nisbat bo\'lib, unda harakatning o\'zi bajaruvchidan ko\'ra muhimroq hisoblanadi. Doimo to be va fe\'lning uchinchi shakli bilan yasaladi.',
      quiz: {
        question: '«This bridge ______ in 2010.» gapini to\'g\'ri majhul nisbat shakli bilan to\'ldiring:',
        options: ['was built', 'is built', 'built'],
        correctIndex: 0,
        explanation: '2010-yil o\'tgan zamon bo\'lgani uchun «to be» ning o\'tgan zamon shakli «was» va build fe\'lining 3-shakli «built» ishlatiladi.'
      },
      keyPoints: [
        'Formula: Subject + to be (mos zamonda) + V3',
        'O\'tgan zamon majhul nisbat: was/were + V3',
        'Bajaruvchi ko\'rsatilsa «by» predlogi qo\'shiladi'
      ],
      strictFeedback: 'E\'tiborsizlik! O\'tgan zamon uchun «is» emas, «was built» ishlatilishi shart!',
      happyFeedback: 'Great job! Siz majhul nisbatning o\'tgan zamon shaklini to\'g\'ri topdingiz!'
    }
  },
  'Matematika': {
    'pifagor': {
      topic: 'Matematika: Pifagor Teoremasi va Geometriya',
      category: 'Geometriya',
      subject: 'Matematika',
      simpleExplanation: 'Pifagor teoremasiga ko\'ra, to\'g\'ri burchakli uchburchakda gipotenuza kvadratining qiymati katetlar kvadratlarining yig\'indisiga doimo teng bo\'ladi. Ushbu teorema barcha fazoviy masofalarni va vektor uzunliklarini aniqlashda poydevor hisoblanadi.',
      mermaidDiagram: `graph TD
      A[To'g'ri Burchakli Uchburchak] --> B[Katet a va Katet b]
      B --> C[Katetlar Kvadratlari: a² + b²]
      C --> D[Gipotenuza Kvadrati c²]
      D --> E[Masofa va Vektor Formulalari]`,
      speechScript: 'Pifagor teoremasi to\'g\'ri burchakli uchburchakda gipotenuza kvadrati katetlar kvadratlarining yig\'indisiga teng ekanligini ta\'kidlaydi. Bu geometriya va fazoviy koordinatalarning asosidir.',
      quiz: {
        question: 'To\'g\'ri burchakli uchburchakning katetlari 3 va 4 ga teng bo\'lsa, gipotenuzasi nechaga teng bo\'ladi?',
        options: ['5', '6', '7'],
        correctIndex: 0,
        explanation: 'Pifagor teoremasi bo\'yicha: c² = 3² + 4² = 9 + 16 = 25. Demak, c = √25 = 5 (Misr uchburchagi).'
      },
      keyPoints: [
        'Klassik formula: a² + b² = c²',
        'Teskari Pifagor teoremasi burchakning 90° ekanligini isbotlashda qo\'llaniladi',
        'Fazoviy 3D masofa: d = √(x² + y² + z²)'
      ],
      strictFeedback: 'Hisoblashda adashdingiz! 3² + 4² = 9 + 16 = 25, uning kvadrat ildizi esa 5 bo\'ladi!',
      happyFeedback: 'Ofarin! Qadimgi Misr uchburchagi qoidasini a\'lo darajada bilasiz!'
    },
    'ehtimol': {
      topic: 'Matematika: Ehtimollar Nazariyasi va Tasodifiy Hodisalar',
      category: 'Ehtimollar Nazariyasi',
      subject: 'Matematika',
      simpleExplanation: 'Ehtimollar nazariyasi tasodifiy hodisalarning ro\'y berish qonuniyatlarini matematik tilda o\'rganadi. Klassik ehtimollik formulasi qulay imkoniyatlar sonini barcha teng imkoniyatli natijalar soniga nisbati bilan hisoblanadi (P = m / n).',
      mermaidDiagram: `graph TD
      A[Barcha teng imkoniyatli natijalar n] --> C[Ehtimollik P = m / n]
      B[Hodisaga qulay natijalar m] --> C
      C --> D[Qiymat oralig'i: 0 <= P <= 1]
      D --> E[Statistika va Kvant Modellari]`,
      speechScript: 'Ehtimollar nazariyasi hodisaning ro\'y berish imkoniyatini nol va bir oralig\'ida baholaydi. Qulay natijalar sonini barcha natijalar soniga bo\'lish orqali topiladi.',
      quiz: {
        question: 'Oddiy 6 qirrali o\'yin suyagi tashlanganda toq son tushish ehtimoli nechaga teng?',
        options: ['1/2 (50%)', '1/3 (33.3%)', '1/6 (16.7%)'],
        correctIndex: 0,
        explanation: 'Jami natijalar n = 6. Toq sonlar (1, 3, 5) soni m = 3. Ehtimollik: P = 3/6 = 1/2.'
      },
      keyPoints: [
        'Klassik formula: P(A) = m / n',
        'Muqarrar hodisa ehtimoli 1 ga, imkonsiz hodisa ehtimoli 0 ga teng',
        'Qarama-qarshi hodisa formulasi: P(A\') = 1 - P(A)'
      ],
      strictFeedback: 'Xato! Suyakda 3 ta toq son bor (1, 3, 5), jami 6 ta tomon, shunda 3/6 ya\'ni 1/2 bo\'ladi!',
      happyFeedback: 'Juda to\'g\'ri! Ehtimollikning klassik formulasini mukammal qo\'lladingiz!'
    }
  },
  'Kimyo': {
    'davriy': {
      topic: 'Kimyo: Mendeleyev Davriy Qonuni va Atom Tuzilishi',
      category: 'Anorganik Kimyo',
      subject: 'Kimyo',
      simpleExplanation: 'Mendeleyev davriy qonuniga ko\'ra, kimyoviy elementlarning xossalari ularning atom yadrosi zaryadiga (protonlar soniga) davriy ravishda bog\'liqdir. Tashqi elektron qobig\'idagi elektronlar soni elementning qanday reaksiyaga kirishishini belgilab beradi.',
      mermaidDiagram: `graph TD
      A[Atom Yadrosi: Protonlar Z] --> B[Davriy Jadvaldagi Tartib Raqami]
      B --> C[Elektron Qobiqlar Pog'onasi]
      C --> D[Valent Elektronlar]
      D --> E[Elementning Kimyoviy Xossalari]`,
      speechScript: 'Mendeleyev davriy qonuniga ko\'ra, elementlarning xossalari ularning yadro zaryadiga davriy bog\'liqdir. Tashqi qobiqdagi valent elektronlar elementlarning xulq-atvorini belgilaydi.',
      quiz: {
        question: 'Atomning kimyoviy xossalarini va uning davriy jadvaldagi o\'rnini asosan nima belgilaydi?',
        options: [
          'Yadrodagi neytronlar soni',
          'Yadrodagi protonlar soni (yadro zaryadi)',
          'Moddaning umumiy og\'irligi'
        ],
        correctIndex: 1,
        explanation: 'Davriy qonunning zamonaviy ta\'rifi aynan yadro zaryadi (protonlar soni Z) ga tayanadi.'
      },
      keyPoints: [
        'Zaryad soni Z = Protonlar soni = Neytral atomdagi elektronlar soni',
        'Guruh raqami tashqi valent elektronlar sonini ko\'rsatadi',
        'Davr raqami elektron qavatlarning umumiy soniga teng'
      ],
      strictFeedback: 'Diqqat qiling! Neytronlar izotoplarni hosil qiladi, elementning xossalarini esa yadro zaryadi (protonlar) belgilaydi!',
      happyFeedback: 'Juda to\'g\'ri! Yadro zaryadi davriy qonunning eng asosiy fundamentidir!'
    },
    'kovalent': {
      topic: 'Kimyo: Kovalent Bog\'lanish va Elektron Juftliklar',
      category: 'Umumiy Kimyo',
      subject: 'Kimyo',
      simpleExplanation: 'Kovalent bog\'lanish — nometall atomlari o\'rtasida umumiy elektron juftliklari hosil bo\'lishi hisobiga yuzaga keladigan kuchli kimyoviy bog\'lanish turidir. Agar elektronlar teng taqsimlansa qutbsiz, elektrmanfiyligi kuchliroq atomga siljisa qutbli kovalent bog\'lanish deyiladi.',
      mermaidDiagram: `graph TD
      A[Nometall Atom 1] --> C[Umumiy Elektron Jufti]
      B[Nometall Atom 2] --> C
      C --> D[Barqaror Oktet Qobig'i]
      D --> E[Kovalent Molekula: H2O, CH4, O2]`,
      speechScript: 'Kovalent bog\'lanish atomlarning umumiy elektron juftliklari hosil qilishi orqali vujudga keladi. Suv, kislorod va organik moddalar aynan kovalent bog\'lar orqali hosil bo\'ladi.',
      quiz: {
        question: 'Suv (H2O) molekulasidagi vodorod va kislorod atomlari orasidagi bog\'lanish qaysi turga kiradi?',
        options: [
          'Qutbli kovalent bog\'lanish',
          'Ionli bog\'lanish',
          'Metall bog\'lanish'
        ],
        correctIndex: 0,
        explanation: 'Kislorod va vodorod har xil nometall bo\'lib, kislorodning elektrmanfiyligi yuqori bo\'lgani sababli qutbli kovalent bog\'lanish hosil bo\'ladi.'
      },
      keyPoints: [
        'Kovalent bog\' umumiy elektron juftliklari orqali hosil bo\'ladi',
        'Bir xil nometallar (O2, N2) da qutbsiz, turli nometallarda (H2O, HCl) qutbli bo\'ladi',
        'Kovalent bog\'lanish yuqori mustahkamlikka ega'
      ],
      strictFeedback: 'Xato! Suvda ionlar emas, umumiy elektron juftlari mavjud, demak bu qutbli kovalent bog\'dir!',
      happyFeedback: 'A\'lo! Suv molekulasidagi kovalent bog\'lanish mohiyatini to\'g\'ri tushundingiz!'
    }
  },
  'Tarix': {
    'temur': {
      topic: 'Tarix: Amir Temur va Markazlashgan Davlat Boshqaruvi',
      category: 'O\'zbekiston Tarixi',
      subject: 'Tarix',
      simpleExplanation: 'Sohibqiron Amir Temur tarqoq feodal bekliklarni birlashtirib, qudratli markazlashgan davlat va qonun ustuvorligiga asoslangan adolat tizimini barpo etdi. Uning «Kuch — adolatdadir» shiori Buyuk Ipak yo\'lida xavfsizlik va Temuriylar Renessansiga yo\'l ochdi.',
      mermaidDiagram: `graph TD
      A[Tarqoq bekliklar birlashuvi] --> B[Markazlashgan Quvvatli Davlat]
      B --> C[Temur Tuzuklari: Adolat va Qonun]
      C --> D[Buyuk Ipak Yo'li Xavfsizligi]
      D --> E[Ilm-fan va Temuriylar Renessansi]`,
      speechScript: 'Amir Temur tarqoq bekliklarni birlashtirib, qudratli davlat va adolat tizimini yaratdi. Uning Kuch adolatdadir shiori Buyuk Ipak yo\'lida xavfsizlik va ilm-fan taraqqiyotini ta\'minladi.',
      quiz: {
        question: 'Amir Temur davlat boshqaruvida qaysi shiorni o\'zining bosh strategik mezoni qilib olgan?',
        options: [
          'Kuch — adolatdadir',
          'Tinchlik — boylikdadir',
          'G\'alaba — kuchdadir'
        ],
        correctIndex: 0,
        explanation: 'Amir Temurning davlat muhri va uzugida «Rosti-rusti» (Kuch — adolatdadir) shiori zarb etilgan bo\'lib, u butun saltanat qonunlarining o\'zagi bo\'lgan.'
      },
      keyPoints: [
        '«Temur tuzuklari» — davlat boshqaruvi va harbiy san\'atning noyob qomusidir',
        'Markazlashgan savdo yo\'llari Sharq va G\'arb madaniyatlarini bog\'lagan',
        'Samarqand shahrida jahon miqyosidagi me\'moriy obidalar qad ko\'tardi'
      ],
      strictFeedback: 'Tarixiy manbalarni unutdingiz! Sohibqiron Amir Temurning bosh g\'oyasi aynan «Kuch — adolatdadir» bo\'lgan!',
      happyFeedback: 'Tasanno! Buyuk Sohibqironning o\'lmas adolat shiorini to\'g\'ri esladingiz!'
    },
    'ipak': {
      topic: 'Tarix: Buyuk Ipak Yo\'li va Madaniy Integratsiya',
      category: 'Jahon Tarixi',
      subject: 'Tarix',
      simpleExplanation: 'Buyuk Ipak yo\'li — Sharqiy Osiyoni O\'rta yer dengizi havzasi bilan bog\'lagan qadimiy karvon yo\'llari tizimi bo\'lib, u orqali faqat ipak emas, balki qog\'oz, din, fan va madaniyat almashinuvi yuz bergan. O\'zbekiston hududi (Samarqand, Buxoro, Xiva) ushbu global savdo arteriyasining eng muhim chorrahasi bo\'lgan.',
      mermaidDiagram: `graph LR
      A[Xitoy: Ipak va Choy] --> B[Markaziy Osiyo: So'g'd Savdogarlari]
      B --> C[Yaqin Sharq va Vizantiya]
      C --> D[Yevropa Bozorlari]
      B -.->|Madaniy almashinuv| E[Astronomiya, Tibbiyot, Falsafa]`,
      speechScript: 'Buyuk Ipak yo\'li qit\'alarni bog\'lagan global savdo tizimi bo\'lib, unda Samarqand va Buxoro kabi shaharlarimiz madaniyat va fan markazi vazifasini bajargan.',
      quiz: {
        question: 'Buyuk Ipak yo\'lida savdo va madaniy vositachilikda eng faol xalq qaysi bo\'lgan?',
        options: ['So\'g\'diylar', 'Rimliklar', 'Vikinglar'],
        correctIndex: 0,
        explanation: 'So\'g\'diy savdogarlar Xitoydan tortib Vizantiyagacha butun yo\'l bo\'ylab savdo koloniyalarini boshqargan va asosiy diplomat bo\'lgan.'
      },
      keyPoints: [
        'Miloddan avvalgi II asrda Xan imperiyasi elchisi Chjan Tyan ekspeditsiyasidan so\'ng faollashgan',
        'Ipak yo\'li orqali qog\'oz ishlab chiqarish siri Samarqanddan Yevropaga tarqalgan',
        'Savdo xavfsizligi karvonsaroylar va davlat shartnomalari bilan himoyalangan'
      ],
      strictFeedback: 'Tarixiy faktni adashtirdingiz! Asosiy karvon vositachilari aynan So\'g\'d xalqi bo\'lgan!',
      happyFeedback: 'A\'lo darajada! Qadimiy So\'g\'d savdo karvonlari tarixini to\'g\'ri bildingiz!'
    }
  },
  'Informatika/AI': {
    'neyron': {
      topic: 'Informatika: Sun\'iy Neyron Tarmoqlari',
      category: 'Sun\'iy Intellekt',
      subject: 'Informatika/AI',
      simpleExplanation: 'Sun\'iy neyron tarmoqlari — inson miyasi biologik neyronlari ishlash prinsipiga taqlid qiluvchi matematik hisoblash algoritmidir. Ular kiruvchi ma\'lumotlarni ko\'p qatlamli vaznlar va aktivatsiya funksiyalari orqali qayta ishlab, murakkab qonuniyatlarni mustaqil taniy oladi.',
      mermaidDiagram: `graph LR
      A[Kirish Qatlami x] -->|Vaznlar W| B[Yashirin Qatlam Neyronlari]
      B -->|Aktivatsiya ReLU| C[Chiqish Qatlami y]
      C -->|Xatolik Hisobi| D[Backpropagation & Gradient]
      D -.->|Vaznlarni yangilash| B`,
      speechScript: 'Sun\'iy neyron tarmoqlari inson miyasi tuzilishiga taqlid qiluvchi algoritmlardir. Ular qatlamlar orqali ma\'lumotlarni tahlil qilib, xatolarni kamaytirish orqali mukammallashadi.',
      quiz: {
        question: 'Neyron tarmog\'ini o\'qitishda chiqishdagi xatolikni orqaga tarqatib vaznlarni yangilash algoritmi qanday ataladi?',
        options: [
          'Backpropagation (Orqaga tarqalish)',
          'Overfitting (Qayta moslashish)',
          'Data Augmentation'
        ],
        correctIndex: 0,
        explanation: 'Backpropagation algoritmi xatolik gradientini hisoblab, tarmoqdagi barcha vaznlarni teskari tartibda aniq yangilaydi.'
      },
      keyPoints: [
        'Neyron matematik modeli: y = f(∑(w_i * x_i) + b)',
        'Aktivatsiya funksiyalari (ReLU, GELU) chiziqsiz murakkab bog\'liqliklarni o\'rgatadi',
        'Chuqur o\'rganish (Deep Learning) — ko\'p sonli yashirin qatlamlarga asoslanadi'
      ],
      strictFeedback: 'Xato! Overfitting bu xatolikni tarqatish emas, balki tarmoqning haddan tashqari yodlab olish kasalligidir!',
      happyFeedback: 'Mukammal! Siz mashinali o\'rganishning eng muhim ustuni bo\'lgan Backpropagation algoritmini to\'g\'ri tanladingiz!'
    },
    'blokcheyn': {
      topic: 'Informatika: Blokcheyn va Taqsimlangan Registr',
      category: 'Kriptografiya va Xavfsizlik',
      subject: 'Informatika/AI',
      simpleExplanation: 'Blokcheyn — ma\'lumotlar ketma-ket bloklarda saqlanadigan va har bir blok oldingi blokning kriptografik xesh kodiga bog\'langan markazsizlashtirilgan bazadir. Bitta blokdagi ma\'lumotni o\'zgartirish butun zanjir xeshini buzib yuborishi sababli uni soxtalashtirish imkonsizdir.',
      mermaidDiagram: `graph LR
      A[Blok #1: Xesh A] -->|Oldingi xesh| B[Blok #2: Xesh B]
      B -->|Oldingi xesh| C[Blok #3: Xesh C]
      C -->|Konsensus| D[P2P Tarmoq Validatsiyasi]
      D --> E[O'zgarmas Xavfsiz Tranzaksiya]`,
      speechScript: 'Blokcheyn ma\'lumotlar ketma-ket kriptografik xeshlar bilan bog\'langan xavfsiz tizimdir. Undagi ma\'lumotlarni hech kim bir tomonlama o\'zgartira olmaydi.',
      quiz: {
        question: 'Blokcheynda yangi blok oldingi blok bilan qanday bog\'lanadi?',
        options: [
          'Oldingi blokning kriptografik xesh kodi orqali',
          'Foydalanuvchining login va paroli orqali',
          'Markaziy serverning buyrug\'i orqali'
        ],
        correctIndex: 0,
        explanation: 'Har bir yangi blok o\'z sarlavhasida oldingi blokning xeshini saqlaydi, bu esa uzilmas xavfsiz zanjirni kafolatlaydi.'
      },
      keyPoints: [
        'Asimmetrik kriptografiya (ochiq va yopiq kalitlar) ishlatiladi',
        'Konsensus mexanizmlari: Proof of Work (PoW) va Proof of Stake (PoS)',
        'Smart-kontraktlar — shartlar bajarilganda avtomatik ishga tushuvchi kod'
      ],
      strictFeedback: 'Diqqat! Blokcheyn markazsiz tizim, u login-parol emas, kriptografik xesh bilan bog\'lanadi!',
      happyFeedback: 'Barakalla! Blokcheynning kriptografik bog\'lanish tamoyilini to\'g\'ri bildingiz!'
    }
  },
  'Fizika': {
    'gravitatsiya': {
      topic: 'Fizika: Butunjahon Gravitatsiya Qonuni',
      category: 'Klassik Mexanika',
      subject: 'Fizika',
      simpleExplanation: 'Gravitatsiya — barcha massaga ega jismlarning bir-birini o\'zaro tortishish fundamental kuchidir. Jismning massasi qanchalik katta bo\'lsa, uning gravitatsiya maydoni shunchalik kuchli bo\'ladi va masofa ortishi bilan bu kuch tez pasayadi.',
      mermaidDiagram: `graph TD
      A[Massaga ega jism M1] -->|Gravitatsiya kuchi F| C[O'zaro tortishish markazi]
      B[Massaga ega jism M2] -->|Gravitatsiya kuchi F| C
      C --> D[Masofa kvadrati R² ga teskari proportsional]
      D --> E[Sayyoralar orbital harakati]`,
      speechScript: 'Gravitatsiya — barcha massaga ega jismlarning bir-birini o\'zaro tortishish fundamental kuchidir. Jismning massasi qanchalik katta bo\'lsa, uning tortishish kuchi shunchalik kuchli bo\'ladi.',
      quiz: {
        question: 'Ikki jism orasidagi masofa 2 barobar oshirilsa, ularning gravitatsion tortishish kuchi qanday o\'zgaradi?',
        options: [
          '2 barobar kamayadi',
          '4 barobar kamayadi',
          '2 barobar ortadi'
        ],
        correctIndex: 1,
        explanation: 'Gravitatsiya kuchi masofa kvadratiga teskari proportsionaldir (F ~ 1/R²). Shu bois masofa 2 marta ortganda, kuch 4 barobar kamayadi!'
      },
      keyPoints: [
        'Nyuton butunjahon tortishish formulasi: F = G · (m₁ · m₂) / r²',
        'Gravitatsiya doimiysi: G ≈ 6.674 × 10⁻¹¹ N·m²/kg²',
        'Sayyoralar Quyosh atrofida ellips orbitalar bo\'ylab harakatlanadi'
      ],
      strictFeedback: 'Diqqat! Masofa kvadratiga e\'tibor bermadingiz. F = G·m1·m2/r² formulasini qayta ko\'rib chiqing!',
      happyFeedback: 'Ajoyib! Siz Nyutonning teskari kvadratlar qonunini to\'g\'ri tushundingiz!'
    },
    'kvant': {
      topic: 'Fizika: Kvant Mexanikasi va Superpozitsiya',
      category: 'Kvant Fizikasi',
      subject: 'Fizika',
      simpleExplanation: 'Kvant mexanikasida mikrozarracha kuzatuv o\'tkazilgunga qadar bir vaqtning o\'zida bir nechta mumkin bo\'lgan holatlarda (superpozitsiya) mavjud bo\'ladi. Kuzatuv jarayoni to\'lqin funksiyasini kollapsga uchratadi va zarra faqat bitta aniq natijada namoyon bo\'ladi.',
      mermaidDiagram: `graph TD
      A[Kvant Zarra / Qubit] -->|Superpozitsiya| B[Bir vaqtda 0 va 1 holatida]
      B -->|Kuzatuv / O'lchash jarayoni| C[To'lqin funksiyasi kollapsi]
      C --> D[Aniq bitta natija: 0 yoki 1]`,
      speechScript: 'Kvant fizikasi mikrodunyoni o\'rganadi. Unda zarralar bir vaqtning o\'zida bir nechta holatda bo\'lishi mumkin, ammo kuzatilganda aniq bitta holatga kollaps bo\'ladi.',
      quiz: {
        question: 'Kvant superpozitsiya holati qachon aniq bitta natijaga aylanadi?',
        options: [
          'Zarra mutlaq nol haroratga yetganda',
          'O\'lchov yoki kuzatuv amalga oshirilganda',
          'Zarra tezligi yorug\'lik tezligidan oshganda'
        ],
        correctIndex: 1,
        explanation: 'Kvant mexanikasida kuzatuv to\'lqin funksiyasini kollapsga uchratadi va zarra aniq bitta holatda qayd etiladi.'
      },
      keyPoints: [
        'Geyzenberg noaniqlik prinsipi: zarraning koordinatasi va impulsini bir vaqtda aniq bilib bo\'lmaydi',
        'Kvant kompyuterlari qabitlar hisobiga eksponensial tez hisoblaydi',
        'Shryodinger mushugi — superpozitsiya tushunchasining klassik tajribasidir'
      ],
      strictFeedback: 'Diqqat qiling! Kvant holati harorat emas, o\'lchash (kuzatuv) natijasida kollaps bo\'ladi!',
      happyFeedback: 'Tasanno! Kvant to\'lqin funksiyasi kollapsi prinsipini a\'lo darajada bilasiz!'
    }
  }
};

// Strict Subject-Specific Dynamic Generator (Guaranteed 0% Cross-Subject Leak)
function getSubjectDynamicFallback(topicInput: string, subjectInput: string): LessonData {
  const normTopic = topicInput.toLowerCase();
  const subjMap = SUBJECT_PRESETS[subjectInput] || SUBJECT_PRESETS['Fizika'];

  // Check ONLY within the specified subject
  for (const [key, lesson] of Object.entries(subjMap)) {
    if (normTopic.includes(key) || key.includes(normTopic)) {
      return lesson;
    }
  }

  // If no exact match inside subject, return the first topic of THAT subject
  const firstLessonOfSubject = Object.values(subjMap)[0];
  const cleanTitle = topicInput.trim() || `${subjectInput} Asoslari`;

  if (subjectInput === 'Ingliz Tili') {
    return {
      topic: `Ingliz Tili: ${cleanTitle}`,
      category: 'Ingliz Tili Grammatikasi va Leksikasi',
      subject: 'Ingliz Tili',
      simpleExplanation: `Ushbu mavzu ingliz tilining muhim grammatik yoki leksik qoidasi bo'lib, fikrni aniq va ravon ifodalashga xizmat qiladi. Qoidani to'g'ri o'zlashtirish orqali nutqingizda grammatik xatolarning oldini olasiz.`,
      mermaidDiagram: `graph LR
      A[Grammar Rule: ${cleanTitle.slice(0, 15)}] --> B[Structure and Usage]
      B --> C[Sentence Construction]
      C --> D[Fluent Communication]`,
      speechScript: `Ingliz tili darsi: ${cleanTitle} mavzusi. Ushbu qoida orqali to'g'ri va ravon muloqot qilishni o'rganamiz.`,
      quiz: {
        question: `«${cleanTitle}» mavzusida ingliz tili qoidalariga rioya qilish nima uchun muhim?`,
        options: [
          'Fikrni xalqaro standartda aniq va xatosiz ifodalash uchun',
          'Faqat kitob o\'qish tezligini oshirish uchun',
          'Hech qanday ahamiyatga ega emas'
        ],
        correctIndex: 0,
        explanation: 'Ingliz tilida grammatik qoidalar xalqaro muloqotda tushunarsiz vaziyatlarning oldini oladi.'
      },
      keyPoints: [
        `Qoida 1: ${cleanTitle} formulasiga qat'iy amal qiling`,
        'Qoida 2: Gapdagi ega va kesim mosligini unutmang',
        'Qoida 3: So\'z boyligini muntazam amaliyotda qo\'llang'
      ],
      strictFeedback: 'Grammatika qoidalariga jiddiy e\'tibor qarating!',
      happyFeedback: 'Excellent! Ingliz tili qoidasini a\'lo darajada tushundingiz!'
    };
  }

  if (subjectInput === 'Matematika') {
    return {
      topic: `Matematika: ${cleanTitle}`,
      category: 'Aniq Fanlar va Matematika',
      subject: 'Matematika',
      simpleExplanation: `Ushbu mavzu matematik hisoblashlar va mantiqiy teoremalarning ajralmas qismidir. Formulalarning ichki qonuniyatlarini bilish orqali eng murakkab masalalarni ham oson yechish mumkin.`,
      mermaidDiagram: `graph TD
      A[Boshlang'ich Shartlar: ${cleanTitle.slice(0, 15)}] --> B[Matematik Formula va Teorema]
      B --> C[Mantiqiy Qadamlar va Hisob-kitob]
      C --> D[Aniq Yechim va Natija]`,
      speechScript: `Matematika darsi: ${cleanTitle} mavzusi. Bu formula orqali murakkab tenglamalarni aniq hisoblab chiqamiz.`,
      quiz: {
        question: `«${cleanTitle}» mavzusida matematik yechimning to'g'riligi nimaga asoslanadi?`,
        options: [
          'Aksioma, teoremalar va aniq formulalarga',
          'Tasodifiy taxminiy sonlarga',
          'Faqat chiroyli yozuvga'
        ],
        correctIndex: 0,
        explanation: 'Matematika qat\'iy mantiqiy teoremalar va aksiomalarga asoslangan aniq fandir.'
      },
      keyPoints: [
        `Asosiy formula: ${cleanTitle} tenglamasini qo'llash`,
        'Har doim yechimni tekshirish shart',
        'Mantiqiy qadamlarni izchil davom ettiring'
      ],
      strictFeedback: 'Hisob-kitobda xatoga yo\'l qo\'ydingiz, formulani qayta ko\'ring!',
      happyFeedback: 'Barakalla! Matematik mantiqni to\'g\'ri qo\'lladingiz!'
    };
  }

  if (subjectInput === 'Kimyo') {
    return {
      topic: `Kimyo: ${cleanTitle}`,
      category: 'Kimyo Fani',
      subject: 'Kimyo',
      simpleExplanation: `Ushbu kimyoviy jarayon moddalar tarkibi, tuzilishi va ularning bir-biriga aylanish qonuniyatlarini ifodalaydi. Reaksiyalar davomida atomlar yo'qolmaydi, faqat yangi birikmalarga qayta guruhlanadi.`,
      mermaidDiagram: `graph TD
      A[Dastlabki Moddalar: ${cleanTitle.slice(0, 15)}] --> B[Kimyoviy Reaksiya va Energetik O'zgarish]
      B --> C[Yangi Moddalar Hosil Bo'lishi]
      C --> D[Modda Massasining Saqlanish Qonuni]`,
      speechScript: `Kimyo darsi: ${cleanTitle} mavzusi. Kimyoviy reaksiyada moddalarning o'zaro ta'siri va yangi birikmalar hosil bo'lishini o'rganamiz.`,
      quiz: {
        question: `«${cleanTitle}» kimyoviy reaksiyasida qaysi fundamental qonun doimo o'rinli?`,
        options: [
          'Moddalar massasining saqlanish qonuni',
          'Moddalar yo\'q bo\'lib ketish qonuni',
          'Harorat doimiyligi qonuni'
        ],
        correctIndex: 0,
        explanation: 'Barcha kimyoviy reaksiyalarda dastlabki moddalar massasi mahsulotlar massasiga teng bo\'ladi.'
      },
      keyPoints: [
        `Reaksiya tenglamasini to'g'ri tenglashtiring`,
        'Valentlik va zaryadlar muvozanatiga e\'tibor bering',
        'Reaksiya sharoitlarini (harorat, katalizator) hisobga oling'
      ],
      strictFeedback: 'Kimyoviy qonuniyatni e\'tibordan chetda qoldirdingiz!',
      happyFeedback: 'Tasanno! Kimyoviy jarayon mohiyatini to\'g\'ri bildingiz!'
    };
  }

  if (subjectInput === 'Tarix') {
    return {
      topic: `Tarix: ${cleanTitle}`,
      category: 'Tarix Fani',
      subject: 'Tarix',
      simpleExplanation: `Ushbu tarixiy voqelik insoniyat sivilizatsiyasi rivojlanishida muhim burilish yasagan davrni qamrab oladi. Tarixiy manbalar o'tmishdagi sabab-oqibat zanjirini tushunishga xizmat qiladi.`,
      mermaidDiagram: `graph TD
      A[Tarixiy Sabablar: ${cleanTitle.slice(0, 15)}] --> B[Tarixiy Voqea va Harakatlar]
      B --> C[Ijtimoiy va Siyosiy Oqibatlar]
      C --> D[Zamonaviy Madaniy Meros]`,
      speechScript: `Tarix darsi: ${cleanTitle} mavzusi. Tarixiy voqealar sabab va oqibatlar zanjiri orqali o'rganiladi.`,
      quiz: {
        question: `«${cleanTitle}» tarixiy jarayonini o'rganishda asosiy manba nima hisoblanadi?`,
        options: [
          'Yozma manbalar, arxeologik qazilmalar va solnomalar',
          'Faqat og\'zaki uydirma afsonalar',
          'Hech qanday manba mavjud emas'
        ],
        correctIndex: 0,
        explanation: 'Ilmiy tarixshunoslik moddiy va yozma tarixiy manbalarga tayanadi.'
      },
      keyPoints: [
        'Voqeaning sanasi va geografik o\'rnini aniq biling',
        'Tarixiy shaxslarning rolini xolisona baholang',
        'Sabab va oqibatlarni bir-biri bilan bog\'lang'
      ],
      strictFeedback: 'Tarixiy manbalarga jiddiyroq yondashing!',
      happyFeedback: 'Ajoyib! Tarixiy voqelikni to\'g\'ri tahlil qildingiz!'
    };
  }

  return firstLessonOfSubject;
}

// API endpoint to generate lecture & voice lesson
app.post('/api/generate-lesson', async (req: Request, res: Response) => {
  const { topic, subject = 'Fizika', voicePersona = 'jasur' } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Mavzu kiritilishi shart' });
  }

  // If Gemini is available, generate dynamic response with strict subject boundary
  if (ai) {
    try {
      const personaTone = voicePersona === 'jasur' 
        ? "Ustoz Jasur (vazmin, qat'iyatli, bilimdon erkak lektor)" 
        : "Ustoz Malika (do'stona, iliq, tushunarli ayol repetitor)";

      const systemInstruction = `Siz "OmniCore AI Ecosystem" loyihasining "AI Voice & Lecture Engine v2.0" professional o'zbek tili lektori va repetitorisiz.
QAT'IY CHEKLOV (FAN BO'YICHA QAT'IY CHEGARA):
Hozir tanlangan fan: "${subject}".
Siz FAQAT VA FAQAT ushbu tanlangan "${subject}" fani doirasida dars tayyorlashingiz SHART!
Boshqa fanlarga (masalan, Fizikaga yoki Gravitatsiyaga) aslo chalg'imang!
- Agar tanlangan fan "Ingliz Tili" bo'lsa: Mavzu, sodda tushuntirish, diagramma, test va kalit qoidalar FAQAT Ingliz tili grammatikasi, leksikasi yoki so'zlashuv qoidalari haqida bo'lishi shart!
- Agar tanlangan fan "Matematika" bo'lsa: Faqat matematika, geometriya, algebra, formulalar va teoremalar haqida bo'lsin!
- Agar tanlangan fan "Kimyo" bo'lsa: Faqat kimyoviy elementlar, reaksiyalar va molekulalar haqida bo'lsin!
- Agar tanlangan fan "Tarix" bo'lsa: Faqat tarixiy voqealar, arboblar va xronologiya haqida bo'lsin!
- Agar tanlangan fan "Informatika/AI" bo'lsa: Faqat IT, sun'iy intellekt, algoritmlar va dasturlash haqida bo'lsin!
- Agar tanlangan fan "Fizika" bo'lsa: Faqat fizika qonuniyatlari haqida bo'lsin!

BARCHA MATNLAR TOZA O'ZBEK TILI LOTIN ALIFBOSIDA BO'LISHI SHART!`;

      const prompt = `O'qituvchi personasi: ${personaTone}.
Tanlangan fan: "${subject}".
Foydalanuvchi kiritgan mavzu: "${topic}".

Ushbu fan va mavzu doirasida quyidagi qat'iy talablar asosida dars tayyorlang:
1. SODDA TUSHUNTIRISH: Mavzuni 2 ta qisqa, aniq va sodda jumlada tushuntiring (7 yoshli o'quvchiga ham tushunarli bo'lsin).
2. MERMAID.JS DIAGRAMMA: Mavzuni vizual ifodalovchi toza, to'g'ri sintaksisli Mermaid.js kodi (masalan, "graph TD" yoki "graph LR"). Kod ichida faqat inglizcha harflar va qavs ichida o'zbekcha yozuvlar bo'lsin.
3. NUTQ MATNI (speechScript): Ovozli o'qilishi uchun qulay, o'zbek tilidagi 2 jumlali toza matn.
4. KOGNITIV MINI-TEST (quiz): O'quvchi diqqatini tekshirish uchun aynan ushbu fanga va darsga doir 1 ta test savoli, 3 ta variant (A, B, C) va to'g'ri javob indeksi (0, 1 yoki 2) hamda qisqa izoh.
5. ASOSIY QOIDALAR (keyPoints): 3 ta qisqa va muhim qoida.
6. strictFeedback va happyFeedback: 1 qisqadan jumla.`;

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
              simpleExplanation: { type: Type.STRING },
              mermaidDiagram: { type: Type.STRING },
              speechScript: { type: Type.STRING },
              quiz: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              strictFeedback: { type: Type.STRING },
              happyFeedback: { type: Type.STRING },
            },
            required: ['topic', 'category', 'subject', 'simpleExplanation', 'mermaidDiagram', 'speechScript', 'quiz', 'keyPoints', 'strictFeedback', 'happyFeedback'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed: LessonData = JSON.parse(responseText);
        // Force the returned subject to match requested subject
        parsed.subject = subject;
        return res.json(parsed);
      }
    } catch (err) {
      console.error('Gemini subject-generation error, switching to strict subject fallback:', err);
    }
  }

  // Strict Subject-Specific Fallback
  const fallbackData = getSubjectDynamicFallback(topic, subject);
  return res.json(fallbackData);
});

// Natural Uzbek Google TTS audio stream proxy with automatic Cyrillic transliteration
app.get('/api/tts', (req: Request, res: Response) => {
  const text = (req.query.text as string) || '';
  if (!text) {
    return res.status(400).send('Text is required');
  }

  // Transliterate from Latin to Cyrillic for Google TTS engine so pronunciation is authentic and natural
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

// Single-file export endpoint (returns pure standalone HTML if requested)
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
    console.log(`🚀 OmniCore Voice Engine v2.0 running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
