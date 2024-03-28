// Import the Agora SDK
import AgoraRTC from 'agora-rtc-sdk-ng'


const appid = import.meta.env.VITE_AGORA_APP_ID
const cameraVideoPreset = '360p_7'          // 480 x 360p - 15fps @ 320 Kps
const audioConfigPreset = 'music_standard'  // 48kHz mono @ 40 Kbps
const screenShareVideoPreset = '1080_3'     // 1920 x 1080 - 30fps @ 3150 Kps

const joinform = getById('join-channel-form')

// helper function to quickly get dom elements
function getById(divID) {
  return document.getElementById(divID)
}

// Create the Agora Client
const client = AgoraRTC.createClient({ 
  codec: 'vp9',
  mode: 'live',
  role: 'host'
})

const localTracks = {
  camera: {
    audio: null,
    video: null
  },
  screen: {
    audio: null,
    video: null   
  }
}

const localTrackState = {
  audio: false,
  video: false,
  screen: false
}

const localDevives = {
  mics: [],
  cameras: [],
  output: []
}

// let screenshareClient               // Create Screen Share client as needed
let screenShareIsActive = false     // Screen Share flag
let remoteUsers = {}                // Container for the remote streams
let mainStreamUid = null            // Reference for video in the full screen view

const Loglevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  NONE: 4
}

AgoraRTC.enableLogUpload()                       // Auto upload logs to Agora
AgoraRTC.setLogLevel(Loglevel.DEBUG)             // Set Loglevel

// TODO: Add support for audience and url-params

async function initDevices() {
  if (!localTracks.camera.audio || !localTracks.camera.video) {
    [ localTracks.camera.audio, localTracks.camera.video ] = await AgoraRTC.createMicrophoneAndCameraTracks({ audioConfig: audioConfigPreset, videoConfig: cameraVideoPreset })
  }
  localDevives.mics = await AgoraRTC.getMicrophones()         // Get the Mic Devices
  localDevives.cameras = await AgoraRTC.getCameras()          // Get the Camera Devices
  localDevives.output = await AgoraRTC.getPlaybackDevices()   // Get the Output Devices (speakers, headphones)
  
  // TODO: append local devices to drop downs for user to switch devices

  localTracks.camera.video.play('local-video')    // Play the local video track in the local-video div
}

// User Form Submit Event
joinform.addEventListener('submit', async function(e){
  e.preventDefault() // stop the page from reloading
  
  // Get the channel name from the form input and remove any extra spaces
  const channelName = getById('form-channel-name').value.trim()
  // Check if the channel name is empty  
  if (!channelName || channelName === '') {
    // TODO: Add error message
    return
  }
  showOverlayForm(false)                                    // Hide overlay form
  await initDevices()                                       // Initialize the devices and create Tracks
  getById('local-media-controls').style.display = 'block'   // show media controls (mic, video. screen-share, etc)

  // Join the channel and publish out streams
  const token = null                                // Token security is not enabled
  const uid = null                                  // Pass null to have Agora set UID dynamically
  await client.join(appid, channelName, token, uid)
  await client.publish([localTracks.camera.audio, localTracks.camera.video])
  // track audio state locally
  localTrackState.audio = true
  localTrackState.video = true
})

// Add client Event Listeners -- on page load
const addAgoraEventListeners = () => {
  // Add listeners for Agora Client Events
  client.on('user-joined', handleRemotUserJoined)
  client.on('user-left', handleRemotUserLeft)
  client.on('user-published', handleRemotUserPublished)
  client.on('user-unpublished', handleRemotUserUnpublished)
}

// New remote users joins the channel
const handleRemotUserJoined = async (user) => {
  const uid = user.uid
  remoteUsers[uid] = user         // add the user to the remote users
  await createRemoteUserDiv(uid)  // create remote user div
}

// Remote user leaves the channel
const handleRemotUserLeft = async (user, reason) => {
  const uid = user.uid
  delete remoteUsers[uid]
  // Remove user from remote users container
  await removeRemoteUserDiv(uid)
  console.log(`User ${uid} left the channel with reason:${reason}`)
}

// Remote user publishes a track (audio or video)
const handleRemotUserPublished = async (user, mediaType) => {
  const uid = user.uid
  await client.subscribe(user, mediaType)
  remoteUsers[uid] = user                             // update remote user reference
  if (mediaType === 'video') { 
    // Check if the full screen view is empty
    if (mainIsEmpty()) {
      mainStreamUid = uid
      user.videoTrack.play('full-screen-video')     // play video on main user div
      await removeRemoteUserDiv(uid)                // remove the remote div 
    } else {
       // play video on remote user div
       user.videoTrack.play(`remote-user-${uid}-video`) 
    }           
  } else if (mediaType === 'audio') {
    user.audioTrack.play()
  }
}

