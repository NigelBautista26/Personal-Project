import { ArrowLeft, Mail, MessageCircle, FileText, ExternalLink, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Support() {
  const [, navigate] = useLocation();

  const faqs = [
    {
      question: "How do I book a photographer?",
      answer: "Browse photographers on the map or list view, select one you like, choose your date and time, and complete the booking. Payment is processed securely through our platform.",
    },
    {
      question: "What's included in a photoshoot?",
      answer: "Each session includes the photographer's time, professional editing, and digital delivery of all edited photos within 48 hours of your session.",
    },
    {
      question: "Can I cancel or reschedule?",
      answer: "Yes, you can cancel or reschedule up to 24 hours before your session for a full refund. Cancellations within 24 hours may incur a fee.",
    },
    {
      question: "How do I receive my photos?",
      answer: "Your photographer will upload the edited photos to your booking in the app. You'll receive a notification when they're ready to view and download.",
    },
    {
      question: "Is my payment secure?",
      answer: "Yes, all payments are processed securely through Stripe. We never store your card details on our servers.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Support</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Us</h2>
          
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <a
              href="mailto:support@snapnow.app"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              data-testid="link-email"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@snapnow.app</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
              data-testid="button-chat"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 9am - 6pm GMT</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Frequently Asked Questions</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-card rounded-2xl border border-border group"
                data-testid={`faq-${index}`}
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-white font-medium pr-4">{faq.question}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-0">
                  <p className="text-muted-foreground text-sm pl-12">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl p-6 border border-primary/30">
          <h3 className="text-white font-semibold mb-2">Need more help?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Our support team typically responds within 2-4 hours during business hours.
          </p>
          <a
            href="mailto:support@snapnow.app"
            className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
          >
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </div>
      </div>
    </div>
  );
}
