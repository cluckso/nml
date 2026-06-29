import { PushNotifications } from '@capacitor/push-notifications'
import type { Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

type ListenerHandle = Awaited<ReturnType<typeof PushNotifications.addListener>>

let listenersRegistered = false
let listenerHandles: ListenerHandle[] = []

async function ensureListeners(
  onToken?: (token: string) => void,
  onNotification?: (notification: PushNotificationSchema) => void,
  onAction?: (notification: ActionPerformed) => void
): Promise<void> {
  if (listenersRegistered) return

  listenerHandles.push(
    await PushNotifications.addListener('registration', (token: Token) => {
      console.log('[Push] Registration token:', token.value)
      onToken?.(token.value)
    })
  )

  listenerHandles.push(
    await PushNotifications.addListener('registrationError', (error: unknown) => {
      console.error('[Push] Registration error:', error)
    })
  )

  listenerHandles.push(
    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('[Push] Notification received:', notification)
      onNotification?.(notification)
    })
  )

  listenerHandles.push(
    await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('[Push] Notification action performed:', notification)
      onAction?.(notification)
    })
  )

  listenersRegistered = true
}

export async function registerPushNotifications(
  onToken?: (token: string) => void,
  onNotification?: (notification: PushNotificationSchema) => void,
  onAction?: (notification: ActionPerformed) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Push] Not on native platform, skipping registration')
    return
  }

  try {
    await ensureListeners(onToken, onNotification, onAction)

    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permStatus)
      return
    }

    await PushNotifications.register()
  } catch (error) {
    console.error('[Push] Setup error:', error)
  }
}

export async function unregisterPushListeners(): Promise<void> {
  await Promise.all(listenerHandles.map((handle) => handle.remove()))
  listenerHandles = []
  listenersRegistered = false
}

export async function getDeliveredNotifications() {
  try {
    const notificationList = await PushNotifications.getDeliveredNotifications()
    return notificationList.notifications
  } catch (error) {
    console.error('[Push] Failed to get delivered notifications:', error)
    return []
  }
}

export async function removeAllDeliveredNotifications() {
  try {
    await PushNotifications.removeAllDeliveredNotifications()
  } catch (error) {
    console.error('[Push] Failed to remove notifications:', error)
  }
}
