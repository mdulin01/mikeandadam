// Firebase Cloud Messaging Service Worker
// This file MUST be at the root of the public directory
//
// DATA-ONLY push pattern (2026-07-05): the server never sends a
// `notification` payload — only `data`. This SW is the single place
// a notification is displayed, which prevents the double-notification
// bug (SDK auto-display + SW display).

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB4pbBVj7Dryy3C57V2s6L4N_znGEyuib0",
  authDomain: "trip-planner-5cc84.firebaseapp.com",
  projectId: "trip-planner-5cc84",
  storageBucket: "trip-planner-5cc84.firebasestorage.app",
  messagingSenderId: "803115812045",
  appId: "1:803115812045:web:d49aa3df4ee4038c5fd584",
});

const messaging = firebase.messaging();

// Display background pushes from the data payload only.
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  // Legacy senders may still include payload.notification — if so the
  // browser already displayed it; don't show a second one.
  if (payload.notification) return;

  self.registration.showNotification(d.title || 'Mike & Adam', {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || 'mikeandadam', // same tag replaces instead of stacking
    data: { url: d.url || '/' },
    vibrate: [200, 100, 200],
  });
});

// Click → focus an existing tab and navigate it, else open a new one.
// Hardened 2026-07-06: normalize to an absolute same-origin URL and fall
// back to opening the app root — iOS standalone PWAs sometimes land on a
// blank page when navigate/openWindow gets a URL they don't like.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = event.notification.data?.url || '/';
  let target;
  try {
    const u = new URL(raw, self.location.origin);
    target = u.origin === self.location.origin ? u.href : self.location.origin + '/';
  } catch {
    target = self.location.origin + '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return Promise.resolve(client.focus()).then(() => {
            if ('navigate' in client) {
              return client.navigate(target).catch(() => {});
            }
          });
        }
      }
      return clients.openWindow(target).catch(() => clients.openWindow('/'));
    })
  );
});
