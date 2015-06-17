OpenTok stream statistics API
=============================
Sample code for the OpenTok stream statistics API.

## Sample code

See the sample subdirectories to see sample code for using this API. Each sample
subdirectory includes a README.md file that describes how the app uses the stream
statistics API.

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
