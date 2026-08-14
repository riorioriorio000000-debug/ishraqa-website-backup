import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AboutPage, ArticlesPage, BookingPage, CoveragePage, FaqPage, ServicesPage } from "./pages/StaticPage";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/services" component={ServicesPage} /><Route path="/booking" component={BookingPage} /><Route path="/articles" component={ArticlesPage} /><Route path="/where-we-work" component={CoveragePage} /><Route path="/about" component={AboutPage} /><Route path="/faq" component={FaqPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }

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
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
