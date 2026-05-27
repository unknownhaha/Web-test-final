if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {

        // 💡 ข้อแนะนำสำหรับการพัฒนา (Best Practices)
        // 1. เปิด Chrome DevTools (F12) -> Application -> Service Workers
        // 2. ติ๊กช่อง "Update on reload" เสมอ เพื่อให้เบราว์เซอร์ดึงไฟล์ sw1.js ตัวใหม่สุดทุกครั้งที่กดรีเฟรช

        navigator.serviceWorker
            .register('sw1.js')
            .then(registration => {
                console.log('Service Worker: Registered within scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker: Registration failed:', error);
            });
    });
}