self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.warn('Push event data is not JSON:', event.data.text());
            data = { title: 'Notification', body: event.data.text() };
        }
    }

    const title = data.title || 'Clarity Reminder';
    const options = {
        body: data.body || 'You have a new notification.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click received.');

    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const urlToOpen = event.notification.data.url;

            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
