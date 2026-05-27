let sharedCount = 0;
let ports = [];

onconnect = function(e) {
    const port = e.ports[0];
    ports.push(port);

    port.onmessage = function(event) {
        if (event.data === 'increment') {
            sharedCount++;
        }
        ports.forEach(p => p.postMessage(sharedCount));
    };

    port.postMessage(sharedCount);
    port.start();
};