self.onmessage = (e) => {
    const limit = e.data;
    let lastPrime = 2;
    
    for (let i = 2; i <= limit; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) { isPrime = false; break; }
        }
        if (isPrime) lastPrime = i;
    }
    
    self.postMessage(lastPrime); 
};