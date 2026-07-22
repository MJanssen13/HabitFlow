/**
 * Camada de notificações do navegador. No mobile (Chrome/Android) o
 * `new Notification()` é bloqueado — é obrigatório usar o service worker
 * via `registration.showNotification()`. Aqui isolamos esses detalhes.
 */

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export const isNotificationSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const getPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
};

export const requestPermission = async (): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch {
    return getPermission();
  }
};

/** Registra o service worker (necessário para notificações no mobile). */
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.error('Falha ao registrar service worker:', e);
  }
};

/** Exibe uma notificação, preferindo o service worker (compatível com mobile). */
export const showNotification = async (title: string, options: NotificationOptions = {}): Promise<void> => {
  if (getPermission() !== 'granted') return;

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, { icon: '/icon.svg', badge: '/icon.svg', ...options });
        return;
      }
    } catch {
      /* cai para o fallback abaixo */
    }
  }

  try {
    new Notification(title, { icon: '/icon.svg', ...options });
  } catch {
    /* ambiente sem suporte a Notification no contexto da página */
  }
};
