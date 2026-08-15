export function browseFailureMessage(errorMessage?: string) {
  const detail = errorMessage?.trim() || "تأكد أن الرابط عام ويشير إلى صفحة HTML ثم حاول مجددًا.";
  return `تعذر تلخيص الرابط الآن. ${detail}`;
}
