"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPaymentPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreatePayment = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/subscription/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'premium' })
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.text();
      console.log('Response data:', data);
      
      if (response.ok) {
        setResult({ success: true, data: JSON.parse(data) });
      } else {
        setResult({ success: false, error: data });
      }
    } catch (error) {
      console.error('Test error:', error);
      setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testRazorpayLoad = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      console.log('Razorpay available:', !!window.Razorpay);
      setResult({ success: true, data: 'Razorpay script loaded successfully' });
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setResult({ success: false, error: 'Failed to load Razorpay script' });
    };
    document.body.appendChild(script);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Payment Debug Test</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Payment API</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testCreatePayment} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Create Payment API'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Razorpay Script</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testRazorpayLoad}
              className="w-full"
            >
              Test Razorpay Script Loading
            </Button>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Console Output</h2>
        <p className="text-sm text-gray-600">
          Check the browser console for detailed logs from the payment debugging.
        </p>
      </div>
    </div>
  );
}