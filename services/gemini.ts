// services/gemini.ts
/**
 * SholpyAI – Gemini API интеграциясы
 * 
 * Қолдау көрсетілетін модельдердің толық тізімі, қате жағдайларын өңдеу,
 * тест сұрақтарын генерациялау және тақырыптық чат.
 */

export type GeminiModel =
  | 'gemini-3.1-pro-preview-customtools'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-001'
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.0-flash-lite-001'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-flash-8b'
  | 'gemini-3.1-flash-lite-preview'
  | 'gemini-3-flash-preview'
  | 'gemini-flash-latest';

export interface GeminiRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  model?: GeminiModel;
}

export interface GeminiResponse {
  text: string;
  modelUsed: GeminiModel;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

/**
 * Модельдердің басымдық тізімі – алдымен жылдам әрі үнемді Flash модельдер.
 */
const MODEL_FALLBACK_ORDER: GeminiModel[] = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-3-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-3.1-pro-preview',
  'gemini-3.1-pro-preview-customtools',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
  'gemini-flash-latest',
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Негізгі сұрау функциясы. Берілген модельдер тізімін ретімен сынап,
 * бірінші жұмыс істеген модельдің нәтижесін қайтарады.
 * 429 (квота таусылды) және 503 (қызмет қолжетімсіз) қателері кезінде
 * келесі модельге өтеді.
 */
export async function generateWithGemini(req: GeminiRequest): Promise<GeminiResponse> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in .env (use EXPO_PUBLIC_GEMINI_API_KEY)');
  }

  const {
    prompt,
    systemInstruction,
    temperature = 0.7,
    maxOutputTokens = 256,
    topP,
    topK,
  } = req;

  const models = req.model ? [req.model] : MODEL_FALLBACK_ORDER;
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      if (model !== models[0]) await sleep(200);

      const url = `${BASE_URL}/${model}:generateContent?key=${API_KEY}`;
      const contents: any[] = [];
      if (systemInstruction) {
        contents.push({ role: 'user', parts: [{ text: systemInstruction }] });
      }
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const generationConfig: any = { temperature, maxOutputTokens };
      if (topP !== undefined) generationConfig.topP = topP;
      if (topK !== undefined) generationConfig.topK = topK;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // 429 – квота бітті, 503 – сервис уақытша қолжетімсіз
        if (response.status === 429 || response.status === 503) {
          console.warn(`Model ${model} ${response.status === 429 ? 'quota exceeded' : 'unavailable'}, trying next...`);
          lastError = new Error(`${response.status}: ${errorText}`);
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      if (!candidate) {
        throw new Error('No candidates in response');
      }

      const text = candidate.content?.parts?.[0]?.text || '';
      if (!text) {
        throw new Error('Empty response text');
      }

      return { text, modelUsed: model, usageMetadata: data.usageMetadata };
    } catch (error) {
      console.warn(`Model ${model} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

// ----------------------------------------------------------------------
// Тест сұрақтарын генерациялау (10 сұрақ)
// ----------------------------------------------------------------------

const QUIZ_SYSTEM = `Сен – қазақ әдебиетінің маманы. Мағжан Жұмабаевтың «Шолпы» өлеңі бойынша 10 сұрақтан тұратын тест дайында.
Әр сұрақ 4 нұсқадан тұрады. JSON массиві:
[{"id":1,"question":"...","options":["...",...],"correctOptionIndex":0,"explanation":"..."}]
Тек JSON жаз, басқа ештеңе жазба.`;

function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match) return match[1].trim();

  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1).trim();
  }

  return text.trim();
}

function safeParseJsonArray(str: string): any[] {
  try {
    return JSON.parse(str);
  } catch {
    if (!str.endsWith(']')) str += ']';
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  }
}

export async function generateQuizQuestions(count: number = 10): Promise<QuizQuestion[]> {
  try {
    const resp = await generateWithGemini({
      prompt: `«Шолпы» өлеңі және Мағжан Жұмабаев туралы ${count} тест сұрағын генерацияла.`,
      systemInstruction: QUIZ_SYSTEM,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const json = extractJson(resp.text);
    const arr = safeParseJsonArray(json);
    if (!arr.length) throw new Error('Empty array');

    return arr.slice(0, count).map((q: any, i: number) => ({
      id: q.id ?? i + 1,
      question: q.question || '',
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      explanation: q.explanation || '',
    }));
  } catch (error) {
    console.warn('Quiz generation failed, using fallback', error);
    return getFallbackQuestions();
  }
}

function getFallbackQuestions(): QuizQuestion[] {
  return [
    { id: 1, question: '«Шолпы» кімнің өлеңі?', options: ['Абай', 'Мағжан', 'Мұқағали', 'Сәкен'], correctOptionIndex: 1, explanation: 'Мағжан Жұмабаев жазған.' },
    { id: 2, question: 'Шолпы нені білдіреді?', options: ['Байлық', 'Пәктік пен әдеп', 'Күш', 'Билік'], correctOptionIndex: 1, explanation: 'Қыз баланың әдептілігі мен тазалығы.' },
    { id: 3, question: 'Мағжан қай жылы туған?', options: ['1889', '1893', '1900', '1905'], correctOptionIndex: 1, explanation: '1893 жылы дүниеге келген.' },
    { id: 4, question: 'Өлеңде шолпы несімен ерекшеленеді?', options: ['Салмағы', 'Сыңғыры', 'Түсі', 'Пішіні'], correctOptionIndex: 1, explanation: 'Сыңғырлаған дыбысы.' },
    { id: 5, question: 'Мағжан қай партияның мүшесі?', options: ['Алаш', 'Большевик', 'Кадет', 'Эсер'], correctOptionIndex: 0, explanation: 'Алаш партиясының белсенді мүшесі.' },
    { id: 6, question: '«Шолпы» өлеңі қай жылы жазылған?', options: ['1912', '1922', '1930', '1940'], correctOptionIndex: 1, explanation: '1922 жылы жазылған.' },
    { id: 7, question: 'Шолпы қандай материалдан жасалады?', options: ['Алтын', 'Күміс', 'Қола', 'Темір'], correctOptionIndex: 1, explanation: 'Негізінен күмістен жасалады.' },
    { id: 8, question: 'Мағжанның «Шолпы» өлеңі қандай лирикаға жатады?', options: ['Махаббат', 'Табиғат', 'Сыршыл', 'Философиялық'], correctOptionIndex: 2, explanation: 'Сыршыл лирика.' },
    { id: 9, question: 'Шолпы дыбысы нені еске салады?', options: ['Жел', 'Бұлақ', 'Құс', 'Жаңбыр'], correctOptionIndex: 1, explanation: 'Сылдырлап аққан бұлақты.' },
    { id: 10, question: 'Мағжан Жұмабаев қайда оқыған?', options: ['Уфа', 'Орынбор', 'Семей', 'Ташкент'], correctOptionIndex: 0, explanation: 'Уфадағы «Ғалия» медресесінде оқыған.' },
  ];
}

// ----------------------------------------------------------------------
// Чат (тақырып шектеуімен)
// ----------------------------------------------------------------------

const CHAT_SYSTEM = `Сен – SholpyAI көмекшісі. Саған қойылатын сұрақтар тек Мағжан Жұмабаевтың өмірі, шығармашылығы, «Шолпы» өлеңі, оның тәрбиелік мәні, ұлттық болмысы және қазақ әдебиетіндегі орны туралы болуы керек.
Мағжанның туған жылы, білімі, қайда оқығаны, қандай шығармалары бар – мұның бәрі рұқсат етілген сұрақтар.
Егер сұрақ мүлдем басқа тақырыпта болса (мысалы, ауа райы, спорт, саясат), онда «Кешіріңіз, мен тек Мағжан Жұмабаев және «Шолпы» өлеңі туралы сұрақтарға жауап бере аламын» деп жауап бер.
Қазақша жауап бер. Жауап қысқа, бірақ мазмұнды болсын.`;

export async function chatWithGemini(userMsg: string): Promise<string> {
  const resp = await generateWithGemini({
    prompt: userMsg,
    systemInstruction: CHAT_SYSTEM,
    temperature: 0.4,
    maxOutputTokens: 512,
  });
  return resp.text;
}