let fetchController;
self.addEventListener('fetch', event => {
    if (event.request.destination != 'audio') {
        return
    }
    fetchController = new AbortController();
    let Heads = new Headers({"Icy-Metadata": "1"});
    const signal = fetchController.signal;
    let stream = new ReadableStream({
        start(controller) {
            let songs = Array();
            let decoder = new TextDecoder();
            let startFetch = fetch(event.request.url, {signal,headers: Heads});
            function pushStream(response) {
                let metaint = Number(response.headers.get("icy-metaint"));
                let stream = response.body
                    let reader = stream.getReader();
                return reader.read().then(function process(result) {
                    if (result.done) return;
                    let chunk = result.value;
                    for (let i = 0; i < chunk.length; i++) {
                        songs.push(chunk[i]); 
                        if(songs.length > (metaint + 4080)){
                            let musicData = Uint8Array.from(songs.splice(0,metaint));
                            let metalength = songs.shift() * 16;
                            if (metalength > 0){
                                let songtitle = decoder.decode(Uint8Array.from(songs.splice(0,metalength)));
                                self.clients.matchAll().then(function (clients){
                                    clients.forEach(function(client){
                                        client.postMessage({
                                            msg: songtitle
                                        });
                                    });
                                });
                            }
                            if(fetchController == 1)
                            {controller.close();
                             fetchController = 0;}
                            controller.enqueue(musicData);
                        }
                    }
                    return reader.read().then(process);
                });
            }
            startFetch
                .then(response => pushStream(response))
                .then(() => controller.close());
        }
    });
    event.respondWith(new Response(stream, {
        headers: {'Content-Type': 'audio/mpeg'}
    }));
});
self.addEventListener('install', event => {
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    clients.claim();
});
self.addEventListener('message', event => {
    if(event.origin != 'https://example.com'){
        return;
    }
    fetchController = 1;
});
