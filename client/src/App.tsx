import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import Photographers from "@/pages/photographers";
import PhotographerProfile from "@/pages/photographer";
import Booking from "@/pages/booking";
import Bookings from "@/pages/bookings";
import PhotographerBookings from "@/pages/photographer-bookings";
import PhotographerDashboard from "@/pages/photographer-dashboard";
import PhotographerHome from "@/pages/photographer-home";
import PhotographerProfilePage from "@/pages/photographer-profile";
import Profile from "@/pages/profile";
import AccountDetails from "@/pages/account-details";
import Security from "@/pages/security";
import Preferences from "@/pages/preferences";
import Support from "@/pages/support";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import BusinessCase from "@/pages/business-case";
import PhotoSpots from "@/pages/photo-spots";
import PhotoSpotDetail from "@/pages/photo-spot-detail";
import PitchDeck from "@/pages/pitch-deck";
import PhotographerMap from "@/pages/photographer-map";
import PhotographerBookingDetail from "@/pages/photographer-booking-detail";
import CustomerBookingDetail from "@/pages/customer-booking-detail";
import PhotographerOnboarding from "@/pages/photographer-onboarding";
import PhotographerPending from "@/pages/photographer-pending";
import AdminDashboard from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/photographer-onboarding" component={PhotographerOnboarding} />
      <Route path="/photographer-pending" component={PhotographerPending} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/home" component={Home} />
      <Route path="/photographers" component={Photographers} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/profile" component={Profile} />
      <Route path="/account-details" component={AccountDetails} />
      <Route path="/security" component={Security} />
      <Route path="/preferences" component={Preferences} />
      <Route path="/support" component={Support} />
      <Route path="/photographer-home" component={PhotographerHome} />
      <Route path="/photographer-profile" component={PhotographerProfilePage} />
      <Route path="/photographer-bookings" component={PhotographerBookings} />
      <Route path="/dashboard" component={PhotographerDashboard} />
      <Route path="/business-case" component={BusinessCase} />
      <Route path="/photo-spots" component={PhotoSpots} />
      <Route path="/photo-spots/:id" component={PhotoSpotDetail} />
      <Route path="/photographer/:id" component={PhotographerProfile} />
      <Route path="/book/:id" component={Booking} />
      <Route path="/pitch-deck" component={PitchDeck} />
      <Route path="/photographer-map" component={PhotographerMap} />
      <Route path="/photographer/booking/:id" component={PhotographerBookingDetail} />
      <Route path="/booking/:id" component={CustomerBookingDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <SonnerToaster position="top-center" richColors />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
