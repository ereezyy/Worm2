import React from 'react';
import { Header } from '../components/layout/Header';
import { PricingSection } from '../components/pricing/PricingSection';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. All plans include access to our core features
              with different levels of support and additional services.
            </p>
          </div>
          <PricingSection />
        </div>
      </main>
    </div>
  );
}