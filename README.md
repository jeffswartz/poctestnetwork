OpenTok stream statistics API
=============================
Sample code for the OpenTok stream statistics API.

## Sample code

See the sample subdirectories to see sample code for using this API. Each sample
subdirectory includes a README.md file that describes how the app uses the stream
statistics API.

## OpenTok Android SDK API additions

The OpenTok Android SDK includes the following API additions (which are not included in the
main documentation).

### SubscriberKit.setAudioStatsListener(AudioStatsListener listener)

Sets up a listener for subscriber audio statistics. The listener object implements the
`onAudioStats(SubscriberKit subscriber, SubscriberAudioStats stats)`
method of the AudioStatsListener interface. This method is called periodically to report the 
following:

* Total audio packets lost
* Total audio packets received
* Total audio bytes received

_Parameters_

The method has one parameter -- listener​-- which is method that implements the
`onAudioStats(SubscriberKit subscriber, SubscriberAudioStats stats)` method defined by the
AudioStatsListener interface. This method is called periodically to report audio statistics, which
are passed in as the `stats`​parameter. This `stats`​object, defined by the SubscriberAudioStats
class, has the following properties:

* `audioBytesReceived`​-- (int) The total number of audio bytes received by the subscriber
* `audioPacketsLost`​-- (int) The total number of audio packets that did not reach the subscriber
* `audioPacketsReceived`​-- (int) The total number of audio packets received by the subscriber
* `timestamp`​-- (double) The timestamp, in milliseconds since the Unix epoch, for
  when these stats were gathered

### SubscriberKit.setVideoStatsListener(VideoStatsListener listener)

Sets up a listener for subscriber video statistics. The listener object implements the
`onVideoStats(SubscriberKit subscriber, SubscriberVideoStats stats)`
method of the VideoStatsListener interface. This method is called periodically to report the 
following:

* Total video packets lost
* Total video packets received
* Total video bytes received

_Parameters_

The method has one parameter -- listener​-- which is method that implements the `onVideoStats(SubscriberKit subscriber, SubscriberVideoStats stats)` method defined by the VideoStatsListener interface. This method is called periodically to to report video statistics, which are passed in as the ​stats​parameter. This ​stats​object, defined by the SubscriberAudioStats class, has the following properties:

* `videoBytesReceived`​-- (int) The total number of video bytes received by the subscriber
* `videoPacketsLost`​-- (int) The total number of video packets that did not reach the subscriber
* `videoPacketsReceived`​-- (int) The total number of video packets received by the subscriber
* `timestamp`​-- (double) The timestamp, in milliseconds since the Unix epoch, for
  when these stats were gathered

## OpenTok iOS SDK API additions

The OpenTok iOS SDK includes the following API additions (which are not included in the
main documentation).

### [OTSubscriberKit setNetworkStatsDelegate:]

Sets up a delegate object for subscriber quality statistics. This object implements the OTSubscriberKitNetworkStatsDelegate protocol. This object is sent messages reporting the following:

* Total audio and video packets lost
* Total audio and video packets received
* Total audio and video bytes received

### [OTSubscriberKitNetworkStatsDelegate subscriber: audioNetworkStatsUpdated:]

This message is sent periodically to report audio statistics for the subscriber. The second parameter, stats, which is defined by the OTSubscriberKitAudioNetworkStats interface, includes the following properties:

* `audioBytesReceived` (uint64_t) -- The total number of audio bytes received by the subscriber
* `audioPacketsLost` (uint64_t) -- The total number of audio packetsthat did not reach the
  subscriber
* `audioPacketsReceived` (uint64_t) -- The total number of audio packets received by the subscriber
* `timestamp` (double) -- The timestamp, in milliseconds since the Unix epoch, for when these stats
  were gathered

### [OTSubscriberKitNetworkStatsDelegate subscriber: videoNetworkStatsUpdated:]

This message is sent periodically to report video statistics for the subscriber. The second parameter, stats, which is defined by the OTSubscriberKitVideoNetworkStats interface, includes the following properties:

* `videoBytesReceived` (uint64_t) -- The total number of video bytes received by the subscriber
* `videoPacketsLost` (uint64_t) -- The total number of video packets lost by the subscriber
* `videoPacketsReceived` (uint64_t) -- The total number of video packets received by the subscriber
* `timestamp` (double) -- The timestamp, in milliseconds since the Unix epoch, for when these stats
  were gathered

## OpenTok.js API additions

The OpenTok.js library includes the following API additions (which are not included in the
main documentation).

### Session.subscribe()

The `options` parameter now includes a `testNetwork` property. Set this to `true` when you
want to subscribe to a stream you publish, to monitor its stream statistics using the
`Subscriber.getStats()` method.

### Subscriber.getStats()

Returns the following details on the subscriber stream quality, including the following:

* Total audio and video packets lost
* Total audio and video packets received
* Total audio and video bytes received

You can publish a test stream and use this method to check its quality in order to determine
what video resolution is supported and whether conditions support video or audio. You can then
publish an appropriate stream, based on the results. See the sample code in this repo for more
information.

You may also use these statistics to have a Subscriber subscribe to audio-only (if the audio packet
loss reaches a certain threshold). If you choose to do this, you should set the
`audioFallbackEnabled` setting to `false` when you initialize Publisher objects for the session.
This prevents the OpenTok Media Router from using its own audio-only toggling implementation. (See
the documentation for the `OT.initPublisher()` method.)

The method has one parameter -- `completionHandler` -- which is a function that takes the following
parameters:

* `error` -- Upon successful completion of the network test, this is undefined. Otherwise
  (on error), this property is set to an object with the following properties:

  * `code` -- The error code, which is set to 1015
  * `message` -- A description of the error

  The error results if the client is not connected or the stream published by your own client

* `stats` -- An object with the following properties:

  * `audio.bytesReceived` -- Total audio bytes received by the subscriber
  * `audio.packetsLost` -- Total audio packets that did not reach the subscriber
  * `audio.packetsReceived` -- Total audio packets received by the subscriber
  * `timestamp` -- The timestamp, in milliseconds since the Unix epoch, for when these stats
     were gathered
  * `video.bytesReceived` -- Total video bytes received by the subscriber
  * `video.packetsLost` -- Total video packets that did not reach the subscriber
  * `video.packetsReceived` -- Total video packets received by the subscriber
