import React from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { useAuth } from '../../hooks/useAuth';

interface CheckoutButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({ 
  priceId, 
  mode, 
  children, 
  className = "", 
  disabled = false 
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const { createCheckoutSession, loading } = useStripeCheckout();

  const handleClick = async () => {
    if (!user) {
      // Redirect to login or show auth modal
      alert('Please sign in to continue with purchase');
      return;
    }

    try {
      await createCheckoutSession({
        priceId,
        mode,
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center transition-colors ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </button>
  );
}