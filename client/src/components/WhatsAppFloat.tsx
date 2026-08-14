import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float"
      href="https://wa.me/966509614797"
      target="_blank"
      rel="noreferrer"
      aria-label="التواصل عبر واتساب"
      title="تواصل عبر واتساب"
    >
      <MessageCircle size={23} aria-hidden="true" />
      <span>واتساب</span>
    </a>
  );
}
