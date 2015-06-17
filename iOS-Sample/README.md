Sample app for the OpenTok.js connection and stream statistics API
==================================================================

## Testing the app

This sample app uses Node.js as a web server.

To configure the app:

1. Open the project in Xcode.

2. Add the OpenTok.framework file from the OpenTok iOS SDK to the Frameworks directory.

3. Set the following environment variables to your OpenTok API key and API secret:

   ```
   // Replace with your OpenTok API key
   static NSString* const kApiKey = @"";
   // Replace with your generated session ID
   static NSString* const kSessionId = @"";
   // Replace with your generated token
   static NSString* const kToken = @"";
   ```

   You can get your API key and API secret at the
   [OpenTok dashboard](https://dashboard.tokbox.com/).

Now you can debug the app on a supported iOS device.

The app uses a test stream to determine the client's ability to publish an stream that has audio
and video. At the end of the test it reports one of the following:

   * Your client can publish an audio-video stream.

   * Your bandwidth can support audio only.

   * Your bandwidth is too low for audio.

## Understanding the code

The app includes a OTNetworkStatsKit.h file. This header file exposes the
`OTSubscriber networkStatsDelegate` property, the OTSubscriberKitNetworkStatsDelegate, the OTSubscriberKitAudioNetworkStats interface, and the OTSubscriberKitVideoNetworkStats
interface. These undocumented features in the OpenTok iOS SDK enable the stream statistics
functionality.

When the view of the main ViewController loads, it instantiates a OTNetworkTest object,
defined by a class included in this sample app. The code then calls the `[NetworkTest runConnectivityTestWithApiKey:sessionId:token:executeQualityTest:qualityTestDuration:delegate:self]`
method:

```
_networkTest = [[OTNetworkTest alloc] init];

[self.activityIndicatorView startAnimating];
if (kApiKey.length == 0 || kSessionId.length == 0 || kToken == 0)
{
    self.statusLabel.text = @"Provide api key,session id and token";
    self.activityIndicatorView.hidden = YES;
}
else
{
    self.statusLabel.text = @"Checking network...";
}
self.resultLabel.text = @"";
[_networkTest runConnectivityTestWithApiKey:kApiKey
                                  sessionId:kSessionId
                                      token:kToken
                         executeQualityTest:YES
                        qualityTestDuration:10
                                   delegate:self];
```

The OTNetworkTestDelegate class connects to the OpenTok session and publishes a test stream
to the session. Upon the stream being created, the app subscribes to it, so that it can
collect statistics for it.

The OTNetworkTestDelegate object sets the `networkStatsDelegate` property of the subscriber to
itself:

_subscriber.networkStatsDelegate = self;

This delegate includes two methods: 

* `[OTSubscriberKitNetworkStatsDelegate subscriber:audioNetworkStatsUpdated:]`
* `[OTSubscriberKitNetworkStatsDelegate subscriber:videoNetworkStatsUpdated:]`

These delegate messages are sent periodically to report audio and video statistics for the
subscriber.

The second parameter of the
`[OTSubscriberKitNetworkStatsDelegate subscriber:videoNetworkStatsUpdated:]` method
is a OTSubscriberKitVideoNetworkStats object, which includes the following properties:

* `videoBytesReceived` -- The cumulative number of video bytes received by the subscriber.

* `videoPacketsLost` -- The cumulative number of video packets lost by the subscriber.

* `videoPacketsReceived` -- The cumulative number of video packets received by the
   subscriber.

The implementation of the
`[OTSubscriberKitNetworkStatsDelegate subscriber:videoNetworkStatsUpdated:]`
method calculates the video bandwidth and stores it in audio `video_bw` property.
This is based on the `videoBytesReceived` property of the `stats` object passed
into the method:

```
- (void)subscriber:(OTSubscriberKit*)subscriber
videoNetworkStatsUpdated:(OTSubscriberKitVideoNetworkStats*)stats
{
    if (prevVideoTimestamp == 0)
    {
        prevVideoTimestamp = stats.timestamp;
        prevVideoBytes = stats.videoBytesReceived;
    }
    
    if (stats.timestamp - prevVideoTimestamp >= TIME_WINDOW)
    {
        video_bw = (8 * (stats.videoBytesReceived - prevVideoBytes)) / ((stats.timestamp - prevVideoTimestamp) / 1000ull);

        [self processStats:stats];
        prevVideoTimestamp = stats.timestamp;
        prevVideoBytes = stats.videoBytesReceived;
        NSLog(@"videoBytesReceived %llu, bps %ld, packetsLost %.2f",stats.videoBytesReceived, video_bw, video_pl_ratio);
    }
}
```

The `[self processStats:]` method calculates the video packet loss ratio,
stored as `video_pl_ratio`, or the audio packet loss ratio, stored as
`audio_pl_ratio`, depending on the stats passed in.

```
- (void)processStats:(id)stats
{
    if ([stats isKindOfClass:[OTSubscriberKitVideoNetworkStats class]])
    {
        video_pl_ratio = -1;
        OTSubscriberKitVideoNetworkStats *videoStats =
        (OTSubscriberKitVideoNetworkStats *) stats;
        if (prevVideoPacketsRcvd != 0) {
            uint64_t pl = videoStats.videoPacketsLost - prevVideoPacketsLost;
            uint64_t pr = videoStats.videoPacketsReceived - prevVideoPacketsRcvd;
            uint64_t pt = pl + pr;
            if (pt > 0)
                video_pl_ratio = (double) pl / (double) pt;
        }
        prevVideoPacketsLost = videoStats.videoPacketsLost;
        prevVideoPacketsRcvd = videoStats.videoPacketsReceived;
    }
    if ([stats isKindOfClass:[OTSubscriberKitAudioNetworkStats class]])
    {
        audio_pl_ratio = -1;
        OTSubscriberKitAudioNetworkStats *audioStats =
        (OTSubscriberKitAudioNetworkStats *) stats;
        if (prevAudioPacketsRcvd != 0) {
            uint64_t pl = audioStats.audioPacketsLost - prevAudioPacketsLost;
            uint64_t pr = audioStats.audioPacketsReceived - prevAudioPacketsRcvd;
            uint64_t pt = pl + pr;
            if (pt > 0)
                audio_pl_ratio = (double) pl / (double) pt;
        }
        prevAudioPacketsLost = audioStats.audioPacketsLost;
        prevAudioPacketsRcvd = audioStats.audioPacketsReceived;
    }
}
```

The second parameter of the
`[OTSubscriberKitNetworkStatsDelegate subscriber:audioNetworkStatsUpdated:]` method
is a OTSubscriberKitAudioNetworkStats object, which includes the following properties:

* `audioBytesReceived` -- The cumulative number of audio bytes received by the subscriber.

* `audioPacketsLost` -- The cumulative number of audio packets lost by the subscriber.

* `audioPacketsReceived` -- The cumulative number of audio packets received by the
   subscriber.

The implementation of the
`[OTSubscriberKitNetworkStatsDelegate subscriber:audioNetworkStatsUpdated:]`
method calculates the audio bandwidth and stores it in an `audio_bw` property.
This is based on the `videoBytesReceived` property of the `stats` object passed
into the method:

```
- (void)subscriber:(OTSubscriberKit*)subscriber
audioNetworkStatsUpdated:(OTSubscriberKitAudioNetworkStats*)stats
{
    if (prevAudioTimestamp == 0)
    {
        prevAudioTimestamp = stats.timestamp;
        prevAudioBytes = stats.audioBytesReceived;
    }
    
    if (stats.timestamp - prevAudioTimestamp >= TIME_WINDOW)
    {
        audio_bw = (8 * (stats.audioBytesReceived - prevAudioBytes)) / ((stats.timestamp - prevAudioTimestamp) / 1000ull);

        [self processStats:stats];
        prevAudioTimestamp = stats.timestamp;
        prevAudioBytes = stats.audioBytesReceived;
        NSLog(@"audioBytesReceived %llu, bps %ld, packetsLost %.2f",stats.audioBytesReceived, audio_bw,audio_pl_ratio);
    }
}
```

When the subscriber starts streaming, it sets up a timer that calls the
`[self checkQualityAndDisconnectSession]` method after the test duration (10 seconds):

```

- (void)subscriberDidConnectToStream:(OTSubscriberKit*)subscriber
{
    NSLog(@"subscriberDidConnectToStream (%@)",
          subscriber.stream.connection.connectionId);
    assert(_subscriber == subscriber);

    if(!_runQualityStatsTest)
    {
        _result = OTNetworkTestResultVideoAndVoice;
        [_session disconnect:nil];
    } else
    {
        dispatch_time_t delay = dispatch_time(DISPATCH_TIME_NOW,
                                              _qualityTestDuration * NSEC_PER_SEC);
        dispatch_after(delay,dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT,0),^{
            
            [self checkQualityAndDisconnectSession];
        });
    }
}
```
The `[self checkQualityAndDisconnectSession]` method checks to see if the client
can support publishing video and audio, based on the video and audio bandwidth and
packet loss ratio, collected by the OTSubscriberKitNetworkStatsDelegate:

```
BOOL canDoVideo = (video_bw < 50000 || video_pl_ratio > 0.03);
BOOL canDoAudio = (audio_bw < 25000 || audio_pl_ratio > 0.05);
```

The method sets a `result` property with the appropriate result and passes it into
the `dispatchResultsToDelegateWithResult` method, which calls the `networkTestDidCompleteWithResult`
delegate method. The view controller receives this result and displays a message in
the user interface based on the result.