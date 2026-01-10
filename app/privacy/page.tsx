import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
              <p className="mb-2">When you use DueClock, we collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Account Information:</strong> Name, email address, phone number</li>
                <li><strong>Client Data:</strong> Client names, contact details, due dates you enter</li>
                <li><strong>Usage Data:</strong> How you interact with the application</li>
                <li><strong>Payment Information:</strong> Handled securely through our payment provider (we don&apos;t store full card details)</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>To provide and maintain the DueClock service</li>
                <li>To send reminders and notifications</li>
                <li>To process subscription payments</li>
                <li>To improve our service and user experience</li>
                <li>To communicate with you about updates and support</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3. Data Security</h2>
              <p className="mb-2">We take data security seriously:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All data is encrypted in transit (HTTPS/SSL)</li>
                <li>Passwords are securely hashed</li>
                <li>We use secure hosting infrastructure</li>
                <li>Regular security audits and updates</li>
              </ul>
              <p className="mt-2 text-xs text-gray-600">However, no internet transmission is 100% secure. Use at your own risk.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
              <p className="mb-2"><strong>We do NOT sell your data to third parties.</strong></p>
              <p className="mb-2">We may share data only with:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Service Providers:</strong> Hosting, email services, payment processors (under strict confidentiality)</li>
                <li><strong>Legal Requirements:</strong> If required by law or court order</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">5. Data Retention</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your data is stored as long as your account is active</li>
                <li>After account termination, data is retained for 30 days for recovery</li>
                <li>After 30 days, data is permanently deleted</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">6. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Access your personal data</li>
                <li>Update or correct your information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Withdraw consent</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">7. Cookies</h2>
              <p>DueClock uses essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">8. Third-Party Services</h2>
              <p className="mb-2">DueClock integrates with:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Email services for sending reminders</li>
                <li>WhatsApp (redirect only - we don&apos;t access messages)</li>
                <li>Payment gateways for subscriptions</li>
              </ul>
              <p className="mt-2 text-xs text-gray-600">These services have their own privacy policies.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">9. Children&apos;s Privacy</h2>
              <p>DueClock is not intended for users under 18. We do not knowingly collect data from children.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">10. Changes to Privacy Policy</h2>
              <p>We may update this policy. Continued use after changes means you accept the updated policy.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">11. Contact</h2>
              <p>
                For privacy concerns or data requests, contact us at:<br />
                📧 <a href="mailto:venkatnithinprof@gmail.com" className="text-blue-600 hover:underline font-medium">venkatnithinprof@gmail.com</a>
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
