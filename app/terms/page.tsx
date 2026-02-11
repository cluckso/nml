import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service - CallGrabbr",
  description: "Terms of service for CallGrabbr.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance</h2>
          <p>
            By creating an account, subscribing, or using CallGrabbr (&quot;Service,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Service. By completing a subscription purchase, you confirm that you have read, understood, and agree to these Terms and our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Description of Service</h2>
          <p>
            CallGrabbr provides AI-powered call answering, lead intake, call summaries, and related features for businesses. We use third-party providers (e.g., telephony, AI, payments) to deliver the Service. We reserve the right to modify, suspend, or discontinue features with reasonable notice where practicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Account and Eligibility</h2>
          <p>
            You must be at least 18 years old and have the authority to bind your business to these Terms. You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate and complete information and update it as needed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Subscription and Payment</h2>
          <p>
            Subscription plans, fees, and included minutes are described on our pricing page. You agree to pay all applicable fees, including setup fees and overage charges. Payments are processed by our payment provider; by subscribing, you agree to their terms. Fees are generally billed in advance; overage may be billed in arrears. Refunds are at our discretion unless required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Acceptable Use</h2>
          <p>
            You agree not to use the Service: (a) for any illegal purpose or in violation of any laws; (b) to transmit harmful, offensive, or fraudulent content; (c) to interfere with or overload our systems or other users; (d) to resell or sublicense the Service without our written consent; or (e) in any way that could harm our reputation or the Service. We may suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. SMS / Text Messaging</h2>
          <p className="mb-2">
            By opting in to SMS notifications during account signup, trial registration, or onboarding, you consent to receive automated text messages from CallGrabbr at the phone number you provided. Messages may include call notifications, lead alerts, account updates, and trial/billing reminders.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Frequency:</strong> Message frequency varies based on call volume and account activity.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Costs:</strong> Message and data rates may apply. Check with your carrier.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Opt-out:</strong> Reply <strong>STOP</strong> to any SMS from us to stop receiving messages. You will receive a one-time confirmation. You may re-enroll from your account settings at any time.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Help:</strong> Reply <strong>HELP</strong> to any SMS from us for assistance, or contact us at the email provided on our website.
          </p>
          <p className="mt-2">
            Your consent to receive SMS is not required to purchase any service. Carriers are not liable for delayed or undelivered messages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Your Data and Our Use</h2>
          <p>
            You retain ownership of your data. You grant us a license to use, store, and process your data as necessary to provide and improve the Service and as described in our Privacy Policy. You are responsible for ensuring you have the right to provide caller and business data to us and that your use complies with applicable privacy and telephony laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Intellectual Property</h2>
          <p>
            We own or license the Service, our brand, and our technology. You may not copy, modify, reverse-engineer, or create derivative works from our Service except as permitted in writing. Feedback you provide may be used by us without obligation to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE OR THAT THE AI WILL ALWAYS RESPOND CORRECTLY. YOU USE THE SERVICE AT YOUR OWN RISK.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATED TO THE SERVICE OR THESE TERMS. OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold us harmless from any claims, damages, or expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights or laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">12. Termination</h2>
          <p>
            You may cancel your subscription in accordance with our billing process. We may suspend or terminate your account or access to the Service for breach of these Terms, non-payment, or for any reason with notice. Upon termination, your right to use the Service ceases. Provisions that by their nature should survive (e.g., disclaimers, limitation of liability, indemnification) will survive.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">13. Governing Law and Disputes</h2>
          <p>
            These Terms are governed by the laws of the United States and the state in which we are located, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that state. If any provision is held invalid, the remaining provisions remain in effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">14. Changes</h2>
          <p>
            We may modify these Terms from time to time. We will post the updated Terms on this page and update the &quot;Last updated&quot; date. Material changes may be communicated by email or in-app notice. Continued use of the Service after changes constitutes acceptance. If you do not agree, you must cancel your subscription and stop using the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">15. Contact</h2>
          <p>
            For questions about these Terms, contact us at the email or address provided on our website or in your account settings.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-primary hover:underline">← Back to home</Link>
      </p>
    </div>
  )
}
