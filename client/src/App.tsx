import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import PhotographerProfile from "@/pages/photographer";
import Booking from "@/pages/booking";
import PhotographerDashboard from "@/pages/photographer-dashboard";
import PhotographerHome from "@/pages/photographer-home";
import PhotographerProfilePage from "@/pages/photographer-profile";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import BusinessCase from "@/pages/business-case";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/home" component={Home} />
      <Route path="/photographer-home" component={PhotographerHome} />
      <Route path="/photographer-profile" component={PhotographerProfilePage} />
      <Route path="/dashboard" component={PhotographerDashboard} />
      <Route path="/business-case" component={BusinessCase} />
      <Route path="/photographer/:id" component={PhotographerProfile} />
      <Route path="/book/:id" component={Booking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
