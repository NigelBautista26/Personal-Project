import { useEffect, useState } from "react";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
import { useLocation } from "wouter";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface BookingData {
  photographerId: string;
  duration: number;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  amount: number;
  photographerName: string;
}

interface SessionData {
  bookingData: BookingData;
  stripePublishableKey: string;
}

const cardElementOptions = {
  style: {
    base: {
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#6b7280',
      },
      iconColor: '#8b5cf6',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

function CheckoutForm({ 
  token, 
  bookingData, 
  clientSecret,
  paymentIntentId 
}: { 
  token: string; 
  bookingData: BookingData;
  clientSecret: string;
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found");
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded")) {
      try {
        const response = await fetch(`/api/mobile/complete-booking/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to complete booking");
        }

        setSucceeded(true);
        // Try to communicate back to the React Native app
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_SUCCESS' }));
        }
      } catch (err: any) {
        setError(err.message || "Failed to complete booking");
        setProcessing(false);
      }
    } else {
      setError("Payment was not completed");
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.successTitle}>Payment Successful!</h2>
        <p style={styles.successText}>Your booking request has been sent.</p>
        <p style={styles.successSubtext}>You can close this window and return to the app.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.summary}>
        <h3 style={styles.summaryTitle}>Booking Summary</h3>
        <div style={styles.summaryRow}>
          <span>Photographer</span>
          <span>{bookingData.photographerName}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Duration</span>
          <span>{bookingData.duration} hour{bookingData.duration > 1 ? "s" : ""}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Location</span>
          <span>{bookingData.location}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Date</span>
          <span>{new Date(bookingData.scheduledDate).toLocaleDateString()}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Time</span>
          <span>{bookingData.scheduledTime}</span>
        </div>
        <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
          <span>Total</span>
          <span style={styles.totalAmount}>£{bookingData.amount.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.paymentSection}>
        <CardElement 
          options={cardElementOptions}
          onChange={(e) => setCardComplete(e.complete)}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        type="submit"
        disabled={!stripe || processing || !cardComplete}
        style={{
          ...styles.payButton,
          opacity: !stripe || processing || !cardComplete ? 0.6 : 1,
        }}
      >
        {processing ? "Processing..." : `Pay £${bookingData.amount.toFixed(2)}`}
      </button>

      <p style={styles.securedBy}>🔒 Secured by Stripe</p>
    </form>
  );
}

export default function MobileCheckout() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid payment session");
      setLoading(false);
      return;
    }

    async function loadSession() {
      try {
        const response = await fetch(`/api/mobile/payment-session/${token}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Session expired or invalid");
        }

        const data: SessionData = await response.json();
        setSessionData(data);
        setStripePromise(loadStripe(data.stripePublishableKey));

        const piResponse = await fetch(`/api/mobile/create-payment-intent/${token}`, {
          method: "POST",
        });
        if (!piResponse.ok) {
          throw new Error("Failed to create payment");
        }

        const piData = await piResponse.json();
        setClientSecret(piData.clientSecret);
        setPaymentIntentId(piData.paymentIntentId);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load payment session");
        setLoading(false);
      }
    }

    loadSession();
  }, [token]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Payment Error</h2>
          <p style={styles.errorText}>{error}</p>
          <p style={styles.errorSubtext}>Please close this window and try again.</p>
        </div>
      </div>
    );
  }

  if (!sessionData || !stripePromise || !clientSecret || !token) {
    return null;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Complete Payment</h1>
      </header>

      <Elements stripe={stripePromise}>
        <CheckoutForm
          token={token}
          bookingData={sessionData.bookingData}
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId!}
        />
      </Elements>

      <div style={styles.sandbox}>
        Test mode: Use card 4242 4242 4242 4242, any future date, any CVC
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    backgroundColor: "#8b5cf6",
    padding: "16px 20px",
    textAlign: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    color: "#666",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#8b5cf6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  form: {
    padding: "20px",
  },
  summary: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#111",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    color: "#666",
    borderBottom: "1px solid #f0f0f0",
  },
  totalRow: {
    borderBottom: "none",
    paddingTop: "12px",
    fontWeight: "600",
    color: "#111",
  },
  totalAmount: {
    color: "#8b5cf6",
    fontSize: "18px",
  },
  paymentSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  error: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  payButton: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  securedBy: {
    textAlign: "center",
    color: "#888",
    fontSize: "12px",
    marginTop: "16px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
  },
  errorTitle: {
    color: "#dc2626",
    fontSize: "20px",
    marginBottom: "12px",
  },
  errorText: {
    color: "#666",
    fontSize: "16px",
    marginBottom: "8px",
  },
  errorSubtext: {
    color: "#888",
    fontSize: "14px",
  },
  successContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    color: "white",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  successTitle: {
    color: "#22c55e",
    fontSize: "24px",
    marginBottom: "12px",
  },
  successText: {
    color: "#333",
    fontSize: "16px",
    marginBottom: "8px",
  },
  successSubtext: {
    color: "#888",
    fontSize: "14px",
  },
  sandbox: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "12px",
    margin: "0 20px 20px",
    borderRadius: "8px",
    fontSize: "12px",
    textAlign: "center",
  },
};
