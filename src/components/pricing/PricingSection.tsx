import React, { useState } from 'react';
import { PricingCard } from './PricingCard';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { STRIPE_PRODUCTS } from '../../stripe-config';

export function PricingSection() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { createCheckoutSession, loading } = useStripeCheckout();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handlePurchase = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    try {
      await createCheckoutSession({
        priceId,
        mode,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      // Error is already handled by the useStripeCheckout hook
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STRIPE_PRODUCTS.map((product, index) => (
            <PricingCard
              key={product.priceId}
              product={product}
              onPurchase={handlePurchase}
              loading={loading}
              isPopular={index === 0} // Make the first product (subscription) popular
              currentSubscription={subscription?.price_id}
            />
          ))}
        </div>

        {!user && (
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in to continue
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        title="Sign in to continue"
        subtitle="Create an account or sign in to purchase this plan"
      />
    </div>
  );
}