/** نغمة متصفح قصيرة للردود الجديدة؛ لا تتطلب ملفًا صوتيًا أو أي طلب شبكة. */
let notificationAudioContext: AudioContext | undefined;

export function shouldPlayReplyNotificationSound(previousReplyId: number | undefined, latestReplyId: number | null | undefined, replySoundEnabled: boolean) {
  return Boolean(replySoundEnabled && previousReplyId !== undefined && latestReplyId && latestReplyId > previousReplyId);
}

function getAudioContext() {
  if (typeof window === "undefined") return undefined;
  notificationAudioContext ??= new AudioContext();
  return notificationAudioContext;
}

export async function primeReplyNotificationSound() {
  const context = getAudioContext();
  if (context?.state === "suspended") await context.resume();
}

export async function playReplyNotificationSound() {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") await context.resume();
  const startedAt = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startedAt);
  gain.gain.exponentialRampToValueAtTime(0.055, startedAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.26);
  gain.connect(context.destination);
  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const offset = index * 0.11;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startedAt + offset);
    oscillator.connect(gain);
    oscillator.start(startedAt + offset);
    oscillator.stop(startedAt + offset + 0.14);
  });
}
