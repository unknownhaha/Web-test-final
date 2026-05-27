const display = document.getElementById('countDisplay');
const btn = document.getElementById('addBtn');

if (!!window.SharedWorker) {
    const myWorker = new SharedWorker("shared-worker.js");

    myWorker.port.onmessage = function(e) {
        display.textContent = e.data;
        console.log('Message received from Shared Worker');
    };

    btn.onclick = () => {
        myWorker.port.postMessage('increment');
    };

    myWorker.port.start();
}