import ContentGuard from "@/components/ContentGuard";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import RouteScrollTop from "./components/RouteScrollTop";
import { SiteShareProvider } from "./components/SiteShareDialog";

const NotFound = lazy(() => import("@/pages/NotFound"));
const ArticleDetailPage = lazy(() => import("@/pages/ArticleDetail"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const ServicesPage = lazy(() => import("@/pages/StaticPage").then(({ ServicesPage }) => ({ default: ServicesPage })));
const ArticlesPage = lazy(() => import("@/pages/StaticPage").then(({ ArticlesPage }) => ({ default: ArticlesPage })));
const CoveragePage = lazy(() => import("@/pages/StaticPage").then(({ CoveragePage }) => ({ default: CoveragePage })));
const AboutPage = lazy(() => import("@/pages/StaticPage").then(({ AboutPage }) => ({ default: AboutPage })));
const FaqPage = lazy(() => import("@/pages/StaticPage").then(({ FaqPage }) => ({ default: FaqPage })));
const ServiceCityPage = lazy(() => import("@/pages/ServiceCityPage"));
const OurWorkPage = lazy(() => import("@/pages/OurWorkPage"));

function PageLoader() {
  return <main className="route-loading" role="status" aria-live="polite"><span className="route-loading-indicator" aria-hidden="true" /><span>جارٍ تجهيز الصفحة...</span></main>;
}

function Router() {
  return <Suspense fallback={<PageLoader />}><Switch><Route path="/" component={Home} /><Route path="/home" component={Home} /><Route path="/our-work" component={OurWorkPage} /><Route path="/services/:serviceSlug/:citySlug" component={ServiceCityPage} /><Route path="/services" component={ServicesPage} /><Route path="/articles" component={ArticlesPage} /><Route path="/articles/:slug" component={ArticleDetailPage} /><Route path="/where-we-work" component={CoveragePage} /><Route path="/about" component={AboutPage} /><Route path="/faq" component={FaqPage} /><Route path="/privacy" component={PrivacyPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
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
          <SiteShareProvider>
            <ContentGuard />
            <RouteScrollTop />
            <Router />
          </SiteShareProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
