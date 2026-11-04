export function speakEnglish(text: string, rate = 0.85): boolean {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.onerror = event => { if(event.error !== 'interrupted' && event.error !== 'canceled') window.dispatchEvent(new Event('english-audio-error')); };
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(v => v.lang === 'en-US' && /Samantha|Google|Aria|Jenny/i.test(v.name)) ?? voices.find(v => v.lang === 'en-US') ?? voices.find(v => /^en/i.test(v.lang)) ?? null;
  window.speechSynthesis.speak(utterance);
  return true;
}
export function stopSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
