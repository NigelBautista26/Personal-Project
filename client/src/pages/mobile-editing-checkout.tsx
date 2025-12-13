import { useEffect, useState } from "react";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface EditingData {
  bookingId: string;
  photographerId: string;
  photographerName: string;
  photoCount?: number;
  customerNotes?: string;
  requestedPhotoUrls?: string[];
  amount: number;
  pricingModel: string;
}

interface SessionData {
  editingData: EditingData;
  stripePublishableKey: string;
}

function CheckoutForm({ 
  token, 
  editingData, 
  clientSecret,
  paymentIntentId 
}: { 
  token: string; 
  editingData: EditingData;
  clientSecret: string;
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + `/mobile-editing-checkout?token=${token}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded")) {
      try {
        const response = await fetch(`/api/mobile/complete-editing-request/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to complete editing request");
        }

        setSucceeded(true);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EDITING_PAYMENT_SUCCESS' }));
        }
      } catch (err: any) {
        setError(err.message || "Failed to complete editing request");
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
        <p style={styles.successText}>Your editing request has been sent.</p>
        <p style={styles.successSubtext}>You can close this window and return to the app.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.summary}>
        <h3 style={styles.summaryTitle}>Editing Request Summary</h3>
        <div style={styles.summaryRow}>
          <span>Photographer</span>
          <span>{editingData.photographerName}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Service</span>
          <span>Photo Editing</span>
        </div>
        {editingData.pricingModel === 'per_photo' && editingData.photoCount && (
          <div style={styles.summaryRow}>
            <span>Photos</span>
            <span>{editingData.photoCount} photo{editingData.photoCount > 1 ? "s" : ""}</span>
          </div>
        )}
        {editingData.customerNotes && (
          <div style={styles.summaryRow}>
            <span>Notes</span>
            <span style={{ maxWidth: '150px', textAlign: 'right' }}>{editingData.customerNotes.substring(0, 50)}{editingData.customerNotes.length > 50 ? '...' : ''}</span>
          </div>
        )}
        <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
          <span>Total</span>
          <span style={styles.totalAmount}>£{editingData.amount.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.paymentSection}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          ...styles.payButton,
          opacity: !stripe || processing ? 0.6 : 1,
        }}
      >
        {processing ? "Processing..." : `Pay £${editingData.amount.toFixed(2)}`}
      </button>

      <p style={styles.securedBy}>🔒 Secured by Stripe</p>
    </form>
  );
}

export default function MobileEditingCheckout() {
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
        const response = await fetch(`/api/mobile/editing-payment-session/${token}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Session expired or invalid");
        }

        const data: SessionData = await response.json();
        setSessionData(data);
        setStripePromise(loadStripe(data.stripePublishableKey));

        const piResponse = await fetch(`/api/mobile/create-editing-payment-intent/${token}`, {
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
        <h1 style={styles.headerTitle}>Photo Editing Payment</h1>
      </header>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#8b5cf6",
              borderRadius: "8px",
              colorBackground: "#1a1a1a",
              colorText: "#ffffff",
              colorTextSecondary: "#9ca3af",
            },
          },
        }}
      >
        <CheckoutForm
          token={token}
          editingData={sessionData.editingData}
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
    backgroundColor: "#0a0a0a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    backgroundColor: "#1a1a1a",
    padding: "16px 20px",
    textAlign: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
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
    color: "#9ca3af",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #333",
    borderTopColor: "#8b5cf6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  form: {
    padding: "20px",
  },
  summary: {
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#fff",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    color: "#9ca3af",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  totalRow: {
    borderBottom: "none",
    paddingTop: "12px",
    fontWeight: "600",
    color: "#fff",
  },
  totalAmount: {
    color: "#8b5cf6",
    fontSize: "18px",
  },
  paymentSection: {
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    border: "1px solid rgba(239, 68, 68, 0.3)",
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
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "16px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
  },
  errorTitle: {
    color: "#ef4444",
    fontSize: "20px",
    marginBottom: "12px",
  },
  errorText: {
    color: "#9ca3af",
    fontSize: "16px",
    marginBottom: "8px",
  },
  errorSubtext: {
    color: "#6b7280",
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
    color: "#fff",
    fontSize: "16px",
    marginBottom: "8px",
  },
  successSubtext: {
    color: "#9ca3af",
    fontSize: "14px",
  },
  sandbox: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    color: "#a78bfa",
    padding: "12px",
    margin: "0 20px 20px",
    borderRadius: "8px",
    fontSize: "12px",
    textAlign: "center",
    border: "1px solid rgba(139, 92, 246, 0.3)",
  },
};
