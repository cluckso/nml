import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy - CallGrabbr",
  description: "Privacy policy for CallGrabbr.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Introduction</h2>
          <p>
            CallGrabbr (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides AI-powered call answering and lead intake services for businesses. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Information We Collect</h2>
          <p className="mb-2">We may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Account information:</strong> name, email address, password, phone number, and business details you provide when signing up or updating your profile.</li>
            <li><strong className="text-foreground">Call and usage data:</strong> call recordings, transcripts, summaries, caller phone numbers, and call metadata used to deliver and improve our services.</li>
            <li><strong className="text-foreground">Payment information:</strong> processed by our payment provider (Stripe); we do not store full card numbers.</li>
            <li><strong className="text-foreground">Technical and usage data:</strong> IP address, device and browser type, pages visited, and similar data collected via cookies and similar technologies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Provide, operate, and improve our call-answering and lead-intake services.</li>
            <li>Authenticate you and manage your account and subscription.</li>
            <li>Process payments and send billing-related communications.</li>
            <li>Send you call summaries, alerts, and (with your consent) marketing communications.</li>
            <li>Comply with legal obligations and enforce our Terms of Service.</li>
            <li>Analyze usage and improve our products and security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Sharing of Information</h2>
          <p>
            We may share your information with service providers that help us operate (e.g., hosting, payments, email, telephony). We do not sell your personal information. We may disclose information when required by law or to protect our rights, safety, or property.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Data Retention and Security</h2>
          <p>
            We retain your data as long as your account is active or as needed to provide services and comply with law. We use reasonable technical and organizational measures to protect your data; no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, delete, or port your personal data, or to object to or restrict certain processing. You can update account information in your dashboard or contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar technologies for authentication, preferences, and analytics. You can adjust your browser settings to limit or block cookies; some features may not work if you disable them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. SMS / Text Messaging</h2>
          <p className="mb-2">
            If you opt in to receive SMS/text messages from CallGrabbr, you agree to receive automated text messages at the phone number you provided. These messages may include:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Call notifications and lead alerts</li>
            <li>Account and service updates</li>
            <li>Trial and billing reminders</li>
          </ul>
          <p className="mt-2">
            <strong className="text-foreground">Message frequency</strong> varies based on your call volume and account activity. Message and data rates may apply.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Opt-out:</strong> You may opt out of SMS messages at any time by replying <strong>STOP</strong> to any message you receive from us. After you send STOP, you will no longer receive text messages from us. If you want to re-enroll, you may do so from your account settings.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Help:</strong> Reply <strong>HELP</strong> for assistance. You can also contact us at the email provided on our website.
          </p>
          <p className="mt-2">
            Your consent to receive SMS messages is not a condition of purchasing any goods or services. We will not share your phone number with third parties for their marketing purposes without your separate consent.
          </p>
          <p className="mt-2">
            Supported carriers include but are not limited to: AT&amp;T, T-Mobile, Verizon, Sprint, and others. Carriers are not liable for delayed or undelivered messages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Children&apos;s Privacy</h2>
          <p>
            Our services are not directed to individuals under 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated policy on this page and update the &quot;Last updated&quot; date. Continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">11. Contact</h2>
          <p>
            For privacy-related questions or requests, contact us at the email or address provided on our website or in your account settings.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-primary hover:underline">← Back to home</Link>
      </p>
    </div>
  )
}
