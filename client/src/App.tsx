import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import QuotesPage from "@/pages/quotes";
import EditQuotePage from "@/pages/quotes/edit";
import NewQuotePage from "@/pages/quotes/new";
import ComponentsPage from "@/pages/components";
import SettingsPage from "@/pages/settings";
import ConstructionDivisions from "@/pages/construction";
import ConstructionDivisionItems from "@/pages/construction/division";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QuotesPage} />
      <Route path="/quotes" component={QuotesPage} />
      <Route path="/quotes/new" component={NewQuotePage} />
      <Route path="/quotes/:id" component={EditQuotePage} />
      <Route path="/components" component={ComponentsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/construction" component={ConstructionDivisions} />
      <Route path="/construction/divisions/:id" component={ConstructionDivisionItems} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
