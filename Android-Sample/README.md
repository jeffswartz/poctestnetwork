Sample app for the OpenTok.js connection and stream statistics API
==================================================================

## Testing the app

This sample app uses Node.js as a web server.

To configure the app:

1. In Android Studio, select the File > Import Project command. Navigate to the root directory of
   this project, select the build.gradle file, and then click the OK button. The project opens in a
   new window.

   The Java code for the application is the ChatActivity class in the
   com.tokbox.android.demo.learningopentok package.

2. Download the [OpenTok Android SDK](https://tokbox.com/opentok/libraries/client/android/).

3. Locate the opentok-android-sdk-2.4.0.jar file in the OpenTok/libs directory of the OpenTok
   Android SDK, and drag it into the app/libs directory of the project.

4. Locate the armeabi and x86 directories in the OpenTok/libs directory of the OpenTok
   Android SDK, and drag them into the app/jniLibs directory of the project.

5. Set the following variables to a test OpenTok session ID, token, and API key:

   ```
   private static final String SESSION_ID = "";
   private static final String TOKEN = "";
   private static final String APIKEY = "";
   ```

   You can get your a test OpenTok session ID, a test token, and the API key at the
   [OpenTok dashboard](https://dashboard.tokbox.com/).

6. Debug the project on a supported device.

   For a list of supported devices, see the "Developer and client requirements"
   on [this page](https://tokbox.com/developer/sdks/android/).

The app uses a test stream to determine the client's ability to publish an stream.
At the end of the test it reports one of the following:

   * You're all set -- your client can publish an audio-video stream.

   * Voice-only -- Your bandwidth is too low for video.

   * You can't connect successfully -- Your bandwidth is too low for audio or video.

## Understanding the code

The MainActivity class connects to the OpenTok session. Upon connecting to the session,
the app  connects initializes an OpenTok Publisher object it uses to test stream quality. 
Upon publishing, the app subscribes to the test stream it publishes:

```java
@Override
public void onStreamCreated(PublisherKit publisherKit, Stream stream) {
    Log.i(LOGTAG, "Publisher onStreamCreated");
    if (mSubscriber == null) {
        subscribeToStream(stream);
    }
}
```

The View object representing the the publisher and subscriber videos are not added to the app's
view tree, so the test video is not displayed.

When subscribing to the stream, the app calls the `setVideoStatsListener(videoStatsListener)`
method of the Subscriber object. 

```
private void subscribeToStream(Stream stream) {
    mSubscriber = new Subscriber(MainActivity.this, stream);

    mSubscriber.setSubscriberListener(this);
    mSession.subscribe(mSubscriber);
    mSubscriber.setVideoStatsListener(new VideoStatsListener() {

        @Override
        public void onVideoStats(SubscriberKit subscriber,
                                 SubscriberKit.SubscriberVideoStats stats) {
            if (startTimeVideo == 0) {
                startTimeVideo = System.currentTimeMillis()/1000;
            }
            checkVideoStats(stats);

            //check video quality after TIME_WINDOW seconds
            if (((System.currentTimeMillis()/1000 - startTimeVideo) > TIME_WINDOW ) && !audioOnly ) {
                checkVideoQuality();
            }
        }

    });
    mSubscriber.setAudioStatsListener(new SubscriberKit.AudioStatsListener() {
        @Override
        public void onAudioStats(SubscriberKit subscriber, SubscriberKit.SubscriberAudioStats stats) {
            if (startTimeAudio == 0) {
                startTimeAudio = System.currentTimeMillis()/1000;
            }
            checkAudioStats(stats);


        }
    });
}
```

The code sets up VideoStatsListener and AudioStatsListener objects for the subscriber.
The `VideoStatsListener.onVideoStats(subscriber, stats)` method and `AudioStatsListener.onAudioStats(subscriber, stats)` are called periodically, when
statistics for the subscriber become available. The `stats` object passed into these
methods contain statistics for the stream's audio (or video):

The `stats` object pass into the `VideoStatsListener.onVideoStats()` has properties that
define statistics for the video:

* `videoBytesReceived` -- The cumulative number of video bytes received by the subscriber.

* `videoPacketsLost` -- The cumulative number of video packets lost by the subscriber.

* `videoPacketsReceived` -- The cumulative number of video packets received by the
   subscriber.

This `stats` object is passed into the `checkVideoStats()` method. This method calculates
the video packet loss (based on the values of `stats.videoPacketsLost` and
`stats.videoPacketsReceived`) and stores it in the `mVideoPLRatio` property. And it stores'
the video bandwidth (based on the value of `stats.videoBytesReceived`) in the `mVideoBw`
property:

```java
private void checkVideoStats(SubscriberKit.SubscriberVideoStats stats) {
    long now = System.currentTimeMillis()/1000;

    mVideoPLRatio = (double) stats.videoPacketsLost / (double) stats.videoPacketsReceived;
    if ((now - startTimeVideo) != 0) {
        mVideoBw = ((8 * (stats.videoBytesReceived)) / (now - startTimeVideo));
    }
    Log.i(LOGTAG, "Video bandwidth: " + mVideoBw + " Video Bytes received: "+ stats.videoBytesReceived + " Video packet lost: "+ stats.videoPacketsLost + " Video packet loss ratio: " + mVideoPLRatio);
}
````

After 15 seconds (`TIME_WINDOW`), the `checkVideoQuality()` method is called. The
`checkVideoQuality()` method checks to see if the video bandwidth (`mVideoBw`) and
the packet loss ratio (`mVideoPLRatio`) are outside of acceptable thresholds for video,
and displays UI messages. If the video quality is acceptable ("You're all set!"), the
app disconnects the OpenTok session:

```java
private void checkVideoQuality() {
    if (mSession != null) {
        Log.i(LOGTAG, "Check video quality stats data");
        if ( mVideoBw < 150000 || mVideoPLRatio > 0.03 ) {
            //go to audio call to check the quality with video disabled
            showAlert("Voice-only", "Your bandwidth is too low for video");
            mProgressDialog = ProgressDialog.show(this, "Checking your available bandwidth for voice only", "Please wait");
            mPublisher.setPublishVideo(false);
            mSubscriber.setSubscribeToVideo(false);
            mSubscriber.setVideoStatsListener(null);
            audioOnly = true;
        } else {
            //quality is good for video call
            mSession.disconnect();
            showAlert("All good", "You're all set!");
        }
    }
}
```

20 seconds after the subscriber starts receiving stream data (5 seconds after the video test
is completed), the app starts the `statsRunnable` process:

```java
@Override
public void onConnected(SubscriberKit subscriberKit) {
    Log.i(LOGTAG, "Subscriber onConnected");
    mHandler.postDelayed(statsRunnable, TEST_DURATION * TIME_SEC);
}
```

The `statsRunnable` process checks to see if the session is still connected (because the quality
was not adequate to support video). If it is, the `checkAudioQuality()` method is called:

```java
private Runnable statsRunnable = new Runnable() {
    @Override
    public void run() {
        if (mSession != null ) {
            checkAudioQuality();
            mSession.disconnect();
        }
    }
};
```

The `checkAudioQuality()` method checks the audio packet loss ratio collected by the
`AudioStatsListener.onAudioStats()` method. It then notifies the user whether a voice-only
call is supported, based on the packet loss ratio:

```java
private void checkAudioQuality() {
    if (mSession != null) {
        Log.i(LOGTAG, "Check audio quality stats data");
        if ( mAudioPLRatio > 0.05 ){
            showAlert("Not good", "You can't connect successfully");
        }
        else {
            showAlert("Voice-only", "Your bandwidth is too low for video");
        }
    }
}
```