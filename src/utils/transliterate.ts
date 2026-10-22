/**
 * Uzbek Latin to Cyrillic Transliteration Utility
 * Used strictly in the background for speech synthesis (SpeechSynthesisUtterance / TTS)
 * to ensure authentic and natural Uzbek pronunciation while keeping all visual UI in Latin.
 */

export function latinToCyrillicUzbek(input: string): string {
  if (!input) return '';

  let text = input;

  // 1. Compound letters with apostrophes (O', G')
  // Support standard apostrophe ', modifier letter turned comma ʻ, right single quote ’, left quote ‘
  text = text.replace(/O['ʻ‘`’]/g, 'Ў');
  text = text.replace(/o['ʻ‘`’]/g, 'ў');
  text = text.replace(/G['ʻ‘`’]/g, 'Ғ');
  text = text.replace(/g['ʻ‘`’]/g, 'ғ');

  // 2. Digraphs (Sh, Ch, Yo, Yu, Ya, Ts)
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

  // 3. Ye / ye at the beginning of words or after vowels
  text = text.replace(/(^|[\s\p{P}])Ye/gu, '$1Е');
  text = text.replace(/(^|[\s\p{P}])ye/gu, '$1е');
  text = text.replace(/([AEIOUaeiouЎў])Ye/g, '$1Е');
  text = text.replace(/([AEIOUaeiouЎў])ye/g, '$1е');

  // 4. E / e at the beginning of words should be Э / э in Uzbek Cyrillic
  text = text.replace(/(^|[\s\p{P}])E/gu, '$1Э');
  text = text.replace(/(^|[\s\p{P}])e/gu, '$1э');

  // 5. Single letters mapping
  const charMap: Record<string, string> = {
    'A': 'А', 'a': 'а',
    'B': 'Б', 'b': 'б',
    'D': 'Д', 'd': 'д',
    'E': 'Е', 'e': 'е',
    'F': 'Ф', 'f': 'ф',
    'G': 'Г', 'g': 'г',
    'H': 'Ҳ', 'h': 'ҳ',
    'I': 'И', 'i': 'и',
    'J': 'Ж', 'j': 'ж',
    'K': 'К', 'k': 'к',
    'L': 'Л', 'l': 'л',
    'M': 'М', 'm': 'м',
    'N': 'Н', 'n': 'н',
    'O': 'О', 'o': 'о',
    'P': 'П', 'p': 'п',
    'Q': 'Қ', 'q': 'қ',
    'R': 'Р', 'r': 'р',
    'S': 'С', 's': 'с',
    'T': 'Т', 't': 'т',
    'U': 'У', 'u': 'у',
    'V': 'В', 'v': 'в',
    'X': 'Х', 'x': 'х',
    'Y': 'Й', 'y': 'й',
    'Z': 'З', 'z': 'з',
    "'": 'ъ',
    "ʻ": 'ъ',
    "’": 'ъ',
    "‘": 'ъ',
    "`": 'ъ'
  };

  return text.split('').map(char => charMap[char] || char).join('');
}
