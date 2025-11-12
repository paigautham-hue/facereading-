import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewReading from "./pages/NewReading";
import ReadingView from "./pages/ReadingView";
import AnalysisProgressPage from "./pages/AnalysisProgressPage";
import Admin from "./pages/Admin";
import AIMonitoring from "./pages/AIMonitoring";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import Orders from "./pages/Orders";
import AdvancedReadingsList from "./pages/advanced/AdvancedReadingsList";
import NewAdvancedReading from "./pages/advanced/NewAdvancedReading";
import AdvancedReadingView from "./pages/advanced/AdvancedReadingView";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/new-reading" component={NewReading} />
      <Route path="/reading/:id" component={ReadingView} />
      <Route path="/analysis/:readingId" component={AnalysisProgressPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/ai-monitoring" component={AIMonitoring} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/orders" component={Orders} />
      <Route path="/advanced" component={AdvancedReadingsList} />
      <Route path="/advanced/new" component={NewAdvancedReading} />
      <Route path="/advanced/:id" component={AdvancedReadingView} />
      <Route path={"/404"} component={NotFound} />     {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
