const VISITOR_STORAGE_KEY = "ishraqa-anonymous-visitor";

export function getAnonymousVisitorId() {
  const known = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (known) return known;
  const created = crypto.randomUUID();
  localStorage.setItem(VISITOR_STORAGE_KEY, created);
  return created;
}
