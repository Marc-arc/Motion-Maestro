import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TemplateSelection from "@/pages/template-selection";
import DocumentGeneration from "@/pages/document-generation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/templates" component={() => {
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('documentId');
        return <TemplateSelection documentId={documentId || undefined} />;
      }} />
      <Route path="/generate" component={DocumentGeneration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
