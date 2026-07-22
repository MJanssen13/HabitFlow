/* Service worker do HabitFlow.
 * Habilita notificações no mobile (registration.showNotification) e prepara
 * o terreno para Web Push no futuro. Não faz cache offline por enquanto. */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Recebe pedidos da página para exibir uma notificação.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'show-notification') {
    self.registration.showNotification(data.title, data.options || {});
  }
});

// Ao clicar na notificação, foca (ou abre) o app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
      return undefined;
    }),
  );
});

// Suporte a Web Push (usado quando houver backend enviando pushes).
self.addEventListener('push', (event) => {
  let payload = { title: 'HabitFlow', options: {} };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    payload = { title: 'HabitFlow', options: { body: event.data ? event.data.text() : '' } };
  }
  event.waitUntil(self.registration.showNotification(payload.title, payload.options));
});
