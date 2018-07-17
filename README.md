# icecast-shoutcast-metadata-grabber
Service worker to extract icecast / shoutcast metadata from your stream. Browser based solution for perfectly timed now playing updates

After trying many methods of updating the now playing info on our player and getting sick of the timing always being sketchy I decided to investigate how the servers pass the info.

Turns out that if you add an extra header when you connect to the server you can make it send you a different stream which is made up of the mp3 and the metadata spliced together. The problem is that your browser won't play it, as it's not a proper mp3.

This is a simple service worker which will intercept network requests from any html audio elements on your page and add the header to a fetch request to retrieve the metadata stream from your server.

It then handles the response, splitting the metadata and the mp3 data and returns the mp3 data as a readable stream to your audio element and posts a message containing the metadata to your main window.

The header needed to make the server output the metadata stream is only available under the same origin, this is a limitation of the fetch api so if your web server is on a different domain to your streaming server you'll have to come up with your own workaround for that.

Simply register the service worker on the page your player is on and it should start doing it's thing. You just need an event handler for messages from the worker to do something with the metadata.

Simple demo at https://toohotradio.net/metadata/
