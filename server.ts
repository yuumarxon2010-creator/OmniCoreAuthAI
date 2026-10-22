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

// Multi-subject rich presets for instant high-fidelity responses
const SUBJECT_PRESETS: Record<string, Record<string, LessonData>> = {
  'Fizika': {
    'gravitatsiya': {
      topic: 'Fizika: Butunjahon Gravitatsiya Qonuni',
      category: 'Fizika',
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
    }
  },
  'Ingliz Tili': {
    'present_perfect': {
      topic: 'Ingliz Tili: Present Perfect Tense va Natijaviylik',
      category: 'Grammatika',
      subject: 'Ingliz Tili',
      simpleExplanation: 'Present Perfect zamoni (have/has + V3) o\'tmishda sodir bo\'lgan, ammo natijasi aynan hozirgi lahzada ko\'rinib turgan yoki tajribani ifodalovchi harakatlar uchun ishlatiladi. Masalan, «I have lost my key» jumlasi kalitning o\'tmishda yo\'qolgani va hozir ham uyga kira olmaslik natijasini bildiradi.',
      mermaidDiagram: `graph LR
      A[O'tmishdagi Harakat] -->|Ko'prik: have/has + V3| B[Hozirgi Natija Present Result]
      B --> C[Kutilgan Holat / Tajriba]
      C --> D[Signal so'zlar: already, just, yet, ever]`,
      speechScript: 'Present Perfect zamoni o\'tmishdagi harakatning hozirgi paytga bog\'liq natijasini ko\'rsatadi. Have yoki has yordamchi fe\'li va fe\'lning uchinchi shakli orqali yasaladi.',
      quiz: {
        question: '«She ______ already finished her homework.» bo\'sh o\'ringa to\'g\'ri yordamchi fe\'lni qo\'ying:',
        options: ['has', 'have', 'is'],
        correctIndex: 0,
        explanation: 'Ingliz tilida 3-shaxs birlik (He, She, It) uchun Present Perfect da «has» yordamchi fe\'li ishlatiladi.'
      },
      keyPoints: [
        'Formula: Subject + have/has + Past Participle (V3)',
        'Past Simple aniq vaqtni (yesterday), Present Perfect esa hozirgi natijani ta\'kidlaydi',
        'Signal so\'zlar: already, just, never, ever, yet, recently'
      ],
      strictFeedback: 'Diqqatsizlik! «She» olmoshidan keyin «have» emas, «has» yordamchi fe\'li qo\'yiladi!',
      happyFeedback: 'Excellent! Siz 3-shaxs birlik uchun «has» fe\'li qoidasini a\'lo darajada o\'zlashtirdingiz!'
    }
  }
};

function getFallbackForSubject(topicInput: string, subjectInput: string): LessonData {
  const normTopic = topicInput.toLowerCase();
  const subjMap = SUBJECT_PRESETS[subjectInput] || SUBJECT_PRESETS['Fizika'];

  for (const [key, lesson] of Object.entries(subjMap)) {
    if (normTopic.includes(key)) {
      return lesson;
    }
  }

  // Check any subject match
  for (const [, lessons] of Object.entries(SUBJECT_PRESETS)) {
    for (const [key, lesson] of Object.entries(lessons)) {
      if (normTopic.includes(key)) {
        return { ...lesson, subject: subjectInput };
      }
    }
  }

  // Generative fallback
  const cleanTitle = topicInput.trim() || 'Fundamental Fan Mavzusi';
  return {
    topic: `${subjectInput}: ${cleanTitle}`,
    category: subjectInput,
    subject: subjectInput,
    simpleExplanation: `${cleanTitle} — ${subjectInput} fanining asosiy yo'nalishlaridan biri bo'lib, uning mohiyati jarayonlarning o'zaro tizimli bog'liqligini tushunishga asoslanadi. Ushbu mavzuni o'rganish orqali fanning tub qonuniyatlarini chuqur anglash mumkin bo'ladi.`,
    mermaidDiagram: `graph TD
    A[Boshlang'ich Holat: ${cleanTitle.slice(0, 15)}] --> B[Asosiy Mexanizm va Kuch]
    B --> C[Ichki Jarayonlar va Bog'liqlik]
    C --> D[Kutilgan Natija va Amaliyot]`,
    speechScript: `${cleanTitle} — ${subjectInput} fanining muhim mavzusidir. Uning asosiy mohiyati sabab va oqibatlarning o'zaro muvozanatida namoyon bo'ladi.`,
    quiz: {
      question: `${cleanTitle} mavzusida o'rganilgan asosiy qoidaning mohiyati nimada?`,
      options: [
        'Sabab va oqibatlar orasidagi fundamental qonuniyatda',
        'Faqat tashqi tasodifiy omillarga bog\'liqlikda',
        'Hech qanday o\'zgarish sodir bo\'lmasligida'
      ],
      correctIndex: 0,
      explanation: 'Barcha ilmiy va texnik tizimlarda hodisalar fundamental sabab-oqibat mexanizmlari orqali ishlaydi.'
    },
    keyPoints: [
      `1-Qoida: ${cleanTitle} tizimida energiya va axborot saqlanishi muhimdir`,
      '2-Qoida: Tizim elementlari doimiy dinamik muvozanatda ishlaydi',
      '3-Qoida: Nazariyani doimo amaliy tajribalar mustahkamlaydi'
    ],
    strictFeedback: 'E\'tibor bering! Fundamental sabab-oqibat qonuniyatini e\'tibordan chetda qoldirdingiz!',
    happyFeedback: 'Tasanno! Mavzuni tushunish darajangiz juda yuqori!'
  };
}

