// Design reminder: calm editorial service brand; even errors should offer a quiet, clear way back home.
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
export default function NotFound() { return <main className="not-found" dir="rtl"><span className="eyebrow">404 / لا توجد صفحة هنا</span><h1>يبدو أن هذه الصفحة أخذت استراحة.</h1><p>يمكنك العودة إلى الصفحة الرئيسية أو اختيار خدمة مناسبة من القائمة.</p><Link href="/" className="button">العودة للرئيسية <ArrowRight size={16} /></Link></main>; }
