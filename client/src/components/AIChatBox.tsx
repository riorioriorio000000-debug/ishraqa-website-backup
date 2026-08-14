import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowLeft, BookOpen, CalendarCheck, Check, Edit3, FileText, ListChecks, Loader2, Paperclip, Play, Send, Share2, Sparkles, Trash2, User, Wrench, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";

/**
 * Message type matching server-side LLM Message interface
 */
export type SiteContentCard = {
  id: string;
  kind: "service" | "article" | "video" | "booking";
  title: string;
  description: string;
  href: string;
  image?: string;
  video?: string;
};

export type AssistantNavigationItem = {
  label: string;
  href: string;
};

export type SupportedAttachmentMimeType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf" | "audio/mpeg" | "audio/wav" | "audio/mp4" | "video/mp4";

export type ChatAttachment = {
  name: string;
  mimeType: SupportedAttachmentMimeType;
  size: number;
};

export type ChatAttachmentUpload = ChatAttachment & {
  dataUrl: string;
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  /** خطوات موجزة وآمنة تصف ما عالجه المساعد، ولا تكشف سلسلة التفكير الداخلية. */
  workSummary?: string[];
  /** روابط صفحات داخلية مناسبة للسؤال الحالي. */
  navigation?: readonly AssistantNavigationItem[];
  contentCards?: SiteContentCard[];
  /** بيانات وصفية فقط للمرفق؛ لا يُحفظ محتوى الملف الخام في تاريخ المحادثة المحلي. */
  attachment?: ChatAttachment;
};

function ContentCardIcon({ kind }: { kind: SiteContentCard["kind"] }) {
  if (kind === "article") return <BookOpen aria-hidden="true" className="size-4" />;
  if (kind === "video") return <Play aria-hidden="true" className="size-4" />;
  if (kind === "booking") return <CalendarCheck aria-hidden="true" className="size-4" />;
  return <Wrench aria-hidden="true" className="size-4" />;
}

export type AIChatBoxProps = {
  /**
   * Messages array to display in the chat.
   * Should match the format used by invokeLLM on the server.
   */
  messages: Message[];

  /**
   * Callback when user sends a message.
   * Typically you'll call a tRPC mutation here to invoke the LLM.
   */
  onSendMessage: (content: string, attachment?: ChatAttachmentUpload) => void;

  /**
   * Whether the AI is currently generating a response
   */
  isLoading?: boolean;

  /**
   * Placeholder text for the input field
   */
  placeholder?: string;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Height of the chat box (default: 600px)
   */
  height?: string | number;

  /**
   * Empty state message to display when no messages
   */
  emptyStateMessage?: string;

  /**
   * Suggested prompts to display in empty state
   * Click to send directly
   */
  suggestedPrompts?: string[];

  /** Optional in-chat shortcuts that prefill a request without leaving the conversation. */
  quickActions?: Array<{ label: string; prompt: string; icon?: React.ReactNode }>;

  /** يعيد تشغيل الطلب من رسالة زائر تم تعديلها، مع حذف الردود التابعة لها. */
  onEditMessage?: (messageIndex: number, content: string) => void;

  /** يحذف سجل المحادثة المحفوظ في الصفحة الحالية. */
  onClearConversation?: () => void;

  /** يضيف سياق الصفحة الحالية إلى المحادثة. */
  onShareCurrentPage?: () => void;
};

/**
 * A ready-to-use AI chat box component that integrates with the LLM system.
 *
 * Features:
 * - Matches server-side Message interface for seamless integration
 * - Markdown rendering with Streamdown
 * - Auto-scrolls to latest message
 * - Loading states
 * - Uses global theme colors from index.css
 *
 * @example
 * ```tsx
 * const ChatPage = () => {
 *   const [messages, setMessages] = useState<Message[]>([
 *     { role: "system", content: "You are a helpful assistant." }
 *   ]);
 *
 *   const chatMutation = trpc.ai.chat.useMutation({
 *     onSuccess: (response) => {
 *       // Assuming your tRPC endpoint returns the AI response as a string
 *       setMessages(prev => [...prev, {
 *         role: "assistant",
 *         content: response
 *       }]);
 *     },
 *     onError: (error) => {
 *       console.error("Chat error:", error);
 *       // Optionally show error message to user
 *     }
 *   });
 *
 *   const handleSend = (content: string) => {
 *     const newMessages = [...messages, { role: "user", content }];
 *     setMessages(newMessages);
 *     chatMutation.mutate({ messages: newMessages });
 *   };
 *
 *   return (
 *     <AIChatBox
 *       messages={messages}
 *       onSendMessage={handleSend}
 *       isLoading={chatMutation.isPending}
 *       suggestedPrompts={[
 *         "Explain quantum computing",
 *         "Write a hello world in Python"
 *       ]}
 *     />
 *   );
 * };
 * ```
 */
