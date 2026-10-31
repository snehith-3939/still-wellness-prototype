// Deliberately deterministic adapters. They make the prototype runnable without keys.
export function replyTo(text) {
  const t = text.toLowerCase();
  if (/\b(suicide|suicidal|self.harm|kill myself|hurt myself)\b/.test(t)) return { kind: 'support', text: 'This demo cannot assess risk or provide crisis support. If you might act on these thoughts or are in immediate danger, contact local emergency services or a trusted person who can stay with you. The Care page explains the demo’s limitations.' };
  if (/stress|overwhelm|work/.test(t)) return { kind: 'reflection', text: 'Let’s make a little room. What is one task you could make smaller today? You can also try a short focus session in Wellness.' };
  if (/relationship|partner|listen/.test(t)) return { kind: 'duo', text: 'Try this gentle opener: “One thing I would like you to understand is…” Duo gives you a local, two-speaker space to practise taking turns.' };
  if (/feature|test|demo|how/.test(t)) return { kind: 'orientation', text: 'You can try an energy check-in, write a journal entry, explore self-care tools, read a short lesson, or simulate a booking. This response comes from a local rule, not an AI model.' };
  return { kind: 'journal', text: 'Thanks for making a little space for yourself. What is one thing you would like to carry into the rest of today? If writing helps, the Journal has three gentle prompts.' };
}
export function duoReflection(messages) {
  const roles = new Set(messages.map(m => m.speaker));
  return roles.size < 2 ? 'Give both people a turn. Try naming a need without guessing the other person’s intention.' : 'Both perspectives have a place here. Each person can reflect back one thing they heard before suggesting a next step. This is a fixed practice prompt, not relationship analysis.';
}
export function createAmbient() {
  let context = null;
  return {
    async start() {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) throw new Error('Audio is unavailable in this browser.');
      const ctx = new Audio(); context = ctx;
      try {
        await ctx.resume();
        if (context !== ctx) return;
        const gain = ctx.createGain(); gain.gain.value = 0.025; gain.connect(ctx.destination);
        [174, 261].forEach(f => { const oscillator = ctx.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = f; oscillator.connect(gain); oscillator.start(); });
      } catch (error) { if (context === ctx) context = null; await ctx.close(); throw error; }
    },
    stop() { const ctx = context; context = null; if (ctx) void ctx.close(); }
  };
}
