import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Booking() {
  const [match, params] = useRoute("/book/:id");
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  
  const id = params?.id;

  const durations = [
    { label: "60 min", price: "£40" },
    { label: "90 min", price: "£60" },
    { label: "120 min", price: "£80" },
  ];
  const [selectedDuration, setSelectedDuration] = useState(0);

  if (step === 3) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-300">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Your session with Anna L. has been confirmed. We've sent a confirmation email.
        </p>
        <Button onClick={() => setLocation("/home")} className="w-full h-14 rounded-xl bg-white text-black hover:bg-white/90 font-bold">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-6 pt-12 flex items-center gap-4">
        <button onClick={() => step === 1 ? window.history.back() : setStep(step - 1)} className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">
          {step === 1 ? "Book Session" : "Secure Payment"}
        </h1>
      </div>

      <div className="px-6 space-y-8">
        {step === 1 && (
          <>
            <section>
              <h3 className="text-white font-bold mb-4">Duration</h3>
              <div className="flex gap-3">
                {durations.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDuration(i)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border text-center transition-all",
                      selectedDuration === i 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-card border-white/10 text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    <span className="block font-bold text-sm">{d.label}</span>
                    <span className="text-xs opacity-80">{d.price}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold mb-4">Where should we meet?</h3>
              <div className="bg-card border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <input 
                  type="text" 
                  placeholder="Tower Bridge, London" 
                  className="bg-transparent border-none text-white placeholder:text-muted-foreground focus:outline-none flex-1"
                />
              </div>
            </section>

            <section>
              <h3 className="text-white font-bold mb-4">When?</h3>
              <div className="flex gap-3">
                <div className="flex-1 bg-card border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-white">Today</span>
                </div>
                <div className="flex-1 bg-card border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-white">4:00 PM</span>
                </div>
              </div>
            </section>
          </>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session (60 min)</span>
                <span className="text-white font-medium">£40.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="text-white font-medium">£5.00</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-primary">£45.00</span>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-white font-bold">Payment Method</h3>
               <div className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/10">
                 <div className="flex items-center gap-3">
                   <CreditCard className="w-5 h-5 text-primary" />
                   <span className="text-white font-medium">Apple Pay</span>
                 </div>
                 <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary" />
               </div>
               <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-card">
                 <div className="flex items-center gap-3">
                   <CreditCard className="w-5 h-5 text-muted-foreground" />
                   <span className="text-muted-foreground font-medium">Credit Card ending 4242</span>
                 </div>
                 <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-white/10 z-50">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={() => step === 1 ? setStep(2) : setStep(3)}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25"
          >
            {step === 1 ? "Continue to Payment" : "Pay £45.00"}
          </Button>
        </div>
      </div>
    </div>
  );
}