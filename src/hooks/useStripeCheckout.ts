import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface CheckoutOptions {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export function useStripeCheckout() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (options: CheckoutOptions) => {
    if (!session) {
      setError('Please sign in to continue with checkout');
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const { priceId, mode, successUrl, cancelUrl } = options;

      // Default URLs
      const defaultSuccessUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const defaultCancelUrl = `${window.location.origin}/pricing`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: successUrl || defaultSuccessUrl,
          cancel_url: cancelUrl || defaultCancelUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
    clearError: () => setError(null),
  };
}