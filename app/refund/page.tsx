import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
          
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">1. Refund Eligibility</h2>
              <p className="mb-2">You may be eligible for a refund if:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You request a refund within <strong>7 days of payment</strong></li>
                <li>You have not extensively used premium features</li>
                <li>Technical issues prevented you from using the service</li>
                <li>Duplicate or unauthorized charges occurred</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">2. Non-Refundable Situations</h2>
              <p className="mb-2">Refunds will <strong>NOT</strong> be provided if:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>More than 7 days have passed since payment</li>
                <li>You have actively used premium features extensively</li>
                <li>You violated our Terms & Conditions</li>
                <li>You changed your mind after using the service</li>
                <li>Free trial was already utilized before subscription</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3. How to Request a Refund</h2>
              <p className="mb-2">To request a refund:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Email us at <a href="mailto:venkatnithinprof@gmail.com" className="text-blue-600 hover:underline font-medium">venkatnithinprof@gmail.com</a></li>
                <li>Include:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>Your registered email address</li>
                    <li>Payment transaction ID</li>
                    <li>Reason for refund request</li>
                    <li>Date of payment</li>
                  </ul>
                </li>
                <li>We will review and respond within <strong>3-5 business days</strong></li>
              </ol>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4. Refund Processing Time</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Once approved, refunds are processed within <strong>7-10 business days</strong></li>
                <li>Refunds will be credited to the original payment method</li>
                <li>Bank processing may take additional 5-7 days</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">5. Partial Refunds</h2>
              <p>In some cases, we may offer a <strong>partial refund</strong> based on:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>How long you&apos;ve used the service</li>
                <li>Features utilized</li>
                <li>Circumstances of the refund request</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">6. Subscription Cancellation</h2>
              <p className="mb-2">Important notes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cancelling your subscription does <strong>NOT</strong> automatically trigger a refund</li>
                <li>You must explicitly request a refund via email</li>
                <li>Cancellation stops future charges but doesn&apos;t refund current period</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">7. Technical Issues</h2>
              <p>If you experience technical problems:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Contact support first at <a href="mailto:venkatnithinprof@gmail.com" className="text-blue-600 hover:underline">venkatnithinprof@gmail.com</a></li>
                <li>Allow us 48 hours to resolve the issue</li>
                <li>If unresolved, you may qualify for a refund</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">8. Fraudulent Transactions</h2>
              <p>If you notice unauthorized charges:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Report immediately to <a href="mailto:venkatnithinprof@gmail.com" className="text-blue-600 hover:underline">venkatnithinprof@gmail.com</a></li>
                <li>Provide transaction details</li>
                <li>We will investigate and process refunds for verified fraudulent charges</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">9. Free Plan Users</h2>
              <p>Free plan users are <strong>not eligible for refunds</strong> as no payment is involved.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">10. Changes to Refund Policy</h2>
              <p>We reserve the right to update this policy. Existing subscriptions follow the policy active at time of purchase.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Before Subscribing</h3>
              <p className="text-xs text-blue-800">
                We recommend trying the <strong>Free Plan</strong> first to ensure DueClock meets your needs before upgrading to Premium.
              </p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Contact for Refunds</h2>
              <p>
                📧 <a href="mailto:venkatnithinprof@gmail.com" className="text-blue-600 hover:underline font-medium">venkatnithinprof@gmail.com</a><br />
                💬 WhatsApp: <a href="https://wa.me/917090245208" className="text-blue-600 hover:underline font-medium">+91 70902 45208</a>
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">Last updated: January 10, 2026</p>
            <Link href="/" className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
