import ContentGuard from "@/components/ContentGuard";
import SelectionExplainer from "@/components/SelectionExplainer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import CustomerService from "@/pages/CustomerService";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AboutPage, ArticlesPage, BookingPage, CoveragePage, FaqPage, ServicesPage } from "./pages/StaticPage";
import ArticleDetailPage from "./pages/ArticleDetail";
import ServiceCalculator from "./pages/ServiceCalculator";
import RouteScrollTop from "./components/RouteScrollTop";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/services" component={ServicesPage} /><Route path="/booking" component={BookingPage} /><Route path="/calculator" component={ServiceCalculator} /><Route path="/articles" component={ArticlesPage} /><Route path="/articles/:slug" component={ArticleDetailPage} /><Route path="/where-we-work" component={CoveragePage} /><Route path="/about" component={AboutPage} /><Route path="/faq" component={FaqPage} /><Route path="/customer-service" component={CustomerService} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }

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
          <SelectionExplainer />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
