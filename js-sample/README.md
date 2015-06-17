Sample app for the OpenTok.js stream statistics API
===================================================

## Testing the app

This sample app uses Node.js as a web server.

To configure the app:

1. Install the dependencies:

   ```npm update```

2. Set the following environment variables to your OpenTok API key and API secret:

   ```
   export API_KEY=12345
   export API_SECRET=12345
   ```

   You can get your API key and API secret at the
   [OpenTok dashboard](https://dashboard.tokbox.com/).

Now you can run the app:

```
node server
```

By default, the app runs on port 5000.

1. In a web browser, open http://localhost:5000/.

2. Grant the app access to your camera and microphone.

3. The app uses a test stream to determine the client's ability to publish an stream that has a
   1280-by-720-pixel video. At the end of the test it reports one of the following:

   * You're all set -- your client can publish an audio-video stream that uses
     1280-by-720-pixel video.

   * Your bandwidth is too low for audio.

   * Your bandwidth can support audio only.

## Understanding the code

The JavaScript code that uses OpenTok.js is in the src/js directory.

The node app (see the server.js file) uses the OpenTok Node.js server SDK to generate
a session and a token for the session. Note that the app uses a session that uses the
routed media mode -- one that uses the [OpenTok Media
Router](https://tokbox.com/developer/guides/create-session/#media-mode).
A routed session is required to get statistics for the stream published by
the local client.

The main app.js file connects initializes an OpenTok publisher it uses to test stream quality.
It also connects to the OpenTok session. Upon connecting to the session and initializing the publisher, the app subscribes to the test stream it publishes:

```javascript
subscriber = session.subscribe(
  publisher.stream,
  subscriberEl,
  {
    audioVolume: 0,
    testNetwork: true
  },
  callbacks.onSubscribe
);
```

Note that the code sets the `testNetwork` option of the `Session.subscribe()` method to `true`.
This causes the app to actually use the stream returned by the OpenTok Media Router.
(By default, when you subscribe to a stream you publish, OpenTok.js simply uses the local camera
fead as the video display for the Subscriber element in the HTML DOM.)

Also, the code sets the `audioVolume` option of the `Session.subscribe()` method to `0`, so that
the subscriber does not cause audio feedback.

The DOM elements for the publisher and subscriber are not added to the HTML DOM,
so the test video is not displayed:

```javascript
var publisherEl = document.createElement('div'),
    subscriberEl = document.createElement('div'),
```

Upon subscribing to the test stream, the app calls the `testStreamingCapability()` function.
This function calls the `performQualityTest()` function, which is defined in the
src/lib/quality-test.js file. And this function initiates a BandwidthCalculator object (defined in
the src/lib/quality-test.js file) and calls its `start()` method. This method periodically calls
the `getStats()` method of the Subscriber:

```javascript
config.subscriber.getStats(function(error, stats) {
  // ...
}
```

The `Subscriber.getStats()` method gets the stream statistics for the subscriber and (on success)
passes them into the completion handler. The statistics include information on the stream's audio
and video:

* `bytesReceived` -- The cumulative number of media (audio or video) bytes received by the
   subscriber since the `getStats()` method was called.

* `packetsLost` -- The cumulative number of (audio or video) packets lost by the
   subscriber since the `getStats()` method was called.

* `packetsReceived` -- The cumulative number of (audio or video) packets received by the
   subscriber since the `getStats()` method was called.

Based on these statistics (and comparing them to the statistics from the previous period), the
completion handler for the `Subscriber.getStats()` method assembles a `snapshot` object,
which includes the the following:

* `bitsPerSecond` -- Bits per second

* `packetLossRatioPerSecond` -- Packet loss ratio per second

* `packetsLostPerSecond` -- Packets lost per second

* `packetsPerSecond` -- Packets per second

The BandwidthCalculator stores these in a buffer. The `performQualityTest()` function logs the stats
to the debug console.

The quality stats test stops after 15 seconds, and the completion handler of the
`performQualityTest()` method checks the video statistics and audio statistics to see if
they support publishing video or publishing audio-only, based on thresholds for the video
bitrate, the video packet loss ratio, and the audio packet loss ratio:

```javascript
if (results.video.bitsPerSecond > 150000 && results.video.packetLossRatioPerSecond < 0.03 && results.audio.packetLossRatioPerSecond < 0.03) {
  return callback(false, {
    text: "You're all set!",
    icon: 'assets/icon_tick.svg'
  });
}

if ((results.video.packetLossRatioPerSecond + results.audio.packetLossRatioPerSecond) / 2 < 0.05) {
  return callback(false, {
    text: 'Your bandwidth can support audio only',
    icon: 'assets/icon_warning.svg'
  });
}
```

If the results of this initial test do not support video or audio-only conditions, the app runs
the quality test again, this time using an audio-only stream. At the end of this test, the
app determines whether conditions support audio-only:

```javascript
statusMessageEl.innerText = 'Trying audio only';
publisher.publishVideo(false);

performQualityTest({subscriber: subscriber, timeout: 5000}, function(error, results) {
  if (results.audio.packetLossRatioPerSecond < 0.05) {
    return callback(false, {
      text: 'Your bandwidth can support audio only',
      icon: 'assets/icon_warning.svg'
    });
  }
  return callback(false, {
    text: 'Your bandwidth is too low for audio',
    icon: 'assets/icon_error.svg'
  });
});
```