// API endpoint to generate lecture & voice lesson
app.post('/api/generate-lesson', async (req: Request, res: Response) => {
  const { topic, subject = 'Fizika', voicePersona = 'jasur' } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Mavzu kiritilishi shart' });
  }

  // If Gemini is available, generate dynamic response with gemini-3.8-flash
  if (ai) {
    try {
      const personaTone = voicePersona === 'jasur' 
        ? "Ustoz Jasur (vazmin, qat'iyatli, bilimdon erkak lektor)" 
        : "Ustoz Malika (do'stona, iliq, tushunarli ayol repetitor)";

      const prompt = `Siz "OmniCore AI Ecosystem" loyihasining "AI Voice & Lecture Engine v2.0" professional o'zbek tili lektori va repetitorisiz.
O'qituvchi personasi: ${personaTone}.
Tanlangan fan: "${subject}".
Foydalanuvchi quyidagi mavzuni o'rganmoqchi: "${topic}".

Ushbu mavzu bo'yicha to'liq o'zbek tilida (lotin yozuvida) quyidagi qat'iy talablar asosida dars tayyorlang:
1. SODDA TUSHUNTIRISH: Mavzuni 2 ta qisqa, aniq va sodda jumlada tushuntiring (oddiy 7 yoshli o'quvchiga ham tushunarli bo'lsin).
2. MERMAID.JS DIAGRAMMA: Mavzuni vizual ifodalovchi toza, to'g'ri sintaksisli Mermaid.js kodi (masalan, "graph TD" yoki "graph LR" bilan boshlanuvchi). Kod ichida faqat inglizcha harflar va qavs ichida o'zbekcha yozuvlar bo'lsin, belgilar xatosiz bo'lsin.
3. NUTQ MATNI (speechScript): Web Speech API (uz-UZ) da va Google TTS da chiroyli, baland va intonatsiya bilan o'qilishi uchun qulay, o'zbek tilidagi 2 jumlali toza matn.
4. KOGNITIV MINI-TEST (quiz): O'quvchi diqqatini tekshirish uchun aynan ushbu darsga doir 1 ta test savoli, 3 ta variant (A, B, C) va to'g'ri javob indeksi (0, 1 yoki 2) hamda qisqa tushunarli izoh.
5. ASOSIY QOIDALAR (keyPoints): 3 ta qisqa va muhim qoida/formula.
6. AVATAR EMOTIONAL FEEDBACK:
   - strictFeedback: O'quvchi testda xato qilganda Goprep.gg kabi jiddiy qosh chimirib aytiladigan qat'iy ogohlantirish (1 qisqa jumla).
   - happyFeedback: O'quvchi to'g'ri javob berganda tabassum bilan aytiladigan maqtov (1 qisqa jumla).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
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
        return res.json(parsed);
      }
    } catch (err) {
      console.error('Gemini generation error, switching to cognitive fallback:', err);
    }
  }

  // Fallback to local intelligent knowledge engine
  const fallbackData = getFallbackForSubject(topic, subject);
  return res.json(fallbackData);
});

// Natural Uzbek Google TTS audio stream proxy
app.get('/api/tts', (req: Request, res: Response) => {
  const text = (req.query.text as string) || '';
  if (!text) {
    return res.status(400).send('Text is required');
  }

  // Truncate to reasonable TTS length if needed
  const cleanText = encodeURIComponent(text.slice(0, 250));
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
