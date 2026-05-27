importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    // 1. นำเข้าโมดูลที่จำเป็นของ Workbox
    const { routing, strategies, precaching } = workbox;

    // 2. การจัดการแคชด้วยกลยุทธ์ต่างๆ (Caching Strategies)
    
    // 2.1 แคชไฟล์ HTML ด้วย NetworkFirst (พยายามดึงข้อมูลใหม่จากเน็ตก่อน ถ้าไม่ได้ค่อยเอาจากแคช)
    routing.registerRoute(
        ({ request }) => request.destination === 'document',
        new strategies.NetworkFirst({
            cacheName: 'html-cache',
        })
    );

    // 2.2 แคชไฟล์ CSS และ JS ด้วย StaleWhileRevalidate (แสดงผลจากแคชทันที แล้วดึงของใหม่จากเน็ตมาอัปเดตแคชทีหลัง)
    routing.registerRoute(
        ({ request }) => request.destination === 'style' || request.destination === 'script',
        new strategies.StaleWhileRevalidate({
            cacheName: 'static-resources',
        })
    );

    // 2.3 แคชไฟล์รูปภาพ ด้วย CacheFirst (เอาจากแคชก่อนเสมอ ถ้าไม่มีค่อยไปโหลดจากเน็ต)
    routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new strategies.CacheFirst({
            cacheName: 'image-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 20, // เก็บสูงสุด 20 รูป
                    maxAgeSeconds: 7 * 24 * 60 * 60, // เก็บไว้ 7 วัน
                })
            ]
        })
    );

    // 3. ข้ามขั้นตอน Waiting เพื่อให้ Service Worker ตัวใหม่ทำงานทันที
    self.addEventListener('install', () => {
        self.skipWaiting();
    });

    self.addEventListener('activate', () => {
        self.clients.claim();
    });

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}