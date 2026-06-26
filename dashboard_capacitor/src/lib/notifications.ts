import { PushNotifications } from '@capacitor/push-notifications'
import type { Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

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
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permStatus)
      return
    }

    await PushNotifications.register()

    await PushNotifications.addListener('registration', (token: Token) => {
      console.log('[Push] Registration token:', token.value)
      if (onToken) onToken(token.value)
    })

    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('[Push] Registration error:', error)
    })

    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('[Push] Notification received:', notification)
      if (onNotification) onNotification(notification)
    })

    await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('[Push] Notification action performed:', notification)
      if (onAction) onAction(notification)
    })
  } catch (error) {
    console.error('[Push] Setup error:', error)
  }
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
