const statusDisplay = document.getElementById('statusDisplay');
const limit = 10000000;

function findPrimeSync(limit) {
    let lastPrime = 2;
    for (let i = 2; i <= limit; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) { isPrime = false; break; }
        }
        if (isPrime) lastPrime = i;
    }
    return lastPrime;
}

// wo worker
document.getElementById('noWorkerBtn').onclick = () => {
    statusDisplay.textContent = "Calculating on main thread";
    
    setTimeout(() => {
        const start = performance.now();
        const result = findPrimeSync(limit);
        const end = performance.now();
        statusDisplay.textContent = `Completed, found ${e.data}`;
    }, 100);
};

// w Worker
if (window.Worker) {
    const myWorker = new Worker('worker.js'); 

    document.getElementById('workerBtn').onclick = () => {
        statusDisplay.textContent = "Calculating with background thread";
        myWorker.postMessage(limit); // ส่งข้อมูลไปที่ Worker
    };

    myWorker.onmessage = (e) => {
        statusDisplay.textContent = `Completed, found ${e.data}`;
    };
}