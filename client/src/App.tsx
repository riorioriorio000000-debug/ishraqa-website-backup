import ContentGuard from "@/components/ContentGuard";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import RouteScrollTop from "./components/RouteScrollTop";

const NotFound = lazy(() => import("@/pages/NotFound"));
const CustomerService = lazy(() => import("@/pages/CustomerService"));
const ArticleDetailPage = lazy(() => import("@/pages/ArticleDetail"));
const ServiceCalculator = lazy(() => import("@/pages/ServiceCalculator"));
const ServicesPage = lazy(() => import("@/pages/StaticPage").then((module) => ({ default: module.ServicesPage })));
const BookingPage = lazy(() => import("@/pages/StaticPage").then((module) => ({ default: module.BookingPage })));
const ArticlesPage = lazy(() => import("@/pages/StaticPage").then((module) => ({ default: module.ArticlesPage })));
const CoveragePage = lazy(() => import("@/pages/StaticPage").then((module) => ({ default: module.CoveragePage })));
const AboutPage = lazy(() => import("@/pages/StaticPage").then((module) => ({ default: module.AboutPage })));
const FaqPage = lazy(() => import("@/pages/StaticPage").then((module) => ({ default: module.FaqPage })));

function PageLoader() {
  return <main className="route-loading" role="status" aria-live="polite"><video className="route-loading-video" src="/manus-storage/loader-reference_77ede9ac.webm" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" /><span>جارٍ تجهيز الصفحة...</span></main>;
}

function Router() {
  return <Suspense fallback={<PageLoader />}><Switch><Route path="/" component={Home} /><Route path="/services" component={ServicesPage} /><Route path="/booking" component={BookingPage} /><Route path="/calculator" component={ServiceCalculator} /><Route path="/articles" component={ArticlesPage} /><Route path="/articles/:slug" component={ArticleDetailPage} /><Route path="/where-we-work" component={CoveragePage} /><Route path="/about" component={AboutPage} /><Route path="/faq" component={FaqPage} /><Route path="/customer-service" component={CustomerService} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <ContentGuard />
          <RouteScrollTop />
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