// Remote user unpublishes a track (audio or video)
const handleRemotUserUnpublished = async (user, mediaType) => {
  const uid = user.uid
  console.log(`User ${uid} unpublished their ${mediaType}`)
  if (mediaType === 'video') {
    // Check if its the full screen user
    if (uid === mainStreamUid) {
      if(Object.keys(remoteUsers).length > 0) {
        // If there is more than one users
        if(Object.keys(remoteUsers).length > 1) {
          // Find a user and switch them to the full-screen
          let randomUid = getRandomRemoteUserUid()
          while (randomUid == mainStreamUid) {
            randomUid = getRandomRemoteUserUid()
          }
          await setNewMainVideo(randomUid)
        } else {
          await setNewMainVideo(remoteUsers[0])           // If only one other person make them the main
        }
      } else{
        getById('full-screen-video').replaceChildren()    // Remove all children of the main div
      }
    } else {
      const remoteUserPlayer = getById(`remote-user-${uid}-video`)
      if (remoteUserPlayer){
        remoteUserPlayer.replaceChildren()                // Remove all children of the div
      } 
    }
    // TODO: show no video icon
  } else if (mediaType === 'audio') {
    // TODO: show no mic icon
  }
}

// Add button listeners
const addLocalMediaControlListeners = () => {
  const micToggleBtn = getById('mic-toggle')
  const videoToggleBtn = getById('video-toggle')
  const screenShareBtn = getById('screen-share')
  const leaveChannelBtn = getById('leave-channel')

  micToggleBtn.addEventListener('click', handleMicToggle)
  videoToggleBtn.addEventListener('click', handleVideoToggle)
  screenShareBtn.addEventListener('click', handleScreenShare)
  leaveChannelBtn.addEventListener('click', handleLeaveChannel)
}

const handleMicToggle = async (event) => {
  const isTrackActive = localTrackState.audio                               // Get current audio state
  await muteTrack(localTracks.camera.audio, isTrackActive, event.target)    // Mute/Unmute
  localTrackState.audio = !isTrackActive                                    // Invert the audio state
}

const handleVideoToggle = async (event) => {
  const isTrackActive = localTrackState.video                               // Get current video state
  await muteTrack(localTracks.camera.video, isTrackActive, event.target)    // Mute/Unmute
  localTrackState.video = !isTrackActive                                    // Invert the video state
}

// Single function to mute audio/video tracks, using their common API
const muteTrack = async (track, mute, btn) => {
  if (!track) return                      // Make sure the track exists
  await track.setMuted(mute)              // Mute the Track (Audio or Video)
  btn.classList.toggle('media-active')    // Add/Remove active class
  btn.classList.toggle('muted')           // Add/Remove muted class
}

const handleScreenShare = () => {
  if (screenShareIsActive) {
    stopScreenShare()
  } else {
    startScreenShare()
  }
}

const startScreenShare = async () => {
  // create the screen video and audio (if available)
  const screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: screenShareVideoPreset }, "auto")
  // check if there's an audio track available or just video
  if (screenTrack instanceof Array) {
    localTracks.screen.video = screenTrack[0];
    localTracks.screen.audio = screenTrack[1];
  } else {
    localTracks.screen.video = screenTrack;
  }

  // move the main user from the full-screen div
  await createRemoteUserDiv(mainStreamUid)
  remoteUsers[mainStreamUid].videoTrack.play(`remote-user-${mainStreamUid}-video`)

  // publish the tracks
  let tracks = [localTracks.screen.video]
  if (localTracks.screen.audio) {
    tracks = [localTracks.screen.video, localTracks.screen.audio]
  }
  
  // unpublish the camera track and mute it
  await client.unpublish(localTracks.camera.video)
  const videoToggleBtn = getById('video-toggle')
  videoToggleBtn.disabled = true
  await muteTrack(localTracks.camera.video, true, videoToggleBtn)
  localTrackState.video = false
  
  // publish the new screen tracks
  await client.publish(tracks);
  
  // set screen-share flag and play on full-screen
  screenShareIsActive = true
  localTracks.screen.video.play('full-screen-video');

  // Listen for screen share ended event (from browser ui button)
  localTracks.screen.video.on("track-ended", () => {
    stopScreenShare()
  })
}

