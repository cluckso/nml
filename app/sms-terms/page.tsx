import type { Metadata } from "next"
import Link from "next/link"
import { PublicSmsOptInForm } from "@/components/consent/PublicSmsOptInForm"

export const metadata: Metadata = {
  title: "SMS Opt-In & Messaging Terms - NeverMissLead-AI",
  description:
    "SMS opt-in form and messaging terms for NeverMissLead-AI. Subscribe to call alerts and account notifications.",
}

/**
 * Public page with live SMS opt-in form and terms for Twilio toll-free verification.
 * The URL must lead directly to the opt-in workflow (form) and be publicly accessible.
 */
export default function SmsTermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">SMS Opt-In & Messaging Terms</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated: {new Date().toLocaleDateString("en-US")}
      </p>

      {/* Opt-in form first so the URL leads directly to consent collection (Twilio requirement) */}
      <PublicSmsOptInForm />

      <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
        {/* ---------- Program Description ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Program Description
          </h2>
          <p>
            NeverMissLead-AI provides AI-powered call answering and lead intake
            for businesses. When you opt in to our SMS program, you will receive
            automated text messages related to:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>New call and lead notifications</li>
            <li>Emergency call alerts</li>
            <li>Account and service updates</li>
            <li>Trial and billing reminders</li>
          </ul>
        </section>

        {/* ---------- How You Opt In ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            How You Opt In
          </h2>
          <p>
            During account setup (trial registration or business onboarding),
            you are presented with the following checkbox that you must
            affirmatively check to receive SMS messages:
          </p>

          {/* Visual replica of the checkbox */}
          <div className="my-6 rounded-lg border border-border bg-card p-5 shadow-sm">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked
                readOnly
                className="mt-1 rounded"
              />
              <span className="text-sm text-foreground">
                I agree to receive SMS/text messages from NeverMissLead-AI
                regarding call alerts, lead notifications, and account updates.
              </span>
            </label>
            <p className="mt-2 pl-6 text-xs text-muted-foreground">
              Message frequency varies based on call volume. Message and data
              rates may apply. Reply <strong>STOP</strong> to opt out at any
              time, or <strong>HELP</strong> for help. By checking this box, you
              consent to receive automated text messages at the phone number
              provided. This consent is not a condition of purchase. View our{" "}
              <Link href="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-primary underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>

          <p>
            The checkbox is <strong>not pre-checked</strong>. You must
            affirmatively select it before proceeding. Opting in is{" "}
            <strong>not required</strong> to purchase any service from
            NeverMissLead-AI.
          </p>
        </section>

        {/* ---------- Message Frequency ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Message Frequency
          </h2>
          <p>
            Message frequency varies based on your call volume and account
            activity. You may receive a text message each time a new call or
            lead is received by the AI on your behalf. Typical volume ranges
            from a few messages per week to several per day depending on
            business activity.
          </p>
        </section>

        {/* ---------- Message & Data Rates ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Message &amp; Data Rates
          </h2>
          <p>
            Message and data rates may apply. Check with your mobile carrier for
            details about your text messaging plan.
          </p>
        </section>

        {/* ---------- Opt-Out ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            How to Opt Out
          </h2>
          <p>
            You may opt out of SMS messages at any time by replying{" "}
            <strong>STOP</strong> to any message you receive from us. You will
            receive a one-time confirmation message and will no longer receive
            texts. You may also text <strong>CANCEL</strong>,{" "}
            <strong>UNSUBSCRIBE</strong>, <strong>QUIT</strong>, or{" "}
            <strong>END</strong> to opt out.
          </p>
          <p className="mt-2">
            To re-subscribe, reply <strong>START</strong> or{" "}
            <strong>YES</strong> at any time, or update your preferences in your
            account settings.
          </p>
        </section>

        {/* ---------- Help ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Help</h2>
          <p>
            For help, reply <strong>HELP</strong> to any message from us, or
            contact us at the email below. You will receive a message with
            support information.
          </p>
        </section>

        {/* ---------- Supported Carriers ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Supported Carriers
          </h2>
          <p>
            Supported carriers include but are not limited to: AT&amp;T,
            T-Mobile, Verizon, Sprint/T-Mobile, U.S. Cellular, and other major
            U.S. carriers. Carriers are not liable for delayed or undelivered
            messages.
          </p>
        </section>

        {/* ---------- Privacy ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Privacy
          </h2>
          <p>
            We will not share your phone number or opt-in data with third
            parties for their marketing purposes. For full details, see our{" "}
            <Link href="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        {/* ---------- Contact ---------- */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Contact
          </h2>
          <p>
            NeverMissLead-AI
            <br />
            Email: support@nevermisslead-ai.com
            <br />
            Website:{" "}
            <Link href="/" className="text-primary underline">
              nevermisslead-ai.com
            </Link>
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        <Link href="/" className="text-primary hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
