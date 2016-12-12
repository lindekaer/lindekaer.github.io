Web Real-Time Communication (WebRTC) is an emerging API on the web platform that greatly empowers developers to create rich media and data sharing applications running over peer-to-peer (P2P) connections. I am currently writing my Master's thesis on WebRTC at the IT University of Copenhagen and as an exercise to gather my thoughts here is an introduction to the concepts of WebRTC.

## What is it?
 WebRTC is a collection of standards and protocols that enable two clients to establish a P2P connection. The connection can be used to stream video and audio or send arbitrary data without relying on plugins or other third-party software. The functionality is available through a high-level browser API that makes it really easy to get started.

## The API
<p class="article__notice">The WebRTC API is under development and the described interfaces may change over time. Check the [Mozilla docs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) for the newest version.</p>

WebRTC is available both in the browser ([browser support table](http://iswebrtcreadyyet.com/)) and in Node through the `wrtc` package. To avoid issues with browser prefixes for the different interfaces, you can use `adapter.js` which can be found [here](https://github.com/webrtc/adapter).

In order to get started with WebRTC, you have to know the following three interfaces:

- `RTCPeerConnection`, the linking of two peers
- `RTCDataChannel`, the channel to transfer arbitrary binary data
- `MediaStream`, the channel to transfer video and audio

Everytime you to set up a P2P connection you need both sides to instantiate a `RTCPeerConnection`. Once instantiated you are able to create `DataChannel` and `MediaStream` directly from the `RTCPeerConnection` instance.

## Core concepts
To dive deep into WebRTC you have to familiarize yourself with a quite a few concepts and technologies. However, to get started you just need a basic understanding of:

- Session Description Protocol (SDP)
- Interactive Connectivity Establishment (ICE)
- Signaling

**SDP**: Whenever two peers want to establish a connection, they need to agree on a contract (or *rules*) for the connection. SDP is a way to describe the details of such a contract. In the context of WebRTC one peer sends an **SDP offer** to the other peer, who consumes the offer and generates a corresponding **SDP answer**. In essence, SDP is just a document format that describes connection parameters. 

**ICE**: Two peers who would like to establish a connection will have to exhange addresses and ports, so they are able to reach each other. Usually a peer is located behind a NAT, firewall or other barriers, which means that it doesn't expose a direct public IP address. The process of ICE makes it possible to *traverse the NAT*. The protocols used for this are [STUN](https://en.wikipedia.org/wiki/STUN) and [TURN](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)

**Signaling**: The above mentioned process of finding each other is accomplished through signaling. A signaling server is an intermediary between two peers and facilitates the initial connection by exchanging offer/answer. Once the connection is etablished, the peers communicate purely on a direct P2P connection with no need for a server. A common approach to signaling is a simple Websocket server.

To really dig into the details I can recommend the documents from IETF:

- [SDP RFC](https://tools.ietf.org/search/rfc3264) by IEFF
- [ICE RFC](https://tools.ietf.org/search/rfc5245) by IETF

## Data channel example
In order for two peers (**Peer1** and **Peer2**) to setup a data channel the following sequence of actions will have to take place:

1. Peer1 instantiates a `RTCPeerConnection`
2. Peer1 creates a `DataChannel`
3. Peer1 creates a SDP offer
4. Peer1 gathers ICE candidates
5. Peer1 sends offer to Peer2
6. Peer2 instantiates a `RTCPeerConnection`
7. Peer2 generates a SDP answer based on Peer1's offer
8. Peer2 gathers ICE candidates
9. Peer2 sends answer to Peer1

Let's dive into the code - is will not be as much as it looks from the list above ⚡️

Firstly, the initial setup for **Peer1**:

```javascript
import { RTCPeerConnection } from 'wrtc'

// Setup of P2P connection and data channel
const pc1 = new RTCPeerConnection()
const dc = pc1.createDataChannel()

// Add event handlers on data channel
dc.onopen = () => console.log('Peer 1: Data channel has opened')
dc.onmessage = (event) => console.log(`Peer 1: Got message: "${event.data}"`)
``` 

Now we need to create an offer that we can send to **Peer2**. Once the offer is created, we set the offer as the local description of the peer connection.

```javascript
// A set of options for a data offer (no audio or video)
const options = {
  offerToReceiveAudio: false,
  offerToReceiveVideo: false
}

// Create an offer with the specified options
pc1.createOffer((offer) => {
  // Set the offer as the local description
  pc1.setLocalDescription(offer, () => {
    console.log('Peer 1: Setting local description')
  }, errorHandler)
}, errorHandler, options)
```

Even though the offer is created, we still need to gather all the possible ICE candidates befores sending the offer off to **Peer2**. When you call `setLocalDescription` the process of finding potential ICE candidates begins. For each candidate, the `onicecandidate` event fires on the `PeerConnection`. 

```javascript
// Event handler for candidates
pc1.onicecandidate = (event) => {
  console.log('Peer 1: Found an ICE candidate')
  // This fires when no more candidates are to be found
  if (event.candidate === null) {
    // Send offer to Peer2
    sendOffer(pc1.localDescription)
  }
}
```

A few things to note here. Once all the candidates have been gathered, we can access the final offer through `pc1.localDescription`. The function `sendOffer` can be any function that sends the offer to **Peer2**. This is trivial in our case, since both **Peer1** and **Peer2** are in the same `.js` file.

```javascript
// Setup of P2P connection
const pc2 = new RTCPeerConnection()

function sendOffer (offer) {
  // Set the offer from Peer1 as remote description
  console.log('Peer 2: Setting remote description')
  pc2.setRemoteDescription(offer)
  // Create an answer
  pc2.createAnswer((answer) => {
    // Set the answer as the local description
    pc2.setLocalDescription(answer, () => {
      console.log('Peer 2: Setting local description')
    }, errorHandler)
  }, errorHandler)
}
```

As we just saw with **Peer1**, we need to gather the potential ICE candidates before we can send back the answer.

```javascript
pc2.onicecandidate = (event) => {
  console.log('Peer 2: Found an ICE candidate')
  // This fires when no more candidates are to be found
  if (event.candidate === null) {
    // Send offer to Peer1
    sendAnswer(pc2.localDescription)
  }
}
```

And now the very last step required to set up the P2P connection:

```javascript
function sendAnswer (answer) {
  // Peer1 sets the answer as the remote description
  console.log('Peer 1: Setting remote description')
  pc1.setRemoteDescription(answer)
  // ... and the connection is established!
}
```

We can test out the connection by sending a message from **Peer2** to **Peer1**. We just need to attach and event handler that listens for the opening of the data channel.

```javascript
pc2.ondatachannel = (event) => {
  console.log('Peer 2: Sending message')
  event.channel.send('Cookies 4 life')
}
```

Run the code and check the console output: 

```bash
Peer 1: Setting local description
Peer 1: Found an ICE candidate
Peer 1: Found an ICE candidate
Peer 1: Found an ICE candidate
Peer 1: Found an ICE candidate
# Offer sent to Peer2
Peer 2: Setting remote description
Peer 2: Setting local description
Peer 2: Found an ICE candidate
Peer 2: Found an ICE candidate
Peer 2: Found an ICE candidate
# Answer sent to Peer1
Peer 1: Setting remote description
Peer 1: Data channel has opened
Peer 2: Sending message
Peer 1: Got message: "Cookies 4 life"
```

As soon as both sides of the connection have set both the local and remote description, we have a P2P connection between the two peers. Through the `DataChannel` they are able to send data (even files!) to each other.
You are not restricted to having only one data channel between a set of peers - theoretically you can have [65,534](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel).

## What's next?
I hope this simple walkthrough has sparked an interest in you. I can highly recommend the following resources to dive deeper and learn more 📚

- [WebRTC](https://hpbn.co/webrtc/) by Ilya Grigorik
- [Getting started with WebRTC](https://www.html5rocks.com/en/tutorials/webrtc/basics/) by Sam Dutton
- [WebRTC in the real world: STUN, TURN and signaling](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/) by Sam Dutton

... and of course, lots of cool code:

- [awesome-webrtc repository](https://github.com/openrtc-io/awesome-webrtc) on Github
