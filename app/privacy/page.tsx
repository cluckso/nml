import type { Metadata } from "next"
import Link from "next/link"
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/site-contact"

export const metadata: Metadata = {
  title: "Privacy Policy - CallGrabbr",
  description:
    "Privacy policy for CallGrabbr website, web dashboard, and mobile apps — how we collect, use, and protect your information.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {LEGAL_LAST_UPDATED}
      </p>

      <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Introduction</h2>
          <p>
            CallGrabbr (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides AI-powered call answering, lead
            intake, notifications, and related business tools. This Privacy Policy explains how we
            collect, use, disclose, and safeguard information when you use:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Our website and web dashboard (including callgrabbr.com)</li>
            <li>Our mobile applications (including the CallGrabbr Android app on Google Play)</li>
            <li>Our APIs, SMS programs, email alerts, and push notifications</li>
          </ul>
          <p className="mt-2">
            Together, these are the &quot;Service.&quot; By using the Service, you agree to this Policy.
            If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Who This Policy Covers</h2>
          <p className="mb-2">
            <strong className="text-foreground">Business customers (account holders):</strong> If you
            create a CallGrabbr account for your business, we process your account, billing, and
            configuration data as described below.
          </p>
          <p>
            <strong className="text-foreground">Callers / end users of your business:</strong> When
            someone calls a number connected to CallGrabbr, we process call audio, transcripts,
            phone numbers, and intake details so we can deliver the Service to you. You are
            responsible for providing any legally required notices or consents to your callers
            (including call recording and AI processing notices) under the laws that apply to your
            business.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Information We Collect</h2>
          <p className="mb-2">We may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong className="text-foreground">Account information:</strong> name, email address,
              password or authentication credentials, phone number, business name, industry,
              service area, forwarding settings, and other profile details you provide.
            </li>
            <li>
              <strong className="text-foreground">Call and lead data:</strong> caller phone numbers,
              names and contact details provided on the call, addresses, reason for call, appointment
              preferences, call metadata (time, duration, dialed number), transcripts, AI-generated
              summaries, lead tags, and call recordings when enabled.
            </li>
            <li>
              <strong className="text-foreground">Communications:</strong> SMS/text content we send
              or receive for alerts, confirmations, missed-call recovery, and support; email
              notifications; and in-app support requests.
            </li>
            <li>
              <strong className="text-foreground">Mobile app data:</strong> device identifiers used
              for push notifications (for example, FCM/push tokens), app version, crash/diagnostic
              information when available, and basic device/OS information needed to operate the app.
            </li>
            <li>
              <strong className="text-foreground">Payment information:</strong> processed by our
              payment provider (Stripe). We do not store full card numbers on our servers.
            </li>
            <li>
              <strong className="text-foreground">Technical and usage data:</strong> IP address,
              device and browser type, pages or screens viewed, approximate location derived from IP
              when available, and similar data collected via cookies, local storage, and analytics
              tools on the website and dashboard.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Provide, operate, secure, and improve the Service (including AI call handling and lead summaries).</li>
            <li>Authenticate you and manage your account, subscription, and trial.</li>
            <li>Process payments and send billing-related communications.</li>
            <li>
              Send call summaries, lead alerts, and service messages by email, SMS, and push
              notifications (according to your settings and consent).
            </li>
            <li>Support CRM/webhook forwarding and integrations you enable.</li>
            <li>Comply with legal obligations and enforce our Terms of Service.</li>
            <li>Analyze usage, troubleshoot issues, and improve products and security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Sharing of Information</h2>
          <p className="mb-2">
            We may share information with service providers that help us operate the Service,
            including (as applicable):
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hosting and databases (for example, cloud infrastructure and Supabase)</li>
            <li>Telephony, SMS, and voice AI providers (for example, Twilio and Retell)</li>
            <li>Payment processing (Stripe)</li>
            <li>Email delivery and customer messaging</li>
            <li>Push notification delivery (for example, Firebase Cloud Messaging on Android)</li>
            <li>Analytics and error monitoring tools we use to maintain the Service</li>
          </ul>
          <p className="mt-2">
            These providers are authorized to use information only as needed to perform services for
            us. We do not sell your personal information. We may disclose information when required
            by law, to respond to lawful requests, or to protect our rights, safety, or property, or
            that of our users or others. If you connect a CRM or webhook, lead data you choose to
            forward is shared with those destinations under your control.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">6. Mobile Apps and Push Notifications</h2>
          <p>
            Our mobile apps display call/lead information associated with your CallGrabbr account
            and may send push notifications for new leads and alerts when enabled in Settings. Push
            delivery requires a device token stored with your account. You can disable push alerts in
            the app or in your device system settings. Uninstalling the app stops push delivery to
            that device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">7. Data Retention and Security</h2>
          <p>
            We retain account and call data while your account is active and as needed to provide
            the Service, resolve disputes, enforce agreements, and comply with legal obligations.
            You may request deletion of your account and associated personal data by contacting us
            at the email below; we will delete or anonymize data except where we must retain it by
            law or for legitimate business records (for example, billing). We use reasonable
            technical and organizational measures to protect data; no method of transmission or
            storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">8. Your Rights and Choices</h2>
          <p className="mb-2">
            Depending on your location, you may have rights to access, correct, delete, or port your
            personal data, or to object to or restrict certain processing. You can:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Update many account details in your web dashboard or mobile app settings</li>
            <li>Control email, SMS, and push notification preferences where available</li>
            <li>Request access or deletion by emailing {SUPPORT_EMAIL}</li>
          </ul>
          <p className="mt-2">
            If you are a California resident, you may have additional rights under the CCPA/CPRA,
            including the right to know, delete, and correct personal information, and to opt out of
            “sale” or “sharing” as those terms are defined by law. We do not sell personal
            information for money. To exercise applicable rights, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">9. Cookies and Similar Technologies</h2>
          <p>
            On our website and web dashboard, we use cookies and similar technologies for
            authentication, preferences, and analytics. You can adjust browser settings to limit or
            block cookies; some features may not work if you disable them. The mobile app uses local
            storage and device tokens as needed to keep you signed in and deliver notifications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">10. SMS / Text Messaging</h2>
          <p className="mb-2">
            If you opt in to receive SMS/text messages from CallGrabbr, you agree to receive
            automated text messages at the phone number you provided. These messages may include:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Call notifications and lead alerts</li>
            <li>Account and service updates</li>
            <li>Trial and billing reminders</li>
            <li>Demo-result or transactional messages when you expressly request them</li>
          </ul>
          <p className="mt-2">
            <strong className="text-foreground">Message frequency</strong> varies based on your call
            volume and account activity. Message and data rates may apply.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Opt-out:</strong> Reply <strong>STOP</strong> to any
            message you receive from us. After you send STOP, you will no longer receive text
            messages from us. You may re-enroll from your account settings where available.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Help:</strong> Reply <strong>HELP</strong> for
            assistance, or contact us at {SUPPORT_EMAIL}.
          </p>
          <p className="mt-2">
            Your consent to receive SMS messages is not a condition of purchasing any goods or
            services. We will not share your phone number with third parties for their marketing
            purposes without your separate consent. Supported carriers include but are not limited
            to AT&amp;T, T-Mobile, Verizon, Sprint, and others. Carriers are not liable for delayed
            or undelivered messages. See our{" "}
            <Link href="/sms-terms" className="text-primary hover:underline">
              SMS Terms
            </Link>{" "}
            for program details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">11. International Transfers</h2>
          <p>
            We and our providers may process information in the United States and other countries.
            If you access the Service from outside the U.S., you understand that your information may
            be transferred to and processed in jurisdictions that may have different data-protection
            rules than your country.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">12. Children&apos;s Privacy</h2>
          <p>
            The Service is for businesses and is not directed to individuals under 18. We do not
            knowingly collect personal information from children. If you believe a child has provided
            us personal information, contact us and we will take appropriate steps to delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated policy on
            this page and update the &quot;Last updated&quot; date. Continued use of the Service
            after changes constitutes acceptance of the updated policy where permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">14. Contact</h2>
          <p>
            For privacy-related questions, access or deletion requests, or Google Play / app privacy
            inquiries, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
            . This Policy is also available at{" "}
            <a href="https://www.callgrabbr.com/privacy" className="text-primary hover:underline">
              https://www.callgrabbr.com/privacy
            </a>
            .
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