const stopScreenShare = async () => {
  let tracks = [localTracks.screen.video]
  if (localTracks.screen.audio) {
    tracks = [localTracks.screen.video, localTracks.screen.audio]
  }
  await client.unpublish(tracks)
  // close the tracks
  localTracks.screen.video && localTracks.screen.video.close();
  localTracks.screen.audio && localTracks.screen.audio.close();
  // publish the local video
  const videoToggleBtn = getById('video-toggle')
  await muteTrack(localTracks.camera.video, false, videoToggleBtn)
  localTrackState.video = true
  await client.publish(localTracks.camera.video);
  videoToggleBtn.disabled = false
  screenShareIsActive = false
  // ui clean-up
  getById('full-screen-video').replaceChildren()    // Remove all children of the main div
  setNewMainVideo(mainStreamUid)
}

const handleLeaveChannel = async () => {
  // loop through and stop the local tracks
  for (let trackName in localTracks.camera) {
    const track = localTracks.camera[trackName]
    if (track) {
      track.stop()
      track.close()
      localTracks.camera[trackName] = undefined
    }
  }
  await client.leave()                                    // Leave the channel
  console.log("client left channel successfully")  
  remoteUsers = {}                                        // Reset remote users 
  // Reset the UI
  const mediaButtons = [getById('mic-toggle'), getById('video-toggle')]
  mediaButtons.forEach(btn => {
    btn.classList.add('media-active')     // Add media-active class
    btn.classList.remove('muted')         // Remove mute class
  });
  getById('remote-video-container').replaceChildren()     // Clear the remote user divs
  getById('full-screen-video').replaceChildren()          // Clear the main div
  getById('local-media-controls').style.display = 'none'  // show media controls (mic, video. screen-share, etc)
  showOverlayForm(true)                                   // Show the Join Form overlay
}

// create the remote user container and video player div
const createRemoteUserDiv = async (uid) => {
  console.log(`add remote user div for uid: ${uid}`)
  const containerDiv = document.createElement('div')
  containerDiv.id = `remote-user-${uid}-container`
  const remoteUserDiv = document.createElement('div')
  remoteUserDiv.id = `remote-user-${uid}-video`
  remoteUserDiv.classList.add('remote-video')
  containerDiv.appendChild(remoteUserDiv)
  // Add remote user to remote video container
  getById('remote-video-container').appendChild(containerDiv)

  // Double click to swap container with main div
  containerDiv.addEventListener('dblclick', async (e) => {
    await swapMainVideo(uid)
  })
}

// Remove the div when users leave the channel
const removeRemoteUserDiv = async (uid) => {
  const containerDiv = getById(`remote-user-${uid}-container`)
  if (containerDiv) {
    containerDiv.parentNode.removeChild(containerDiv)
  }
}

// check if the main-screen is empty
const mainIsEmpty = () => {
  return getById('full-screen-video').childNodes.length === 0
}

const setNewMainVideo = async (newMainUid) => {
  getById('full-screen-video').replaceChildren()  // clear the main div
  if (!newMainUid) return                         // Exit early if newMainUid is undefined
  await removeRemoteUserDiv(newMainUid)
  console.log(`newMainUid: ${newMainUid}`)
  remoteUsers[newMainUid].videoTrack.play('full-screen-video')
  mainStreamUid = newMainUid
}

const swapMainVideo = async (newMainUid) => {
  if(remoteUsers[mainStreamUid]) {
    await createRemoteUserDiv(mainStreamUid)
    remoteUsers[mainStreamUid].videoTrack.play(`remote-user-${mainStreamUid}-video`)
  }
  await setNewMainVideo(newMainUid)
}

const getRandomRemoteUserUid = () => {
  const allUids = Object.keys(remoteUsers)
  if (allUids.length === 0) return undefined   // handle error-case
  // return a random uid
  const randomUid = allUids[Math.floor(Math.random() * allUids.length)]
  console.log(`randomUid: ${randomUid}`)
  return randomUid
}

// Toggle the visibility of the Join channel form
const showOverlayForm = (show) => {
  console.log('toggle-overlay')
  const modal = getById('overlay')
  if (show) {
    modal.style.display = 'block'
    requestAnimationFrame(() => {
      modal.classList.add('show')
    })
  } else {
    modal.classList.remove('show')
  }
}

// Listen for page loaded event
document.addEventListener('DOMContentLoaded', () => {
  console.log('page-loaded')
  showOverlayForm(true)
  addAgoraEventListeners()
  addLocalMediaControlListeners()
})

