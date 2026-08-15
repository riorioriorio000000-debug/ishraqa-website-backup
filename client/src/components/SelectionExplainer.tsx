import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, X } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

const Streamdown = lazy(() => import("streamdown").then((module) => ({ default: module.Streamdown })));

type SelectionState = { text: string; top: number; right: number } | null;

export default function SelectionExplainer() {
  const [selection, setSelection] = useState<SelectionState>(null);
  const [summary, setSummary] = useState("");
  const summarize = trpc.ai.summarizeSelection.useMutation({
    onSuccess: ({ summary: value }) => setSummary(value),
  });

  useEffect(() => {
    const readSelection = () => {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
      const browserSelection = window.getSelection();
      const text = browserSelection?.toString().trim() ?? "";
      if (!text || text.length > 6_000 || !browserSelection?.rangeCount) return;
      const rect = browserSelection.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      setSummary("");
      setSelection({
        text,
        top: Math.min(window.innerHeight - 64, Math.max(16, rect.bottom + 10)),
        right: Math.min(window.innerWidth - 16, Math.max(16, window.innerWidth - rect.right)),
      });
    };

    document.addEventListener("mouseup", readSelection);
    document.addEventListener("keyup", readSelection);
    return () => {
      document.removeEventListener("mouseup", readSelection);
      document.removeEventListener("keyup", readSelection);
    };
  }, []);

  if (!selection) return null;

  return (
    <aside className="selection-explainer" style={{ top: selection.top, right: selection.right }} dir="rtl" aria-live="polite">
      <div className="selection-explainer-head">
        <span><Sparkles size={15} /> شرح وتلخيص</span>
        <button type="button" onClick={() => setSelection(null)} aria-label="إغلاق"><X size={16} /></button>
      </div>
      {!summary ? (
        <button
          type="button"
          className="selection-explainer-action"
          disabled={summarize.isPending}
          onClick={() => summarize.mutate({ text: selection.text })}
        >
          {summarize.isPending ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
          {summarize.isPending ? "يفكر بالمختصر…" : "فسّر النص المحدد"}
        </button>
      ) : (
        <div className="selection-explainer-result">
          <Suspense fallback={<span>جارٍ تجهيز الشرح…</span>}><Streamdown>{summary}</Streamdown></Suspense>
        </div>
      )}
      {summarize.error && <p className="selection-explainer-error">تعذر التلخيص الآن. جرّب مرة أخرى.</p>}
    </aside>
  );
}