export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts,
  quickActions,
  onEditMessage,
  onClearConversation,
  onShareCurrentPage,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachmentUpload | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string } | null>(null);
  const [ratedResponses, setRatedResponses] = useState<Record<number, "helpful" | "needs-work">>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out system messages
  const displayMessages = messages
    .map((message, sourceIndex) => ({ message, sourceIndex }))
    .filter(({ message }) => message.role !== "system");

  // Calculate min-height for last assistant message to push user message to top
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);

  useEffect(() => {
    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const inputHeight = inputAreaRef.current.offsetHeight;
      const scrollAreaHeight = containerHeight - inputHeight;

      // Reserve space for:
      // - padding (p-4 = 32px top+bottom)
      // - user message: 40px (item height) + 16px (margin-top from space-y-4) = 56px
      // Note: margin-bottom is not counted because it naturally pushes the assistant message down
      const userMessageReservedHeight = 56;
      const calculatedHeight = scrollAreaHeight - 32 - userMessageReservedHeight;

      setMinHeightForLastMessage(Math.max(0, calculatedHeight));
    }
  }, []);

  // Scroll to bottom helper function with smooth animation
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if ((!trimmedInput && !attachment) || isLoading) return;

    const outgoingContent = trimmedInput || "اشرح محتوى المرفق بإيجاز، واذكر ما إذا كان مرتبطًا بخدمة من خدمات الإشراقة.";
    if (attachment) {
      onSendMessage(outgoingContent, attachment);
    } else {
      onSendMessage(outgoingContent);
    }
    setInput("");
    setAttachment(null);
    setAttachmentError(null);

    // Scroll immediately after sending
    scrollToBottom();

    // Keep focus on input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"]);
    if (!allowedTypes.has(file.type)) {
      setAttachment(null);
      setAttachmentError("يدعم المساعد صور JPG وPNG وWebP وملفات PDF وصوت MP3/WAV/MP4 وفيديو MP4 فقط.");
      return;
    }
    if (file.size > 5_000_000) {
      setAttachment(null);
      setAttachmentError("حجم المرفق يجب ألا يتجاوز 5 ميغابايت.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setAttachmentError("تعذر قراءة الملف من جهازك. حاول اختيار ملف آخر.");
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setAttachmentError("تعذر تجهيز المرفق للإرسال.");
        return;
      }
      setAttachment({ name: file.name.slice(0, 120), mimeType: file.type as SupportedAttachmentMimeType, size: file.size, dataUrl: reader.result });
      setAttachmentError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm",
        className
      )}
      style={{ height }}
    >
      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden" role="log" aria-live="polite" aria-relevant="additions text" aria-label="محادثة خدمة العملاء">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col p-4">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="size-12 opacity-20" />
                <p className="text-sm">{emptyStateMessage}</p>
              </div>

              {quickActions && quickActions.length > 0 && (
                <div className="flex max-w-2xl flex-wrap justify-center gap-2" aria-label="أدوات المحادثة">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        setInput(action.prompt);
                        requestAnimationFrame(() => textareaRef.current?.focus());
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onSendMessage(prompt)}
                      disabled={isLoading}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-4 p-4">
              {displayMessages.map(({ message, sourceIndex }, index) => {
                // Apply min-height to last message only if NOT loading (when loading, the loading indicator gets it)
                const isLastMessage = index === displayMessages.length - 1;
                const shouldApplyMinHeight =
                  isLastMessage && !isLoading && minHeightForLastMessage > 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === "user"
                        ? "justify-end items-start"
                        : "justify-start items-start"
                    )}
                    style={
                      shouldApplyMinHeight
                        ? { minHeight: `${minHeightForLastMessage}px` }
                        : undefined
                    }
                  >
                    {message.role === "assistant" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2.5",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <>
                          {message.workSummary && message.workSummary.length > 0 && (
                            <aside className="mb-3 rounded-xl border border-teal-900/10 bg-white/65 p-3 text-right" aria-label="ملخص ما عالجه المساعد">
                              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-teal-900"><ListChecks aria-hidden="true" className="size-3.5" /> ملخص ما تم</div>
                              <ol className="space-y-1.5 pr-4 text-xs leading-5 text-slate-600 marker:text-teal-700">
                                {message.workSummary.map((step, stepIndex) => <li key={`${sourceIndex}-${stepIndex}`}>{step}</li>)}
                              </ol>
                            </aside>
                          )}
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                          {message.contentCards && message.contentCards.length > 0 && (
                            <div className="mt-4 grid gap-2" aria-label="روابط مقترحة من موقع الإشراقة">
                              {message.contentCards.map((card) => (
                                <a
                                  key={card.id}
                                  href={card.href}
                                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-teal-900/10 bg-white/80 p-2.5 text-right no-underline transition hover:-translate-y-0.5 hover:border-teal-800/25 hover:bg-white"
                                >
                                  {card.video ? (
                                    <video className="size-14 shrink-0 rounded-lg bg-teal-50 object-cover" src={card.video} muted loop autoPlay playsInline aria-label={card.title} />
                                  ) : card.image ? (
                                    <img className="size-14 shrink-0 rounded-lg bg-teal-50 object-contain p-1" src={card.image} alt="" aria-hidden="true" />
                                  ) : (
                                    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800"><ContentCardIcon kind={card.kind} /></span>
                                  )}
                                  <span className="min-w-0 flex-1">
                                    <span className="mb-0.5 flex items-center gap-1 text-xs font-semibold text-teal-800"><ContentCardIcon kind={card.kind} /> {card.kind === "article" ? "مقالة" : card.kind === "video" ? "مرئي" : card.kind === "booking" ? "الحجز" : "خدمة"}</span>
                                    <strong className="block truncate text-sm text-slate-900">{card.title}</strong>
                                    <span className="block line-clamp-2 text-xs leading-5 text-slate-600">{card.description}</span>
                                  </span>
                                  <ArrowLeft aria-hidden="true" className="size-4 shrink-0 text-teal-800 transition group-hover:-translate-x-0.5" />
                                </a>
                              ))}
                            </div>
                          )}
                          {message.navigation && message.navigation.length > 0 && (
                            <nav className="mt-3 flex flex-wrap gap-2" aria-label="صفحات مقترحة من موقع الإشراقة">
                              {message.navigation.map((item) => (
                                <a key={item.href} href={item.href} className="inline-flex items-center gap-1 rounded-full border border-teal-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900 no-underline transition hover:-translate-y-0.5 hover:border-teal-800/30 hover:bg-teal-50">
                                  {item.label}<ArrowLeft aria-hidden="true" className="size-3.5" />
                                </a>
                              ))}
                            </nav>
                          )}
                          <div className="mt-3 flex items-center gap-1 border-t border-teal-900/10 pt-2" aria-label="تقييم رد المساعد">
                            <span className="ml-1 text-[11px] text-slate-500">هل كان الرد مفيدًا؟</span>
                            <button type="button" onClick={() => setRatedResponses((current) => ({ ...current, [sourceIndex]: "helpful" }))} className={cn("rounded-md px-2 py-1 text-xs transition", ratedResponses[sourceIndex] === "helpful" ? "bg-teal-100 font-semibold text-teal-900" : "text-slate-500 hover:bg-white")} aria-label="هذا الرد مفيد">نعم</button>
                            <button type="button" onClick={() => setRatedResponses((current) => ({ ...current, [sourceIndex]: "needs-work" }))} className={cn("rounded-md px-2 py-1 text-xs transition", ratedResponses[sourceIndex] === "needs-work" ? "bg-amber-100 font-semibold text-amber-900" : "text-slate-500 hover:bg-white")} aria-label="هذا الرد يحتاج تحسينًا">ليس تمامًا</button>
                            {ratedResponses[sourceIndex] && <Check aria-label="تم حفظ تقييمك في هذه الجلسة" className="mr-auto size-3.5 text-teal-700" />}
                          </div>
                        </>
                      ) : (
                        editingMessage?.index === sourceIndex ? (
                          <div className="min-w-56 space-y-2">
                            <Textarea value={editingMessage.content} onChange={(event) => setEditingMessage({ index: sourceIndex, content: event.target.value })} aria-label="تعديل رسالتك" className="min-h-20 bg-white text-slate-900" />
                            <div className="flex items-center gap-2">
                              <button type="button" className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold transition hover:bg-white/30" onClick={() => setEditingMessage(null)}>إلغاء</button>
                              <button type="button" className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-teal-900 transition hover:bg-teal-50" onClick={() => {
                                const content = editingMessage.content.trim();
                                if (!content) return;
                                onEditMessage?.(sourceIndex, content);
                                setEditingMessage(null);
                              }}>إرسال التعديل</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                            {message.attachment && <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-xs text-primary-foreground"><FileText aria-hidden="true" className="size-3.5 shrink-0" /><span className="truncate">{message.attachment.name}</span></span>}
                            {onEditMessage && <button type="button" onClick={() => setEditingMessage({ index: sourceIndex, content: message.content })} className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-primary-foreground/80 transition hover:bg-white/10 hover:text-primary-foreground" aria-label="تعديل رسالتك"><Edit3 aria-hidden="true" className="size-3" /> تعديل الرسالة</button>}
                          </>
                        )
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                        <User className="size-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div
                  className="flex items-start gap-3"
                  style={
                    minHeightForLastMessage > 0
                      ? { minHeight: `${minHeightForLastMessage}px` }
                      : undefined
                  }
                >
                  <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="ai-thinking flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                    <img src="/manus-storage/ai-loading_4a219f05.gif" alt="" aria-hidden="true" className="size-8 object-contain" />
                    <span>يتحقق المساعد من التفاصيل…</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      {(onShareCurrentPage || (onClearConversation && displayMessages.length > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-background/35 px-4 py-2">
          <span className="text-xs text-muted-foreground">أدوات المحادثة</span>
          <div className="flex items-center gap-1">
            {onShareCurrentPage && <button type="button" onClick={onShareCurrentPage} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-50 disabled:opacity-50"><Share2 aria-hidden="true" className="size-3.5" /> مشاركة هذه الصفحة</button>}
            {onClearConversation && displayMessages.length > 0 && <button type="button" onClick={onClearConversation} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"><Trash2 aria-hidden="true" className="size-3.5" /> حذف السجل</button>}
          </div>
        </div>
      )}
      <form
        ref={inputAreaRef}
        onSubmit={handleSubmit}
        className="flex gap-2 p-4 border-t bg-background/50 items-end"
      >
        <div className="min-w-0 flex-1 space-y-2">
          {attachment && <div className="flex items-center justify-between gap-2 rounded-lg border border-teal-900/10 bg-teal-50/65 px-2.5 py-1.5 text-xs text-teal-950"><span className="flex min-w-0 items-center gap-1.5"><FileText aria-hidden="true" className="size-3.5 shrink-0" /><span className="truncate">{attachment.name}</span><small className="shrink-0 text-teal-800/70">({Math.max(1, Math.ceil(attachment.size / 1024))} كيلوبايت)</small></span><button type="button" onClick={() => setAttachment(null)} className="rounded p-0.5 text-teal-900 transition hover:bg-teal-100" aria-label="إزالة المرفق"><X aria-hidden="true" className="size-3.5" /></button></div>}
          {attachmentError && <p className="text-xs text-rose-700" role="alert">{attachmentError}</p>}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="اكتب سؤالك لخدمة العملاء"
            className="max-h-32 min-h-9 resize-none"
            rows={1}
          />
        </div>
        <input ref={fileInputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/wav,audio/mp4,video/mp4" onChange={handleAttachmentSelect} />
        <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label="إرفاق صورة أو فيديو أو ملف" className="h-[38px] w-[38px] shrink-0"><Paperclip className="size-4" /></Button>
        <Button
          type="submit"
          size="icon"
          disabled={(!input.trim() && !attachment) || isLoading}
          aria-label={isLoading ? "المساعد يعالج سؤالك" : "إرسال السؤال"}
          className="shrink-0 h-[38px] w-[38px]"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
