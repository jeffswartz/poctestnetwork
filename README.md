OpenTok Pre-Call Test
=============================
This repository contains a sample code, which helps developer to diagnose if the end user's call will be succesful or not  given their network conditions. Pre-call test can be implemented as a step end user has to run before joining the session. Based on the test results, the developer can decide if the end user should be allowed to join the session, joined in audio-only mode or not.

This is an experimental/beta feature, feel free to use it on your own risk. It can be a subject to change in future releases. Please provide any feedback at denis [at] tokbox.com.

Pre-call test is supported in:

*  [OpenTok Android SDK 2.6](https://tokbox.com/developer/sdks/android/)
*  [OpenTok iOS SDK 2.6](https://tokbox.com/developer/sdks/ios/)
*  [OpenTok.js 2.6](https://tokbox.com/developer/sdks/js/)


## How does it work

* Create a publisher from the provided Session ID and token

* Eastablish a test call using the created publisher and subscribe to yourself fir the specified amount of time

* During the call, the underline WebRTC engine will stabilize the video quality based on the available network connection quality

* Collect the basic network statistics from WebRTC engine using the Network Stats API (see below): bandwidth, packet loss, etc

* Compare the network stats against your thresholds (see below) and decide what is the outcome of the test

Please see the sample code for details.

## Network Stats API

It is an undocumented and experimental API, which you dynamically monitor the following statistics for a subscriber:

* Audio and video bytes received 

* Audio and video packets lost

* Audio and video packets received

This API is only available in sessions that use the OpenTok Media Router.


## Thresholds and interpretting network statisics

You can use the network statisics to determine the ability to send and receive streams, 
and as a result have a quality experience during the OpenTok call. 

Please keep in mind, everybody's use case is different, and everybody's 
perception of the call quality is different. Therefore you should adjust 
the default thresholds and timeframe in accordance to your use case and expectations. 
For example, the 720p @  30 fps call requires much a much better network 
connection than 320x480 @ 15 fps, so you need to set a much higher 
threshold values in order to qualify a vialble end user connection. 
Also the longer you run the test, the more accurate values you will receive.
At the same time, you might want to switch audio-only or not based on 
your specific use case. 

The Pre-Call Test is implementated as a sample code to make it easier 
for developer to customize their application logic.

Below we provide an example of the thresholds for popular combinations 
of resolutions and frame rates. The following tables interpret results 
(for audio-video sessions and audio-only sessions), with the following quality designations:

* Excellent —- None or imperceptible impairments in media

* Acceptable —- Some impairments in media, leading to some momentaneous disruptions

The video resolutions listed are representative of common resolutions. You can determine support for
other resolutions by interpolating the results of the closest resolutions listed.

### Audio-video streams

For the given qualities and resolutions, all the following conditions must met.

| Quality    | Video resolution @ fps | Bandwidth (kbps) | Packet loss |
| -----------|----------------------- | ---------------- | ----------- |
| Excellent  | 1280x720 @ 30          | > 1000           | < 0.5%      |
| Excellent  | 640x480 @ 30           | > 600            | < 0.5%      |
| Excellent  | 320x240 @ 30           | > 300            | < 0.5%      |
| Acceptable | 1280x720 @ 30          | > 350            | < 0.3%      |
| Acceptable | 640x480 @ 30           | > 250            | < 0.3%      |
| Acceptable | 320x240 @ 30           | > 150            | < 0.3%      |

Note that you can calculate the video bandwidth and packet loss based on the video bytes received
and video packets received statistics provided by the API. See the sample app for code.

### Audio-only streams

For the given qualities, the following conditions must met.

| Quality    | Bandwidth (kbps) | Packet loss |
| ---------- | ---------------- | ----------- |
| Excellent  | > 60             | < 0.5%      |
| Acceptable | > 50             | < 5%        |

Note that you can calculate the audio bandwidth and packet loss based on the audio bytes received
and audio packets received statistics provided by the API. See the sample app for code.


## Sample code

This repo includes sample code showing how to build a pre-call test using each of the OpenTok
Client SDKs 2.6: Android, iOS and JavaScript. Each sample shows how to determine the 
the appropriate audio and video settings to use in publishing a stream to an OpenTok session. To do
this, each sample app publishes a test stream to the session and then uses the Network Stats API to check the
quality of that stream. Based on the quality, the app determines what the client can successfully
publish to the session:

* The client can publish an audio-video stream at the specified resolution.

* The client can publish an audio-only stream.

* The client is unable to publish.

Each sample subdirectory includes a README.md file that describes how the app uses the stream
statistics API.


## Frequently Asked Questions (FAQ)

* Why does the OpenTok Network Stats API values are different from my Speedtest.net results?
Speedtest.net tests your network connection, while the Network Stats API shows how 
the WebRTC engine (and OpenTok) will perform on your connection. 

* Why are the Network Stats API results quite inconsistent?
The WebRTC requires some time to stablize the quality of the call for the specific 
connection. If you will allow the pre-call test to run longer, you should receive 
more consistent results.
Also, please, make sure that you're using routed session instead of relayed. 
More info here: https://tokbox.com/developer/concepts/relayed-vs-routed/

* Why the output values are really low when my user is streaming Netflix movies?
The WebRTC is conservative in choosing the allowed bandwidth. For example, 
if there is another high-bandwidth consumer on the network, the WebRTC will 
try to set its own usage to the minimum.

* The pre-call test shows the "Excellent" (or "Acceptable") result, 
but the video still gets pixalated during the call.
You can increase the required threshholds to better qualify the end user connection.
Please keep in mind, the network connection can change overtime, especially on mobile devices.

* There is no documentation of the Network Stats API on TokBox website.
Yes, it is an experimental/beta API, which can be changed in future.

* Why do I get compilation errors on iOS or/and Android.
It's a experimental and undocumented API. Please refer to our sample code on how to include it in your project. You should be using OpenTok iOS SDK 2.6 or OpenTok Android SDK 2.6.
