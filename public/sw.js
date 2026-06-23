self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request));
});

self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "Nuevo turno";
  const options = {
    body: data.body || "Tenés un nuevo turno registrado",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/admin/turnos" },
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/admin/turnos";
  e.waitUntil(clients.openWindow(url));
});
