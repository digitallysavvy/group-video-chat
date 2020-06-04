# Group Video Chat Web App
![](https://miro.medium.com/max/1400/1*XEu9XT-U1RKmuTtz8k3qMQ.png)
Hey everyone, today I want to walk through how to build a simple group video chat web app, very similar to Google Hangouts, Skype or whichever other video chat platform you prefer. 

Given today’s fragmented JS landscape, I wanted to write this tutorial using the most basic versions of HTML, CSS and JS. Before you say it, I know I know, JQuery isn’t vanilla JS but Vanilla JS can be a bit verbose for certain DOM tasks, I chose to use JQuery to simplify a few things. We are going to cut a few corners and use Bootstrap so we don’t have to worry about writing too much custom CSS.

>For the TLDR crowd: Check out the [demo of the code in action](https://digitallysavvy.github.io/group-video-chat/) on GitHub Pages 

## Pre Requisites ##
- A [simple web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) — I like to use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- An SSL cert or way to have an https connection (I use [ngrok](https://ngrok.com))
- A developer account with [Agora.io](https://console.agora.io)
- An understanding of HTML/CSS/JS
- An understanding of how Bootstrap and JQuery function *(minimal knowledge needed)*

## Core Structure (HTML) ##
Let’s start by laying out our basic html structure. There are a few UI elements we must have, such as the local video stream, the remote video streams, a toolbar that will contain buttons for toggling audio/video streams, a button to share our screen with the group, and lastly a way to leave the chat *(we’ll add the buttons a little later)*.

```HTML
<html lang="en">
  <head>
    <title>Agora Group Video Chat Demo</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <div id="container">
      <div id="main-container">
        <div id="screen-share-btn-container">
          <!-- insert button to share screen -->
        </div>
        <div id="buttons-container">
          <!-- insert buttons to toggle audio/video and leave/end call -->
        </div>
        <div id="full-screen-video"></div>
        <div id="lower-video-bar">
          <div id="remote-streams-container">
            <div id="remote-streams">
              <!-- insert remote streams dynamically -->
            </div>
          </div>
          <div id="local-stream-container">						
            <div id="local-video"></div>
          </div>
        </div>
      </div>
    </div>
  </body>
  <!-- CSS Includes go here -->
  <!-- JS Includes go here -->
</html>
```

## Adding in CSS and JS ##
Now that we have our base we can start expanding. Using Bootstrap for our CSS we can quickly style our html with a few simple classes. In the above code, let's add the CSS links *(shown below)* into the code where we see the comment block `<!-- CSS includes go here -->`.

```HTML
<!-- Bootstrap and Font Awesome CSS Libraries -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="style.css"/>
```

While Boostrap is great but it isn’t a holistic solution, so I threw in a few extras CSS blocks within a custom CSS file *(we’ll get to this a little later)*. This will help adjust a few elements that we won’t get perfect out of the box with Bootstrap. I also added the [Font Awesome CSS](https://origin.fontawesome.com) framework because we are going to need to incorporate icons for the various buttons and FA makes it really simple.

As I mentioned, Bootstrap is great, but sometimes you still need a little bit of custom CSS. Here are the styling blocks for the above referenced `style.css`.

```CSS
#buttons-container {
  position: absolute;
  z-index: 2;  
  width: 100vw;
}

#full-screen-video {
  position: absolute;
  width: 100vw;
  height: 100vh;
}

#lower-video-bar {
  height: 20vh;
}

#local-stream-container { 
  position: relative; 
  display: inline-block;
}

.remote-stream-container { 
  display: inline-block;
}

#remote-streams {
  height: 100%;
}

#local-video {
  position: absolute;
  z-index: 1;
  height: 20vh;
  max-width: 100%;
}

.remote-video {
  position: absolute;
  z-index: 1;
  height: 100% !important;
  width: 80%;
  max-width: 500px;
}

#mute-overlay {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  color: #d9d9d9;
  font-size: 2em;
  padding: 0 0 3px 3px;
  display: none;
} 

.mute-overlay {
  position: absolute;
  z-index: 2;
  top: 2px;
  color: #d9d9d9;
  font-size: 1.5em;
  padding: 2px 0 0 2px;
  display: none;
}

#no-local-video, .no-video-overlay {
  position: absolute;
  z-index: 3;
  width: 100%;
  top: 40%;
  color: #cccccc;
  font-size: 2.5em;
  margin: 0 auto;
  display: none;
}

.no-video-overlay {
  width: 80%;
}

#screen-share-btn-container {
  z-index: 99;
}
```

## Adding UI elements ##

Now let’s add some buttons to control toggling the mic, video or leaving the channel and finish off the last remaining bits of our UI. This is where font awesome and bootstrap really make things simple. We will use a `<button />` element and some FontAwesome icons.

The sections below fits in with the code above by replacing the comments
`<!-- insert button to share screen -->` and
`<!-- insert buttons to toggle audio/video and leave/end call -->`

```HTML
<div id="screen-share-btn-container" class="col-2 float-right text-right mt-2">
	<button id="screen-share-btn"  type="button" class="btn btn-lg">
		<i id="screen-share-icon" class="fas fa-share-square"></i>
	</button>
</div>
<div id="buttons-container" class="row justify-content-center mt-3">
	<div class="col-md-2 text-center">
		<button id="mic-btn" type="button" class="btn btn-block btn-dark btn-lg">
			<i id="mic-icon" class="fas fa-microphone"></i>
		</button>
	</div>
	<div class="col-md-2 text-center">
		<button id="video-btn"  type="button" class="btn btn-block btn-dark btn-lg">
			<i id="video-icon" class="fas fa-video"></i>
		</button>
	</div>
	<div class="col-md-2 text-center">
		<button id="exit-btn"  type="button" class="btn btn-block btn-danger btn-lg">
			<i id="exit-icon" class="fas fa-phone-slash"></i>
		</button>
	</div>
</div>
```

We need to add some JS to control the buttons. JQuery will really help us here by simplifying the code for the various DOM operations which will allow the UI to feel dynamic for the user.

```Javascript
// UI buttons
function enableUiControls(localStream) {

  $("#mic-btn").prop("disabled", false);
  $("#video-btn").prop("disabled", false);
  $("#screen-share-btn").prop("disabled", false);
  $("#exit-btn").prop("disabled", false);

  $("#mic-btn").click(function(){
    toggleMic(localStream);
  });

  $("#video-btn").click(function(){
    toggleVideo(localStream);
  });

  $("#screen-share-btn").click(function(){
    toggleScreenShareBtn(); // set screen share button icon
    $("#screen-share-btn").prop("disabled",true); // disable the button on click
    if(screenShareActive){
      stopScreenShare();
    } else {
      initScreenShare(); 
    }
  });

  $("#exit-btn").click(function(){
    console.log("so sad to see you leave the channel");
    leaveChannel(); 
  });

  // keyboard listeners 
  $(document).keypress(function(e) {
    switch (e.key) {
      case "m":
        console.log("squick toggle the mic");
        toggleMic(localStream);
        break;
      case "v":
        console.log("quick toggle the video");
        toggleVideo(localStream);
        break; 
      case "s":
        console.log("initializing screen share");
        toggleScreenShareBtn(); // set screen share button icon
        $("#screen-share-btn").prop("disabled",true); // disable the button on click
        if(screenShareActive){
          stopScreenShare();
        } else {
          initScreenShare(); 
        }
        break;  
      case "q":
        console.log("so sad to see you quit the channel");
        leaveChannel(); 
        break;   
      default:  // do nothing
    }

    // (for testing) 
    if(e.key === "r") { 
      window.history.back(); // quick reset
    }
  });
}

function toggleBtn(btn){
  btn.toggleClass('btn-dark').toggleClass('btn-danger');
}

function toggleScreenShareBtn() {
  $('#screen-share-btn').toggleClass('btn-danger');
  $('#screen-share-icon').toggleClass('fa-share-square').toggleClass('fa-times-circle');
}

function toggleVisibility(elementID, visible) {
  if (visible) {
    $(elementID).attr("style", "display:block");
  } else {
    $(elementID).attr("style", "display:none");
  }
}

function toggleMic(localStream) {
  toggleBtn($("#mic-btn")); // toggle button colors
  $("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash'); // toggle the mic icon
  if ($("#mic-icon").hasClass('fa-microphone')) {
    localStream.enableAudio(); // enable the local mic
    toggleVisibility("#mute-overlay", false); // hide the muted mic icon
  } else {
    localStream.disableAudio(); // mute the local mic
    toggleVisibility("#mute-overlay", true); // show the muted mic icon
  }
}

function toggleVideo(localStream) {
  toggleBtn($("#video-btn")); // toggle button colors
  $("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
  if ($("#video-icon").hasClass('fa-video')) {
    localStream.enableVideo(); // enable the local video
    toggleVisibility("#no-local-video", false); // hide the user icon when video is enabled
  } else {
    localStream.disableVideo(); // disable the local video
    toggleVisibility("#no-local-video", true); // show the user icon when video is disabled
  }
}
```
As you can see there is some added logic for keyboard controls. During testing I found having keyboard shortcuts made things move quicker. In the snippet above we have support for `m`, `v`, `s`, `q` to toggle mic, video, and screen-share and to leave the call *(respectively)*.

I saved the above code into a file `ui.js` to keep it separate from the core video chat logic that we will write. Also let’s make sure to include the `ui.js` file within our html file *(using the snippet below)*.

```HTML
<script src="ui.js"></script>
```

## Core Structure (JS) ##
Now that we the HTML/DOM structure laid out we can add in the JS. I chose to use Agora.io to simplify the heavy task of the WebRTC interface. I wrote a [short post on how to get setup with Agora.io](https://medium.com/@hermes_11327/how-to-get-started-with-agora-io-c73934bcab2b) for anyone new to the Agora.io platform. In the code below we start by declaring and initializing the Client object. Once we have the Client object we can join/leave the channel but also we will add listeners for the various engine events.

Below I included some of the initial object declarations for the screen sharing. I will expand upon that implementation later on, as we add in the rest of the logic.

```Javascript
// app / channel settings
var agoraAppId = ""; // Set your Agora App ID
var channelName = 'agora-web-docs-demo';

// video profile settings
var cameraVideoProfile = '480_4'; // 640 × 480 @ 30fps  & 750kbs
var screenVideoProfile = '480_2'; // 640 × 480 @ 30fps

// create client instances for camera (client) and screen share (screenClient)
var client = AgoraRTC.createClient({mode: 'rtc', codec: "h264"}); // h264 better detail at a higher motion
var screenClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'}); // use the vp8 for better detail in low motion

// stream references (keep track of active streams) 
var remoteStreams = {}; // remote streams obj struct [id : stream] 

var localStreams = {
  camera: {
    id: "",
    stream: {}
  },
  screen: {
    id: "",
    stream: {}
  }
};

var mainStreamId; // reference to main stream
var screenShareActive = false; // flag for screen share 

// init Agora SDK
client.init(agoraAppId, function () {
  console.log("AgoraRTC client initialized");
  joinChannel(); // join channel upon successfull init
}, function (err) {
  console.log("[ERROR] : AgoraRTC client init failed", err);
});

client.on('stream-published', function (evt) {
  console.log("Publish local stream successfully");
});

// connect remote streams
client.on('stream-added', function (evt) {
  console.log("new stream added: " + streamId);
  // Check if the stream is local
  if (streamId != localStreams.screen.id) {
    console.log('subscribe to remote stream:' + streamId);
    // Subscribe to the stream.
    client.subscribe(stream, function (err) {
      console.log("[ERROR] : subscribe stream failed", err);
    });
  }
});

client.on('stream-subscribed', function (evt) {
  console.log("Subscribe remote stream successfully: " + evt.stream.getId());
});

// remove the remote-container when a user leaves the channel
client.on("peer-leave", function(evt) {
  console.log("Remote stream: " + evt.stream.getId() + "has left");
});

// show mute icon whenever a remote has muted their mic
client.on("mute-audio", function (evt) {
  console.log("Remote stream: " +  evt.uid + "has muted audio");
});

client.on("unmute-audio", function (evt) {
  console.log("Remote stream: " +  evt.uid + "has muted audio");
});

// show user icon whenever a remote has disabled their video
client.on("mute-video", function (evt) {
  console.log("Remote stream: " +  evt.uid + "has muted video");
});

client.on("unmute-video", function (evt) {
  console.log("Remote stream: " +  evt.uid + "has un-muted video");
});

// join a channel
function joinChannel() {
  var token = generateToken();
  var userID = null; // set to null to auto generate uid on successfull connection
  client.join(token, channelName, userID, function(uid) {
      console.log("User " + uid + " join channel successfully");
      createCameraStream(uid);
      localStreams.camera.id = uid; // keep track of the stream uid 
  }, function(err) {
      console.log("[ERROR] : join channel failed", err);
  });
}

// video streams for channel
function createCameraStream(uid) {
  var localStream = AgoraRTC.createStream({
    streamID: uid,
    audio: true,
    video: true,
    screen: false
  });
  localStream.setVideoProfile(cameraVideoProfile);
  localStream.init(function() {
    console.log("getUserMedia successfully");
    // TODO: add check for other streams. play local stream full size if alone in channel
    localStream.play('local-video'); // play the given stream within the local-video div
    // publish local stream
    client.publish(localStream, function (err) {
      console.log("[ERROR] : publish local stream error: " + err);
    });
  
    enableUiControls(localStream); // move after testing
    localStreams.camera.stream = localStream; // keep track of the camera stream for later
  }, function (err) {
    console.log("[ERROR] : getUserMedia failed", err);
  });
}

function leaveChannel() {
  client.leave(function() {
    console.log("client leaves channel");
  }, function(err) {
    console.log("client leave failed ", err); //error handling
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}
```

One thing to note, all the Agora.io SDK event listeners should be at the top level, please don’t make the mistake of nesting them into the channel join callback. I made this mistake and it caused me to only have access to streams that joined the channel after me.

As you can see within the code above we have the `'stream-added'` callback, this is where we will add logic to handle setting the first remote stream to the full screen video and every subsequent stream into a new div container within the remote-streams div which will give us the group functionality beyond just 1 to 1 video. Below is the function we would call every time a new remote stream is added and we want to have it add itself dynamically to the DOM.

```Javascript
// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  var streamId = remoteStream.getId();
  // append the remote stream template to #remote-streams
  $('#remote-streams').append(
    $('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container col'}).append(
      $('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
          $('<i/>', {'class': 'fas fa-microphone-slash'})
      ),
      $('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
        $('<i/>', {'class': 'fas fa-user'})
      ),
      $('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
    )
  );
  remoteStream.play('agora_remote_' + streamId); 
}
```
One last note for this section, we have buttons that toggle the mic and video streams but we need to provide feedback to the remote users subscribed to the muted streams. Don’t worry Agora’s SDK provides some callbacks specially for these situations. Above you can see these cases are handled by the events such as `mute-audio` or `mute-video` *(as well as their inverses for enabling the respective streams)*.

## Enhancing the UI by handling remote stream actions ##
First let’s start by adding some extra divs with icons for a muted mic and a user icon when the video feed is disabled. I will use the local container as a reference as the remote stream containers will have similar structure.

```HTML
<div id="local-stream-container" class="col p-0">
  <div id="mute-overlay" class="col">
    <i id="mic-icon" class="fas fa-microphone-slash"></i>
  </div>
  <div id="no-local-video" class="col text-center">
    <i id="user-icon" class="fas fa-user"></i>
  </div>							
  <div id="local-video" class="col p-0"></div>
</div>
```

The new divs will hold some FontAwesome icons that we can hide/show whenever the event callbacks are executed for on the local and corresponding remote streams. Now that we have some names for our elements we can easily control them within our event listeners.

```Javascript
// show mute icon whenever a remote has muted their mic
client.on("mute-audio", function (evt) {
  toggleVisibility('#' + evt.uid + '_mute', true);
});

client.on("unmute-audio", function (evt) {
  toggleVisibility('#' + evt.uid + '_mute', false);
});

// show user icon whenever a remote has disabled their video
client.on("mute-video", function (evt) {
  var remoteId = evt.uid;
  // if the main user stops their video select a random user from the list
  if (remoteId != mainStreamId) {
    // if not the main vidiel then show the user icon
    toggleVisibility('#' + remoteId + '_no-video', true);
  }
});

client.on("unmute-video", function (evt) {
  toggleVisibility('#' + evt.uid + '_no-video', false);
});
```
## More frills ##
There’s a few effects that we can add to really enhance the user experience. First let’s consider what happens when the user wants a different stream to be the full screen. We’ll add a double click listener to each remote stream so when the user double clicks a remote stream it swaps the mini view with the full screen view.

```Javascript
var containerId = '#' + streamId + '_container';
$(containerId).dblclick(function() {
  // play selected container as full screen - swap out current full screen stream
  remoteStreams[mainStreamId].stop(); // stop the main video stream playback
  addRemoteStreamMiniView(remoteStreams[mainStreamId]); // send the main video stream to a container
  $(containerId).empty().remove(); // remove the stream's miniView container
  remoteStreams[streamId].stop() // stop the container's video stream playback
  remoteStreams[streamId].play('full-screen-video'); // play the remote stream as the full screen video
  mainStreamId = streamId; // set the container stream id as the new main stream id
});
```

Lastly let’s make sure that there is always a full screen stream as long as at least one stream is connected. We can use some similar methods as we did above.

```Javascript
// remove the remote-container when a user leaves the channel
client.on("peer-leave", function(evt) {
  var streamId = evt.stream.getId(); // the the stream id
  if(remoteStreams[streamId] != undefined) {
    remoteStreams[streamId].stop(); // stop playing the feed
    delete remoteStreams[streamId]; // remove stream from list
    if (streamId == mainStreamId) {
      var streamIds = Object.keys(remoteStreams);
      var randomId = streamIds[Math.floor(Math.random()*streamIds.length)]; // select from the remaining streams
      remoteStreams[randomId].stop(); // stop the stream's existing playback
      var remoteContainerID = '#' + randomId + '_container';
      $(remoteContainerID).empty().remove(); // remove the stream's miniView container
      remoteStreams[randomId].play('full-screen-video'); // play the random stream as the main stream
      mainStreamId = randomId; // set the new main remote stream
    } else {
      var remoteContainerID = '#' + streamId + '_container';
      $(remoteContainerID).empty().remove(); // 
    }
  }
});
```

I added some randomization so when the the full screen remote stream leaves the channel, one of the other remote streams is randomly selected and set to play in the full screen div.

## Putting it all together ##
Now that we have all these snippets lets put them together and fill in the rest of the logic for how the web app should react to each event.

```Javascript
// simple JS interface for Agora.io web SDK

// app / channel settings
var agoraAppId = " "; // Set your Agora App ID
var channelName = 'agora-web-docs-demo';

// video profile settings
var cameraVideoProfile = '480_4'; // 640 × 480 @ 30fps  & 750kbs
var screenVideoProfile = '480_2'; // 640 × 480 @ 30fps

// create client instances for camera (client) and screen share (screenClient)
var client = AgoraRTC.createClient({mode: 'rtc', codec: "h264"}); // h264 better detail at a higher motion
var screenClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'}); // use the vp8 for better detail in low motion

// stream references (keep track of active streams) 
var remoteStreams = {}; // remote streams obj struct [id : stream] 

var localStreams = {
  camera: {
    id: "",
    stream: {}
  },
  screen: {
    id: "",
    stream: {}
  }
};

var mainStreamId; // reference to main stream
var screenShareActive = false; // flag for screen share 

// init Agora SDK
client.init(agoraAppId, function () {
  console.log("AgoraRTC client initialized");
  joinChannel(); // join channel upon successfull init
}, function (err) {
  console.log("[ERROR] : AgoraRTC client init failed", err);
});

client.on('stream-published', function (evt) {
  console.log("Publish local stream successfully");
});

// connect remote streams
client.on('stream-added', function (evt) {
  var stream = evt.stream;
  var streamId = stream.getId();
  console.log("new stream added: " + streamId);
  // Check if the stream is local
  if (streamId != localStreams.screen.id) {
    console.log('subscribe to remote stream:' + streamId);
    // Subscribe to the stream.
    client.subscribe(stream, function (err) {
      console.log("[ERROR] : subscribe stream failed", err);
    });
  }
});

client.on('stream-subscribed', function (evt) {
  var remoteStream = evt.stream;
  var remoteId = remoteStream.getId();
  remoteStreams[remoteId] = remoteStream;
  console.log("Subscribe remote stream successfully: " + remoteId);
  if( $('#full-screen-video').is(':empty') ) { 
    mainStreamId = remoteId;
    remoteStream.play('full-screen-video');
  } else {
    addRemoteStreamMiniView(remoteStream);
  }
});

// remove the remote-container when a user leaves the channel
client.on("peer-leave", function(evt) {
  var streamId = evt.stream.getId(); // the the stream id
  if(remoteStreams[streamId] != undefined) {
    remoteStreams[streamId].stop(); // stop playing the feed
    delete remoteStreams[streamId]; // remove stream from list
    if (streamId == mainStreamId) {
      var streamIds = Object.keys(remoteStreams);
      var randomId = streamIds[Math.floor(Math.random()*streamIds.length)]; // select from the remaining streams
      remoteStreams[randomId].stop(); // stop the stream's existing playback
      var remoteContainerID = '#' + randomId + '_container';
      $(remoteContainerID).empty().remove(); // remove the stream's miniView container
      remoteStreams[randomId].play('full-screen-video'); // play the random stream as the main stream
      mainStreamId = randomId; // set the new main remote stream
    } else {
      var remoteContainerID = '#' + streamId + '_container';
      $(remoteContainerID).empty().remove(); // 
    }
  }
});

// show mute icon whenever a remote has muted their mic
client.on("mute-audio", function (evt) {
  toggleVisibility('#' + evt.uid + '_mute', true);
});

client.on("unmute-audio", function (evt) {
  toggleVisibility('#' + evt.uid + '_mute', false);
});

// show user icon whenever a remote has disabled their video
client.on("mute-video", function (evt) {
  var remoteId = evt.uid;
  // if the main user stops their video select a random user from the list
  if (remoteId != mainStreamId) {
    // if not the main vidiel then show the user icon
    toggleVisibility('#' + remoteId + '_no-video', true);
  }
});

client.on("unmute-video", function (evt) {
  toggleVisibility('#' + evt.uid + '_no-video', false);
});

// join a channel
function joinChannel() {
  var token = generateToken();
  var userID = null; // set to null to auto generate uid on successfull connection
  client.join(token, channelName, userID, function(uid) {
      console.log("User " + uid + " join channel successfully");
      createCameraStream(uid);
      localStreams.camera.id = uid; // keep track of the stream uid 
  }, function(err) {
      console.log("[ERROR] : join channel failed", err);
  });
}

// video streams for channel
function createCameraStream(uid) {
  var localStream = AgoraRTC.createStream({
    streamID: uid,
    audio: true,
    video: true,
    screen: false
  });
  localStream.setVideoProfile(cameraVideoProfile);
  localStream.init(function() {
    console.log("getUserMedia successfully");
    // TODO: add check for other streams. play local stream full size if alone in channel
    localStream.play('local-video'); // play the given stream within the local-video div

    // publish local stream
    client.publish(localStream, function (err) {
      console.log("[ERROR] : publish local stream error: " + err);
    });
  
    enableUiControls(localStream); // move after testing
    localStreams.camera.stream = localStream; // keep track of the camera stream for later
  }, function (err) {
    console.log("[ERROR] : getUserMedia failed", err);
  });
}

// SCREEN SHARING
function initScreenShare() {
  screenClient.init(agoraAppId, function () {
    console.log("AgoraRTC screenClient initialized");
    joinChannelAsScreenShare();
    screenShareActive = true;
    // TODO: add logic to swap button
  }, function (err) {
    console.log("[ERROR] : AgoraRTC screenClient init failed", err);
  });  
}

function joinChannelAsScreenShare() {
  var token = generateToken();
  var userID = null; // set to null to auto generate uid on successfull connection
  screenClient.join(token, channelName, userID, function(uid) { 
    localStreams.screen.id = uid;  // keep track of the uid of the screen stream.
    
    // Create the stream for screen sharing.
    var screenStream = AgoraRTC.createStream({
      streamID: uid,
      audio: false, // Set the audio attribute as false to avoid any echo during the call.
      video: false,
      screen: true, // screen stream
      extensionId: 'minllpmhdgpndnkomcoccfekfegnlikg', // Google Chrome:
      mediaSource:  'screen', // Firefox: 'screen', 'application', 'window' (select one)
    });
    screenStream.setScreenProfile(screenVideoProfile); // set the profile of the screen
    screenStream.init(function(){
      console.log("getScreen successful");
      localStreams.screen.stream = screenStream; // keep track of the screen stream
      $("#screen-share-btn").prop("disabled",false); // enable button
      screenClient.publish(screenStream, function (err) {
        console.log("[ERROR] : publish screen stream error: " + err);
      });
    }, function (err) {
      console.log("[ERROR] : getScreen failed", err);
      localStreams.screen.id = ""; // reset screen stream id
      localStreams.screen.stream = {}; // reset the screen stream
      screenShareActive = false; // resest screenShare
      toggleScreenShareBtn(); // toggle the button icon back (will appear disabled)
    });
  }, function(err) {
    console.log("[ERROR] : join channel as screen-share failed", err);
  });

  screenClient.on('stream-published', function (evt) {
    console.log("Publish screen stream successfully");
    localStreams.camera.stream.disableVideo(); // disable the local video stream (will send a mute signal)
    localStreams.camera.stream.stop(); // stop playing the local stream
    // TODO: add logic to swap main video feed back from container
    remoteStreams[mainStreamId].stop(); // stop the main video stream playback
    addRemoteStreamMiniView(remoteStreams[mainStreamId]); // send the main video stream to a container
    // localStreams.screen.stream.play('full-screen-video'); // play the screen share as full-screen-video (vortext effect?)
    $("#video-btn").prop("disabled",true); // disable the video button (as cameara video stream is disabled)
  });
  
  screenClient.on('stopScreenSharing', function (evt) {
    console.log("screen sharing stopped", err);
  });
}

function stopScreenShare() {
  localStreams.screen.stream.disableVideo(); // disable the local video stream (will send a mute signal)
  localStreams.screen.stream.stop(); // stop playing the local stream
  localStreams.camera.stream.enableVideo(); // enable the camera feed
  localStreams.camera.stream.play('local-video'); // play the camera within the full-screen-video div
  $("#video-btn").prop("disabled",false);
  screenClient.leave(function() {
    screenShareActive = false; 
    console.log("screen client leaves channel");
    $("#screen-share-btn").prop("disabled",false); // enable button
    screenClient.unpublish(localStreams.screen.stream); // unpublish the screen client
    localStreams.screen.stream.close(); // close the screen client stream
    localStreams.screen.id = ""; // reset the screen id
    localStreams.screen.stream = {}; // reset the stream obj
  }, function(err) {
    console.log("client leave failed ", err); //error handling
  }); 
}

// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  var streamId = remoteStream.getId();
  // append the remote stream template to #remote-streams
  $('#remote-streams').append(
    $('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container col'}).append(
      $('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
          $('<i/>', {'class': 'fas fa-microphone-slash'})
      ),
      $('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
        $('<i/>', {'class': 'fas fa-user'})
      ),
      $('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
    )
  );
  remoteStream.play('agora_remote_' + streamId); 

  var containerId = '#' + streamId + '_container';
  $(containerId).dblclick(function() {
    // play selected container as full screen - swap out current full screen stream
    remoteStreams[mainStreamId].stop(); // stop the main video stream playback
    addRemoteStreamMiniView(remoteStreams[mainStreamId]); // send the main video stream to a container
    $(containerId).empty().remove(); // remove the stream's miniView container
    remoteStreams[streamId].stop() // stop the container's video stream playback
    remoteStreams[streamId].play('full-screen-video'); // play the remote stream as the full screen video
    mainStreamId = streamId; // set the container stream id as the new main stream id
  });
}

function leaveChannel() {
  
  if(screenShareActive) {
    stopScreenShare();
  }

  client.leave(function() {
    console.log("client leaves channel");
    localStreams.camera.stream.stop() // stop the camera stream playback
    client.unpublish(localStreams.camera.stream); // unpublish the camera stream
    localStreams.camera.stream.close(); // clean up and close the camera stream
    $("#remote-streams").empty() // clean up the remote feeds
    //disable the UI elements
    $("#mic-btn").prop("disabled", true);
    $("#video-btn").prop("disabled", true);
    $("#screen-share-btn").prop("disabled", true);
    $("#exit-btn").prop("disabled", true);
    // hide the mute/no-video overlays
    toggleVisibility("#mute-overlay", false); 
    toggleVisibility("#no-local-video", false); 
  }, function(err) {
    console.log("client leave failed ", err); //error handling
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}
```
>Please note: video sharing is not supported by Safari. Thankfully Chrome and FireFox don't have such restrictions. 

Let’s drop our JS includes into our html page to make the final connections. The below snippet fits into the main html (above) by replacing the comment <!-- JS Includes go here --> with the snippet below.

```Javascript
<script src="AgoraRTCSDK-3.1.1.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
<script>
    $("#mic-btn").prop("disabled", true);
    $("#video-btn").prop("disabled", true);
    $("#screen-share-btn").prop("disabled", true);
    $("#exit-btn").prop("disabled", true);
</script>
<script src="agora-interface.js"></script>
```

## Testing Setup (webserver/https) ##
Since the camera permissions requires a secure (https) connection, before we can test our video chat app we must spin up a [simple web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) with a https connection.  Browsers have Whitelisted the `localhost` url so you can use that to test. 

To keep things simple I like to use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) but you can use any method.

If you want to test this out with friends you can run it locally in conjunction with [ngrok](https://ngrok.com), a service that creates a tunnel out from your local machine and provides an https url for use. In my experience this is one of the simplest ways to run a publicly accessible `https` secured webserver on your local machine. 

Once the server is ready we can run our test.

>NOTE: use two (or more) browser tabs to simulate a local host and a single/multiple remote host(s).

## Fin. ##
And just like that we are done!

If you would like to see the demo in action, check out the [demo of the code in action](https://digitallysavvy.github.io/group-video-chat/) on GitHub Pages 

>Please note: that due to high demand, I have updated the build so you will need to register for a free Agora.io account to get AppId to test the demo. If you need help, I have a quick 3 step guide

Thanks for taking the time to read my tutorial and if you have any questions please let me know with a comment. If you see any room for improvement feel free to fork the repo and make a pull request!
