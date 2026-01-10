import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">1. About DueClock</h2>
              <p>DueClock is a subscription-based web application designed to help users track due dates and send reminders. It is intended to assist users but <strong>does not replace professional responsibility or judgment</strong>.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">2. Eligibility</h2>
              <p>You must be at least <strong>18 years old</strong> to use DueClock. By using the service, you confirm that you are legally allowed to enter into this agreement.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3. User Responsibility</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You are responsible for the <strong>accuracy of the data</strong> you enter (client details, due dates, emails, etc.).</li>
                <li>DueClock only provides a <strong>tracking and reminder tool</strong>.</li>
                <li>You are fully responsible for taking final actions on due dates.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">4. No Guarantee of Accuracy</h2>
              <p className="mb-2">While we strive to provide reliable service:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>We <strong>do not guarantee</strong> that reminders will always be delivered on time.</li>
                <li>Technical issues, email/WhatsApp failures, internet issues, or third-party service outages may occur.</li>
              </ul>
              <p className="mt-2 font-semibold text-gray-900">DueClock is not liable for any loss, penalty, or damage caused by missed due dates.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">5. Limitation of Liability</h2>
              <p className="mb-2">To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>DueClock shall <strong>not be liable</strong> for any direct, indirect, incidental, or consequential damages.</li>
                <li>This includes financial loss, penalties, business loss, or reputation damage.</li>
              </ul>
              <p className="mt-2 font-semibold">Use DueClock at your own risk.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">6. Subscription & Payments</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>DueClock is offered on a <strong>subscription basis</strong>.</li>
                <li>Prices, plans, and features may change with prior notice.</li>
                <li>Subscriptions are <strong>non-transferable</strong>.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">7. Refund Policy</h2>
              <p>Refunds are governed by our <Link href="/refund" className="text-blue-600 hover:underline font-medium">Refund Policy</Link>. Unless stated otherwise, <strong>no refunds</strong> will be provided after the subscription has started.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">8. Account Suspension or Termination</h2>
              <p className="mb-2">We reserve the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Suspend or terminate accounts if users misuse the service</li>
                <li>Suspend accounts for illegal, abusive, or harmful activity</li>
                <li>Terminate service without notice if required by law</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">9. Data & Privacy</h2>
              <p>Your data is handled according to our <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>. We do not sell user data to third parties.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">10. Third-Party Services</h2>
              <p>DueClock may use third-party services (email, WhatsApp redirection, hosting, payment gateways). We are <strong>not responsible</strong> for failures or issues caused by these services.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">11. Service Availability</h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>DueClock may be temporarily unavailable due to maintenance or technical issues.</li>
                <li>We do not guarantee <strong>100% uptime</strong>.</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">12. Changes to Terms</h2>
              <p>We may update these Terms from time to time. Continued use of DueClock means you accept the updated Terms.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">13. Governing Law</h2>
              <p>These Terms shall be governed by the laws of <strong>India</strong>. Any disputes shall be subject to the jurisdiction of courts in <strong>India</strong>.</p>
            </div>
            
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">14. Contact</h2>
              <p>
                If you have questions about these Terms, contact us at:<br />
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
