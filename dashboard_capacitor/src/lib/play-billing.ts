import { registerPlugin } from '@capacitor/core'
import { Capacitor } from '@capacitor/core'
import { openExternalUrl } from './site'

export type PlayBillingAvailability = {
  connected: boolean
  billingChoiceAvailable: boolean
  externalLinkAvailable: boolean
  choiceScreenType?: string
  debugMessage?: string
}

type PlayBillingNative = {
  getAvailability(): Promise<PlayBillingAvailability>
  prepareExternalCheckout(): Promise<{
    available: boolean
    externalTransactionToken: string
    debugMessage?: string
  }>
  launchExternalCheckout(options: {
    url: string
    externalTransactionToken?: string
  }): Promise<{ launched: boolean; usedPlayApi: boolean; debugMessage?: string }>
}

const PlayBilling = registerPlugin<PlayBillingNative>('PlayBilling')

export async function getPlayBillingAvailability(): Promise<PlayBillingAvailability> {
  if (!Capacitor.isNativePlatform()) {
    return {
      connected: false,
      billingChoiceAvailable: false,
      externalLinkAvailable: false,
      debugMessage: 'Not a native Android build',
    }
  }
  try {
    return await PlayBilling.getAvailability()
  } catch (error) {
    return {
      connected: false,
      billingChoiceAvailable: false,
      externalLinkAvailable: false,
      debugMessage: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function preparePlayExternalToken(): Promise<string> {
  if (!Capacitor.isNativePlatform()) return ''
  try {
    const result = await PlayBilling.prepareExternalCheckout()
    return result.available ? result.externalTransactionToken : ''
  } catch {
    return ''
  }
}

/** Open Stripe Checkout / Portal using Play Billing Choice when eligible. */
export async function openStripeCheckoutUrl(url: string, externalTransactionToken?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    openExternalUrl(url)
    return
  }
  try {
    await PlayBilling.launchExternalCheckout({
      url,
      externalTransactionToken: externalTransactionToken ?? '',
    })
  } catch {
    openExternalUrl(url)
  }
}
