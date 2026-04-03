// Forbidden words filter for task moderation
// Includes Russian, English, and Uzbek

export const forbiddenWords = [
  // Russian
  'наркотик', 'наркотики', 'наркота', 'дурь', 'трава', 'кокаин', 'героин',
  'оружие', 'пистолет', 'автомат', 'взрывчатка', 'бомба',
  'убить', 'убийство', 'насилие', 'изнасилование',
  'террорист', 'терроризм', 'экстремизм',
  
  // English
  'drug', 'drugs', 'cocaine', 'heroin', 'weed', 'marijuana',
  'weapon', 'gun', 'pistol', 'rifle', 'bomb', 'explosive',
  'kill', 'murder', 'violence', 'rape',
  'terrorist', 'terrorism', 'extremism',
  
  // Uzbek (without apostrophes to avoid syntax errors)
  'giyohvand', 'narkotik', 'dorivor',
  'qurol', 'toppa', 'avtomat', 'bomba',
  'oldir', 'oldirish', 'zoravonlik',
  'terror', 'terrorizm',
];

export function filterKeywords(text: string): { isValid: boolean; foundWords: string[] } {
  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];
  
  for (const word of forbiddenWords) {
    if (lowerText.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }
  
  return {
    isValid: foundWords.length === 0,
    foundWords,
  };
}

export function getSafetyMessage(language: 'en' | 'ru' | 'uz'): string {
  return language === 'ru'
    ? 'This task violates our community guidelines / Задача нарушает правила сообщества'
    : 'This task violates our community guidelines / Задача нарушает правила сообщества';
}
