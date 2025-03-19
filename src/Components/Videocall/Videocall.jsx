// import AgoraRTC from "agora-rtc-sdk-ng";
// import { useEffect, useState } from "react";
// import { Button, Container, Row, Col, Card } from "react-bootstrap";
// import QuestionDisplay from "../QuestionDisplay/QuestionDisplay";

// const Videocall = () => {
//     const [client, setClient] = useState(null);
//     const [localVideoTrack, setLocalVideoTrack] = useState(null);
//     const [joinState, setJoinState] = useState(false);
//     const [mediaRecorder, setMediaRecorder] = useState(null);
//     const [recordedChunks, setRecordedChunks] = useState([]);

//     const appId = "967f29ebd0af4614a422d9cab0ef039c";
//     const channel = "meet_demo";
//     const token = null;
//     const uid = 0;

//     useEffect(() => {
//         const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
//         setClient(agoraClient);

//         agoraClient.on("user-published", async (user, mediaType) => {
//             await agoraClient.subscribe(user, mediaType);
//             console.log("Subscribe success");
//             if (mediaType === "video") {
//                 const remoteVideoTrack = user.videoTrack;
//                 const remoteContainer = document.createElement("div");
//                 remoteContainer.id = `player-${user.uid}`;
//                 remoteContainer.className = "w-64 h-48 bg-black mt-2";
//                 document.getElementById("remote-container").appendChild(remoteContainer);
//                 remoteVideoTrack.play(remoteContainer.id);
//             }
//         });

//         agoraClient.on("user-unpublished", (user) => {
//             console.log("User unpublished:", user);
//             const remoteContainer = document.getElementById(`player-${user.uid}`);
//             if (remoteContainer) {
//                 remoteContainer.remove();
//             }
//         });

//         return () => {
//             leaveChannel();
//         };
//     }, []);

//     const createLocalVideoTrack = async () => {
//         try {
//             const videoTrack = await AgoraRTC.createCameraVideoTrack();
//             setLocalVideoTrack(videoTrack);
//             return videoTrack;
//         } catch (error) {
//             console.error("Error creating video track:", error);
//             throw error;
//         }
//     };

//     const startRecording = async (stream) => {
//         try {
//             const recorder = new MediaRecorder(stream);
//             let chunks = [];

//             recorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     chunks.push(event.data);
//                 }
//             };

//             recorder.onstop = () => {
//                 setRecordedChunks(chunks);
//                 uploadRecording(chunks);
//             };

//             recorder.start();
//             setMediaRecorder(recorder);
//         } catch (error) {
//             console.error("Error starting recording:", error);
//         }
//     };

//     const joinChannel = async () => {
//         try {
//             await client.join(appId, channel, token, uid);

//             const [audioTrack, videoTrack] = await Promise.all([
//                 AgoraRTC.createMicrophoneAudioTrack(),
//                 AgoraRTC.createCameraVideoTrack(),
//             ]);

//             await client.publish([audioTrack, videoTrack]);

//             setLocalVideoTrack(videoTrack);
//             setJoinState(true);

//             const screenContainer = document.querySelector(".screen");
//             screenContainer.innerHTML = "";
//             videoTrack.play(screenContainer);

//             // Start recording with both audio and video
//             const stream = new MediaStream([
//                 videoTrack.getMediaStreamTrack(),
//                 audioTrack.getMediaStreamTrack(),
//             ]);
//             startRecording(stream);

//             console.log("Join and publish success!");
//         } catch (error) {
//             console.error("Error joining channel:", error);
//         }
//     };

//     const leaveChannel = async () => {
//         if (joinState) {
//             if (localVideoTrack) {
//                 localVideoTrack.stop();
//                 localVideoTrack.close();
//                 setLocalVideoTrack(null);
//             }

//             const remoteContainer = document.getElementById("remote-container");
//             if (remoteContainer) {
//                 remoteContainer.innerHTML = ""; // Only modify if it exists
//             }

//             await client.leave();
//             console.log("Left the channel.");
//             setJoinState(false);

//             // Stop recording
//             if (mediaRecorder) {
//                 mediaRecorder.stop();
//             }
//         }
//     };

//     const uploadRecording = async (chunks) => {
//         try {
//             const blob = new Blob(chunks, { type: "video/webm" });
//             const formData = new FormData();
//             formData.append("video", blob, "recording.webm");

//             const response = await fetch("http://localhost:9000/api/videos/upload", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (response.ok) {
//                 console.log("Video uploaded successfully");
//             } else {
//                 console.error("Video upload failed");
//             }
//         } catch (error) {
//             console.error("Error uploading video:", error);
//         }
//     };


//     return (
//         <Container className="p-4">
//             <h2 className="text-center text-primary mb-4">Agora Web SDK Video Call</h2>
//             <Row className="justify-content-center mb-3">
//                 <Col xs="auto">
//                     <Button variant="success" onClick={joinChannel} disabled={joinState}>
//                         Join Channel
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button variant="danger" onClick={leaveChannel} disabled={!joinState}>
//                         Leave Channel
//                     </Button>
//                 </Col>
//             </Row>

//             <div className="mt-4 text-center">
//                 {joinState && <p className="text-success">Connected to channel! Your video is active.</p>}
//                 <div className="screen mx-auto border rounded bg-light mt-3" style={{ width: '700px', height: '400px' }}></div>
//             </div>

//             <QuestionDisplay />
//         </Container>
//     );
// };

// export default Videocall;


// 12/3/25 new

// import AgoraRTC from "agora-rtc-sdk-ng";
// import { useEffect, useState, useRef } from "react";
// import { Button, Container, Row, Col } from "react-bootstrap";
// import QuestionDisplay from "../QuestionDisplay/QuestionDisplay";

// const Videocall = () => {
//     const [client, setClient] = useState(null);
//     const [localVideoTrack, setLocalVideoTrack] = useState(null);
//     const [localScreenTrack, setLocalScreenTrack] = useState(null);
//     const [localAudioTrack, setLocalAudioTrack] = useState(null);
//     const [joinState, setJoinState] = useState(false);
//     const [mediaRecorder, setMediaRecorder] = useState(null);
//     const [recordedChunks, setRecordedChunks] = useState([]);
//     const [isScreenSharing, setIsScreenSharing] = useState(false);
//     const [isRecording, setIsRecording] = useState(false);
//     const [recordingLink, setRecordingLink] = useState(null);

//     // Use refs for DOM elements to prevent feedback loop
//     const screenContainerRef = useRef(null);
//     const videoContainerRef = useRef(null);

//     const appId = "967f29ebd0af4614a422d9cab0ef039c";
//     const channel = "meet_demo";
//     const token = null;
//     const uid = 0;

//     useEffect(() => {
//         const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
//         setClient(agoraClient);

//         agoraClient.on("user-published", async (user, mediaType) => {
//             await agoraClient.subscribe(user, mediaType);
//             console.log("Subscribe success");
//             if (mediaType === "video") {
//                 const remoteVideoTrack = user.videoTrack;
//                 const remoteContainer = document.createElement("div");
//                 remoteContainer.id = `player-${user.uid}`;
//                 remoteContainer.className = "w-64 h-48 bg-black mt-2";
//                 document.getElementById("remote-container")?.appendChild(remoteContainer);
//                 remoteVideoTrack.play(remoteContainer.id);
//             }
//         });

//         agoraClient.on("user-unpublished", (user) => {
//             console.log("User unpublished:", user);
//             const remoteContainer = document.getElementById(`player-${user.uid}`);
//             if (remoteContainer) {
//                 remoteContainer.remove();
//             }
//         });

//         return () => {
//             leaveChannel();
//         };
//     }, []);

//     const startRecording = async (stream) => {
//         try {
//             const options = {
//                 mimeType: 'video/webm;codecs=vp9',
//                 videoBitsPerSecond: 3000000 // 3 Mbps
//             };

//             const recorder = new MediaRecorder(stream, options);
//             let chunks = [];

//             recorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     chunks.push(event.data);
//                     console.log("Recording data available, chunk size:", event.data.size);
//                 }
//             };

//             recorder.onstop = () => {
//                 console.log("Recorder stopped, creating file from chunks:", chunks.length);

//                 if (chunks.length > 0) {
//                     const blob = new Blob(chunks, { type: "video/webm" });
//                     setRecordedChunks(chunks);

//                     // Create download link but don't auto-download
//                     const url = URL.createObjectURL(blob);
//                     setRecordingLink(url);

//                     // Note: Auto-download code removed from here

//                     // Upload if your server is ready
//                     uploadRecording(chunks);
//                 }
//             };

//             // Set up data collection at 1-second intervals
//             recorder.start(1000);
//             setMediaRecorder(recorder);
//             setIsRecording(true);
//             console.log("Recording started");
//         } catch (error) {
//             console.error("Error starting recording:", error);
//             alert("Failed to start recording: " + error.message);
//         }
//     };

//     const joinChannel = async () => {
//         try {
//             await client.join(appId, channel, token, uid);

//             // Create audio track
//             const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//             setLocalAudioTrack(audioTrack);

//             // Create camera video track
//             const videoTrack = await AgoraRTC.createCameraVideoTrack();
//             setLocalVideoTrack(videoTrack);

//             // Publish audio and camera tracks
//             await client.publish([audioTrack, videoTrack]);

//             // Show local video
//             if (videoContainerRef.current) {
//                 videoContainerRef.current.innerHTML = "";
//                 videoTrack.play(videoContainerRef.current);
//             }

//             setJoinState(true);
//             console.log("Join and publish success!");
//         } catch (error) {
//             console.error("Error joining channel:", error);
//             alert("Failed to join channel: " + error.message);
//         }
//     };

//     const startScreenSharing = async () => {
//         try {
//             console.log("Starting screen sharing...");

//             // First, unpublish the camera track to avoid the multiple video tracks error
//             if (localVideoTrack) {
//                 console.log("Unpublishing camera track before screen sharing");
//                 await client.unpublish(localVideoTrack);
//                 // Don't stop or close the camera track, just keep it for later
//             }

//             // Create screen track
//             console.log("Creating screen track");
//             const screenTrack = await AgoraRTC.createScreenVideoTrack({
//                 encoderConfig: "1080p_1",
//                 screenSourceType: "screen"
//             });

//             setLocalScreenTrack(screenTrack);

//             // Publish screen track
//             console.log("Publishing screen track");
//             await client.publish(screenTrack);

//             // Show screen track in the container
//             if (screenContainerRef.current) {
//                 screenContainerRef.current.innerHTML = "";
//                 screenTrack.play(screenContainerRef.current);
//             }

//             // Even though we unpublished camera track, we can still show it locally
//             if (localVideoTrack && videoContainerRef.current) {
//                 localVideoTrack.play(videoContainerRef.current);
//             }

//             // Start recording with screen and audio
//             const stream = new MediaStream([
//                 screenTrack.getMediaStreamTrack(),
//                 localAudioTrack.getMediaStreamTrack()
//             ]);
//             startRecording(stream);

//             setIsScreenSharing(true);
//             console.log("Screen sharing started!");

//             // Handle when screen sharing stops
//             screenTrack.on("track-ended", () => {
//                 console.log("Screen track ended event received");
//                 stopScreenSharing();
//             });

//         } catch (error) {
//             console.error("Error starting screen sharing:", error);
//             alert("Failed to start screen sharing: " + error.message);

//             // If screen sharing fails, republish camera track
//             if (localVideoTrack) {
//                 try {
//                     console.log("Republishing camera track after screen sharing failure");
//                     await client.publish(localVideoTrack);
//                 } catch (pubError) {
//                     console.error("Error republishing camera:", pubError);
//                 }
//             }
//         }
//     };

//     const stopScreenSharing = async () => {
//         console.log("Stopping screen sharing...");
//         try {
//             if (localScreenTrack) {
//                 await client.unpublish(localScreenTrack);
//                 localScreenTrack.stop();
//                 localScreenTrack.close();
//                 setLocalScreenTrack(null);
//             }
    
//             if (localVideoTrack) {
//                 await client.publish(localVideoTrack);
//                 if (videoContainerRef.current) {
//                     localVideoTrack.play(videoContainerRef.current);
//                 }
//             }
    
//             if (mediaRecorder && mediaRecorder.state !== "inactive") {
//                 mediaRecorder.stop();
//                 setMediaRecorder(null);
//             }
    
//             setIsScreenSharing(false);
//             setIsRecording(false);
    
//             // Show Download button
//             if (recordedChunks.length > 0) {
//                 const blob = new Blob(recordedChunks, { type: "video/webm" });
//                 setRecordingLink(URL.createObjectURL(blob));
//             }
    
//             console.log("Screen sharing stopped successfully!");
//         } catch (error) {
//             console.error("Error stopping screen sharing:", error);
//             alert("Error stopping screen sharing: " + error.message);
//         }
//     };
    
//     const leaveChannel = async () => {
//         if (joinState) {
//             if (isScreenSharing) {
//                 await stopScreenSharing();
//             }
    
//             if (localVideoTrack) {
//                 localVideoTrack.stop();
//                 localVideoTrack.close();
//                 setLocalVideoTrack(null);
//             }
    
//             if (localAudioTrack) {
//                 localAudioTrack.stop();
//                 localAudioTrack.close();
//                 setLocalAudioTrack(null);
//             }
    
//             const remoteContainer = document.getElementById("remote-container");
//             if (remoteContainer) {
//                 remoteContainer.innerHTML = "";
//             }
    
//             await client.leave();
//             console.log("Left the channel.");
//             setJoinState(false);
    
//             if (mediaRecorder && mediaRecorder.state !== "inactive") {
//                 mediaRecorder.stop();
//             }
    
//             // Hide Download button when Camera Off is clicked
//             setRecordingLink(null);
//         }
//     };
    
//     const uploadRecording = async (chunks) => {
//         try {
//             const blob = new Blob(chunks, { type: "video/webm" });
//             const formData = new FormData();
//             formData.append("video", blob, "recording.webm");

//             const response = await fetch("http://localhost:9000/api/videos/upload", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (response.ok) {
//                 console.log("Video uploaded successfully");
//             } else {
//                 console.error("Video upload failed");
//             }
//         } catch (error) {
//             console.error("Error uploading video:", error);
//         }
//     };

//     const downloadRecording = () => {
//         if (recordedChunks.length > 0) {
//             const blob = new Blob(recordedChunks, { type: "video/webm" });
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement("a");
//             document.body.appendChild(a);
//             a.style.display = "none";
//             a.href = url;
//             a.download = `screen-recording-${new Date().toISOString()}.webm`;
//             a.click();
//             window.URL.revokeObjectURL(url);
//             document.body.removeChild(a);
//         }
//     };

//     return (
//         <Container className="p-4">
//             <h2 className="text-center text-primary mb-4">Agora Web SDK Video Call</h2>
//             <Row className="justify-content-center mb-3">
//                 <Col xs="auto">
//                     <Button variant="success" onClick={joinChannel} disabled={joinState}>
//                         {/* Join Channel */}
//                         Camera On
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button variant="info" onClick={startScreenSharing} disabled={!joinState || isScreenSharing}>
//                         Share Screen & Record
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button
//                         variant="warning"
//                         onClick={stopScreenSharing}
//                         disabled={!isScreenSharing}
//                         style={{ fontWeight: 'bold' }} // Make it more visible
//                     >
//                         Stop Screen Sharing
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button variant="danger" onClick={leaveChannel} disabled={!joinState}>
//                         {/* Leave Channel */}
//                         Camera Off
//                     </Button>
//                 </Col>
//                 {/* {recordingLink && (
//                     <Col xs="auto">
//                         <Button variant="success" onClick={downloadRecording}>
//                             Download Recording
//                         </Button>
//                     </Col>
//                 )} */}

//                 {recordingLink && isScreenSharing === false && (
//                     <Col xs="auto">
//                         <Button variant="success" onClick={downloadRecording}>
//                             Download Recording
//                         </Button>
//                     </Col>
//                 )}
//             </Row>

//             <div className="mt-4 text-center">
//                 {/* {joinState && <p className="text-success">Connected to channel!</p>}
//                 {isScreenSharing && <p className="text-info">Screen sharing active</p>}
//                 {isRecording && <p className="text-danger">Recording in progress...</p>} */}

//                 <Row>
//                     {/* Camera feed - always visible */}
//                     <Col md={8}>
//                         <div className="rounded bg-dark border mt-3 mb-3">
//                             {/* <h5>Camera</h5> */}
//                             <div
//                                 ref={videoContainerRef}
//                                 className="video-container"
//                                 style={{ width: '100%', height: '420px' }}
//                             ></div>
//                         </div>
//                     </Col>


//                 </Row>
//             </div>

//             <div id="remote-container" className="d-flex flex-wrap justify-content-center mt-3"></div>

//             <QuestionDisplay />
//         </Container>
//     );
// };

// export default Videocall;



// new 18/03/2025
// import AgoraRTC from "agora-rtc-sdk-ng";
// import { useEffect, useState, useRef } from "react";
// import { Button, Container, Row, Col } from "react-bootstrap";
// import QuestionDisplay from "../QuestionDisplay/QuestionDisplay";
// import backAudio from "../../assets/audio/country-2-302328.mp3"

// const Videocall = () => {
//     const [client, setClient] = useState(null);
//     const [localVideoTrack, setLocalVideoTrack] = useState(null);
//     const [localScreenTrack, setLocalScreenTrack] = useState(null);
//     const [localAudioTrack, setLocalAudioTrack] = useState(null);
//     const [joinState, setJoinState] = useState(false);
//     const [mediaRecorder, setMediaRecorder] = useState(null);
//     const [recordedChunks, setRecordedChunks] = useState([]);
//     const [isScreenSharing, setIsScreenSharing] = useState(false);
//     const [isRecording, setIsRecording] = useState(false);
//     const [recordingLink, setRecordingLink] = useState(null);

//     // Audio player reference
//     const audioRef = useRef(new Audio(backAudio));
//     const audioContextRef = useRef(null);
//     const audioSourceRef = useRef(null);
//     const audioDestinationRef = useRef(null);

//     // Use refs for DOM elements to prevent feedback loop
//     const screenContainerRef = useRef(null);
//     const videoContainerRef = useRef(null);

//     const appId = "967f29ebd0af4614a422d9cab0ef039c";
//     const channel = "meet_demo";
//     const token = null;
//     const uid = 0;


//     useEffect(() => {
//         const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
//         setClient(agoraClient);

//         // Set up audio element
//         audioRef.current.loop = true;
//         audioRef.current.volume = 0.5;

//         agoraClient.on("user-published", async (user, mediaType) => {
//             await agoraClient.subscribe(user, mediaType);
//             console.log("Subscribe success");
//             if (mediaType === "video") {
//                 const remoteVideoTrack = user.videoTrack;
//                 const remoteContainer = document.createElement("div");
//                 remoteContainer.id = `player-${user.uid}`;
//                 remoteContainer.className = "w-64 h-48 bg-black mt-2";
//                 document.getElementById("remote-container")?.appendChild(remoteContainer);
//                 remoteVideoTrack.play(remoteContainer.id);
//             }
//         });

//         agoraClient.on("user-unpublished", (user) => {
//             console.log("User unpublished:", user);
//             const remoteContainer = document.getElementById(`player-${user.uid}`);
//             if (remoteContainer) {
//                 remoteContainer.remove();
//             }
//         });

//         return () => {
//             leaveChannel();
//             // Clean up audio
//             stopBackgroundAudio();
//         };
//     }, []);

//     const setupIntervalAudio = () => {
//         try {
//             const audioEl = audioRef.current;

//             // Create audio context
//             const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//             audioContextRef.current = audioContext;

//             // Create media element source
//             const source = audioContext.createMediaElementSource(audioEl);
//             audioSourceRef.current = source;

//             // Create destination for recording
//             const destination = audioContext.createMediaStreamDestination();
//             audioDestinationRef.current = destination;

//             // Connect source to both speakers and recording destination
//             source.connect(audioContext.destination); // For speakers
//             source.connect(destination); // For recording

//             // Start playing the audio
//             audioEl.play();

//             // Set up interval to toggle audio playback every 5 seconds
//             const intervalId = setInterval(() => {
//                 if (audioEl.paused) {
//                     console.log("Resuming background audio");
//                     audioEl.play();
//                 } else {
//                     console.log("Pausing background audio");
//                     audioEl.pause();
//                 }
//             }, 5000); // 5 seconds

//             // Store the interval ID for cleanup
//             return {
//                 intervalId,
//                 audioStream: destination.stream
//             };
//         } catch (error) {
//             console.error("Error setting up interval audio:", error);
//             return { intervalId: null, audioStream: null };
//         }
//     };

//     const startBackgroundAudio = async () => {
//         try {
//             // Start the interval-based audio playback
//             const { intervalId, audioStream } = setupIntervalAudio();

//             // Store the interval ID for cleanup
//             audioRef.current.intervalId = intervalId;

//             console.log("Background audio started with 5-second intervals");

//             // Log audio tracks to verify
//             if (audioStream) {
//                 console.log("Background audio stream created with tracks:",
//                     audioStream.getAudioTracks().length);
//                 audioStream.getAudioTracks().forEach((track, i) => {
//                     console.log(`Background audio track ${i}:`, track.label, track.enabled);
//                 });
//             }

//             return audioStream;
//         } catch (error) {
//             console.error("Error starting background audio:", error);
//             return null;
//         }
//     };

//     const stopBackgroundAudio = () => {
//         try {
//             const audioEl = audioRef.current;

//             // Clear the interval if it exists
//             if (audioEl.intervalId) {
//                 clearInterval(audioEl.intervalId);
//                 audioEl.intervalId = null;
//             }

//             audioEl.pause();
//             audioEl.currentTime = 0;
//             console.log("Background audio stopped and interval cleared");

//             // Clean up audio context connections
//             if (audioSourceRef.current) {
//                 audioSourceRef.current.disconnect();
//                 audioSourceRef.current = null;
//             }

//             if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
//                 audioContextRef.current.close();
//                 audioContextRef.current = null;
//             }

//             audioDestinationRef.current = null;
//         } catch (error) {
//             console.error("Error stopping background audio:", error);
//         }
//     };

//     const startRecording = async (videoStream, audioStream, backgroundAudioStream) => {
//         try {
//             // Create audio mixer for multiple audio sources
//             const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//             const audioDestination = audioContext.createMediaStreamDestination();

//             // Get all video tracks from the screen capture
//             const videoTracks = videoStream.getVideoTracks();

//             // Get microphone audio track if available
//             const micTracks = audioStream.getAudioTracks();
//             if (micTracks.length > 0) {
//                 console.log("Adding microphone audio to recording");
//                 const micSource = audioContext.createMediaStreamSource(new MediaStream([micTracks[0]]));
//                 micSource.connect(audioDestination);
//             }

//             // Add background audio track if available
//             if (backgroundAudioStream && backgroundAudioStream.getAudioTracks().length > 0) {
//                 console.log("Adding background audio to recording mixer");
//                 const backgroundSource = audioContext.createMediaStreamSource(backgroundAudioStream);
//                 backgroundSource.connect(audioDestination);
//             } else {
//                 console.warn("No background audio tracks available for recording");
//             }

//             // Create a combined stream with video track and mixed audio
//             const combinedTracks = [
//                 ...videoTracks,
//                 ...audioDestination.stream.getAudioTracks()
//             ];

//             // Log all tracks being used for recording
//             console.log(`Recording with ${combinedTracks.length} tracks:`);
//             combinedTracks.forEach((track, index) => {
//                 console.log(`Track ${index}: ${track.kind} - ${track.readyState} - ${track.label}`);
//             });

//             const combinedStream = new MediaStream(combinedTracks);

//             // Set up media recorder with appropriate options
//             const options = {
//                 mimeType: 'video/webm;codecs=vp9',
//                 videoBitsPerSecond: 3000000, // 3 Mbps
//                 audioBitsPerSecond: 128000   // 128 kbps for audio
//             };

//             const recorder = new MediaRecorder(combinedStream, options);
//             let chunks = [];

//             recorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     chunks.push(event.data);
//                     console.log("Recording data available, chunk size:", event.data.size);
//                 }
//             };

//             recorder.onstop = () => {
//                 console.log("Recorder stopped, creating file from chunks:", chunks.length);

//                 if (chunks.length > 0) {
//                     const blob = new Blob(chunks, { type: "video/webm" });
//                     setRecordedChunks(chunks);

//                     // Create download link
//                     const url = URL.createObjectURL(blob);
//                     setRecordingLink(url);

//                     // Upload if your server is ready
//                     uploadRecording(chunks);
//                 }

//                 // Close audio context used for recording
//                 if (audioContext && audioContext.state !== 'closed') {
//                     audioContext.close().catch(e => console.error("Error closing audio context:", e));
//                 }
//             };

//             // Start recording with 1-second data chunks
//             recorder.start(1000);
//             setMediaRecorder(recorder);
//             setIsRecording(true);
//             console.log("Recording started with background audio");
//         } catch (error) {
//             console.error("Error starting recording:", error);
//             alert("Failed to start recording: " + error.message);
//         }
//     };

//     const joinChannel = async () => {
//         try {
//             await client.join(appId, channel, token, uid);

//             // Create audio track
//             const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//             setLocalAudioTrack(audioTrack);

//             // Create camera video track
//             const videoTrack = await AgoraRTC.createCameraVideoTrack();
//             setLocalVideoTrack(videoTrack);

//             // Publish audio and camera tracks
//             await client.publish([audioTrack, videoTrack]);

//             // Show local video
//             if (videoContainerRef.current) {
//                 videoContainerRef.current.innerHTML = "";
//                 videoTrack.play(videoContainerRef.current);
//             }

//             setJoinState(true);
//             console.log("Join and publish success!");
//         } catch (error) {
//             console.error("Error joining channel:", error);
//             alert("Failed to join channel: " + error.message);
//         }
//     };
    
//     // 19/3 final 
//     const startScreenSharing = async () => {
//         try {
//             console.log("Starting screen sharing...");

//             // Detect Safari more reliably
//             const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
//                 (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'));
//             console.log("Browser detected as Safari:", isSafari);

//             // Safari-specific implementation
//             if (isSafari) {
//                 // Simple configuration for Safari
//                 const screenTrack = await AgoraRTC.createScreenVideoTrack({
//                     // Minimal configuration for Safari
//                     encoderConfig: "1080p_1"
//                 }, "disable"); // "disable" to not create audio track together

//                 // Unpublish camera track first
//                 if (localVideoTrack) {
//                     console.log("Unpublishing camera track before screen sharing");
//                     await client.unpublish(localVideoTrack);
//                 }

//                 setLocalScreenTrack(screenTrack);

//                 // Publish screen track
//                 console.log("Publishing screen track");
//                 await client.publish(screenTrack);

//                 if (screenContainerRef.current) {
//                     screenContainerRef.current.innerHTML = "";
//                     screenTrack.play(screenContainerRef.current);
//                 }

//                 // Even though we unpublished camera track, we can still show it locally
//                 if (localVideoTrack && videoContainerRef.current) {
//                     localVideoTrack.play(videoContainerRef.current);
//                 }

//                 // Start the background audio - MUST be started before recording
//                 console.log("Starting background audio for recording");
//                 const backgroundAudioStream = await startBackgroundAudio();

//                 // Wait a moment to ensure background audio is playing
//                 await new Promise(resolve => setTimeout(resolve, 500));

//                 // Get the screen video stream
//                 const screenMediaTrack = screenTrack.getMediaStreamTrack();
//                 const screenStream = new MediaStream([screenMediaTrack]);

//                 // Get the microphone audio stream
//                 const micStream = new MediaStream([localAudioTrack.getMediaStreamTrack()]);

//                 // Start recording with all sources
//                 console.log("Starting recording with background audio");
//                 startRecording(screenStream, micStream, backgroundAudioStream);

//                 setIsScreenSharing(true);
//                 console.log("Screen sharing started!");

//                 // Handle when screen sharing stops
//                 screenTrack.on("track-ended", () => {
//                     console.log("Screen track ended event received");
//                     stopScreenSharing();
//                 });
//             } else {
//                 // Non-Safari browsers (Chrome, Edge, etc.)
//                 console.log("Using configuration for non-Safari browsers");

//                 // Create screen track with enhanced configuration for other browsers
//                 const screenTrackConfig = {
//                     encoderConfig: "1080p_1",
//                     screenSourceType: "screen",
//                     screenConfig: {
//                         mandatory: {
//                             chromeMediaSource: 'desktop',
//                             chromeMediaSourceId: null,
//                             minWidth: 1920,
//                             maxWidth: 1920,
//                             minHeight: 1080,
//                             maxHeight: 1080
//                         },
//                         displaySurface: "monitor",
//                         logicalSurface: false,
//                         cursor: "always",
//                         updateInterval: 100
//                     }
//                 };

//                 console.log("Creating screen track with configuration:", screenTrackConfig);
//                 const screenTrack = await AgoraRTC.createScreenVideoTrack(screenTrackConfig);

//                 // Unpublish camera track
//                 if (localVideoTrack) {
//                     console.log("Unpublishing camera track before screen sharing");
//                     await client.unpublish(localVideoTrack);
//                 }

//                 setLocalScreenTrack(screenTrack);

//                 // Publish screen track
//                 console.log("Publishing screen track");
//                 await client.publish(screenTrack);

//                 // Show screen track in the container
//                 if (screenContainerRef.current) {
//                     screenContainerRef.current.innerHTML = "";
//                     screenTrack.play(screenContainerRef.current);
//                 }

//                 // Even though we unpublished camera track, we can still show it locally
//                 if (localVideoTrack && videoContainerRef.current) {
//                     localVideoTrack.play(videoContainerRef.current);
//                 }

//                 // Start the background audio - MUST be started before recording
//                 console.log("Starting background audio for recording");
//                 const backgroundAudioStream = await startBackgroundAudio();

//                 // Wait a moment to ensure background audio is playing
//                 await new Promise(resolve => setTimeout(resolve, 500));

//                 // Get the screen video stream
//                 const screenMediaTrack = screenTrack.getMediaStreamTrack();

//                 // Apply constraints for better quality
//                 if (screenMediaTrack.applyConstraints) {
//                     try {
//                         await screenMediaTrack.applyConstraints({
//                             width: { ideal: window.screen.width },
//                             height: { ideal: window.screen.height },
//                             frameRate: { ideal: 30 }
//                         });
//                         console.log("Applied additional constraints to screen track");
//                     } catch (constraintError) {
//                         console.warn("Could not apply additional constraints:", constraintError);
//                     }
//                 }

//                 const screenStream = new MediaStream([screenMediaTrack]);

//                 // Get the microphone audio stream
//                 const micStream = new MediaStream([localAudioTrack.getMediaStreamTrack()]);

//                 // Start recording with all sources
//                 console.log("Starting recording with background audio");
//                 startRecording(screenStream, micStream, backgroundAudioStream);

//                 setIsScreenSharing(true);
//                 console.log("Screen sharing started!");

//                 // Handle when screen sharing stops
//                 screenTrack.on("track-ended", () => {
//                     console.log("Screen track ended event received");
//                     stopScreenSharing();
//                 });
//             }
//         } catch (error) {
//             console.error("Error starting screen sharing:", error);
//             alert("Failed to start screen sharing: " + error.message);

//             // If screen sharing fails, republish camera track
//             if (localVideoTrack) {
//                 try {
//                     console.log("Republishing camera track after screen sharing failure");
//                     await client.publish(localVideoTrack);
//                 } catch (pubError) {
//                     console.error("Error republishing camera:", pubError);
//                 }
//             }

//             // Also stop background audio if it started
//             stopBackgroundAudio();
//         }
//     };

//     const stopScreenSharing = async () => {
//         console.log("Stopping screen sharing...");
//         try {
//             // Stop background audio
//             stopBackgroundAudio();

//             if (localScreenTrack) {
//                 await client.unpublish(localScreenTrack);
//                 localScreenTrack.stop();
//                 localScreenTrack.close();
//                 setLocalScreenTrack(null);
//             }

//             if (localVideoTrack) {
//                 await client.publish(localVideoTrack);
//                 if (videoContainerRef.current) {
//                     localVideoTrack.play(videoContainerRef.current);
//                 }
//             }

//             if (mediaRecorder && mediaRecorder.state !== "inactive") {
//                 mediaRecorder.stop();
//                 setMediaRecorder(null);
//             }

//             setIsScreenSharing(false);
//             setIsRecording(false);

//             // Show Download button
//             if (recordedChunks.length > 0) {
//                 const blob = new Blob(recordedChunks, { type: "video/webm" });
//                 setRecordingLink(URL.createObjectURL(blob));
//             }

//             console.log("Screen sharing stopped successfully!");
//         } catch (error) {
//             console.error("Error stopping screen sharing:", error);
//             alert("Error stopping screen sharing: " + error.message);

//             // Make sure audio stops even if there's an error
//             stopBackgroundAudio();
//         }
//     };

//     const leaveChannel = async () => {
//         if (joinState) {
//             if (isScreenSharing) {
//                 await stopScreenSharing();
//             }

//             if (localVideoTrack) {
//                 localVideoTrack.stop();
//                 localVideoTrack.close();
//                 setLocalVideoTrack(null);
//             }

//             if (localAudioTrack) {
//                 localAudioTrack.stop();
//                 localAudioTrack.close();
//                 setLocalAudioTrack(null);
//             }

//             const remoteContainer = document.getElementById("remote-container");
//             if (remoteContainer) {
//                 remoteContainer.innerHTML = "";
//             }

//             await client.leave();
//             console.log("Left the channel.");
//             setJoinState(false);

//             if (mediaRecorder && mediaRecorder.state !== "inactive") {
//                 mediaRecorder.stop();
//             }

//             // Hide Download button when Camera Off is clicked
//             setRecordingLink(null);

//             // Make sure audio is stopped
//             stopBackgroundAudio();
//         }
//     };

//     const uploadRecording = async (chunks) => {
//         try {
//             const blob = new Blob(chunks, { type: "video/webm" });
//             const formData = new FormData();
//             formData.append("video", blob, "recording.webm");

//             const response = await fetch("http://localhost:9000/api/videos/upload", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (response.ok) {
//                 console.log("Video uploaded successfully");
//             } else {
//                 console.error("Video upload failed");
//             }
//         } catch (error) {
//             console.error("Error uploading video:", error);
//         }
//     };

//     const downloadRecording = () => {
//         if (recordedChunks.length > 0) {
//             const blob = new Blob(recordedChunks, { type: "video/webm" });
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement("a");
//             document.body.appendChild(a);
//             a.style.display = "none";
//             a.href = url;
//             a.download = `screen-recording-${new Date().toISOString()}.webm`;
//             a.click();
//             window.URL.revokeObjectURL(url);
//             document.body.removeChild(a);
//         }
//     };

//     return (
//         <Container className="p-4">
//             <h2 className="text-center text-primary mb-4">Agora Web SDK Video Call</h2>
//             <Row className="justify-content-center mb-3">
//                 <Col xs="auto">
//                     <Button variant="success" onClick={joinChannel} disabled={joinState}>
//                         Camera On
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button variant="info" onClick={startScreenSharing} disabled={!joinState || isScreenSharing}>
//                         Share Screen & Record
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button
//                         variant="warning"
//                         onClick={stopScreenSharing}
//                         disabled={!isScreenSharing}
//                         style={{ fontWeight: 'bold' }}
//                     >
//                         Stop Screen Sharing
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button variant="danger" onClick={leaveChannel} disabled={!joinState}>
//                         Camera Off
//                     </Button>
//                 </Col>
//                 {recordingLink && isScreenSharing === false && (
//                     <Col xs="auto">
//                         <Button variant="success" onClick={downloadRecording}>
//                             Download Recording
//                         </Button>
//                     </Col>
//                 )}
//             </Row>

//             <div className="mt-4 text-center">
//                 <Row>
//                     {/* Camera feed - always visible */}
//                     <Col md={8}>
//                         <div className="rounded bg-dark border mt-3 mb-3">
//                             {/* <h5>Camera</h5> */}
//                             <div
//                                 ref={videoContainerRef}
//                                 className="video-container"
//                                 style={{ width: '100%', height: '420px' }}
//                             ></div>
//                         </div>
//                     </Col>


//                 </Row>
//             </div>

//             <div id="remote-container" className="d-flex flex-wrap justify-content-center mt-3"></div>

//             <QuestionDisplay />
//         </Container>
//     );
// };

// export default Videocall;



// new 19/03/2025
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState, useRef } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import QuestionDisplay from "../QuestionDisplay/QuestionDisplay";
import backAudio from "../../assets/audio/country-2-302328.mp3";

const Videocall = () => {
    const [client, setClient] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [localScreenTrack, setLocalScreenTrack] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [joinState, setJoinState] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingLink, setRecordingLink] = useState(null);

    // Audio player reference
    const audioRef = useRef(new Audio(backAudio));
    const audioContextRef = useRef(null);
    const audioSourceRef = useRef(null);
    const audioDestinationRef = useRef(null);

    // DOM refs
    const screenContainerRef = useRef(null);
    const videoContainerRef = useRef(null);

    const appId = "967f29ebd0af4614a422d9cab0ef039c";
    const channel = "meet_demo";
    const token = null;
    const uid = 0;

    useEffect(() => {
        const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        setClient(agoraClient);

        // Set up audio element
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        agoraClient.on("user-published", async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType);
            console.log("Subscribe success");
            if (mediaType === "video") {
                const remoteVideoTrack = user.videoTrack;
                const remoteContainer = document.createElement("div");
                remoteContainer.id = `player-${user.uid}`;
                remoteContainer.className = "w-64 h-48 bg-black mt-2";
                document.getElementById("remote-container")?.appendChild(remoteContainer);
                remoteVideoTrack.play(remoteContainer.id);
            }
        });

        agoraClient.on("user-unpublished", (user) => {
            console.log("User unpublished:", user);
            const remoteContainer = document.getElementById(`player-${user.uid}`);
            if (remoteContainer) {
                remoteContainer.remove();
            }
        });

        return () => {
            leaveChannel();
            stopBackgroundAudio();
        };
    }, []);

    const setupIntervalAudio = () => {
        try {
            const audioEl = audioRef.current;
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaElementSource(audioEl);
            audioSourceRef.current = source;

            const destination = audioContext.createMediaStreamDestination();
            audioDestinationRef.current = destination;

            source.connect(audioContext.destination);
            source.connect(destination);

            audioEl.play();

            const intervalId = setInterval(() => {
                if (audioEl.paused) {
                    console.log("Resuming background audio");
                    audioEl.play();
                } else {
                    console.log("Pausing background audio");
                    audioEl.pause();
                }
            }, 5000);

            return { intervalId, audioStream: destination.stream };
        } catch (error) {
            console.error("Error setting up interval audio:", error);
            return { intervalId: null, audioStream: null };
        }
    };

    const startBackgroundAudio = async () => {
        try {
            const { intervalId, audioStream } = setupIntervalAudio();
            audioRef.current.intervalId = intervalId;
            console.log("Background audio started with 5-second intervals");
            return audioStream;
        } catch (error) {
            console.error("Error starting background audio:", error);
            return null;
        }
    };

    const stopBackgroundAudio = () => {
        try {
            const audioEl = audioRef.current;
            if (audioEl.intervalId) {
                clearInterval(audioEl.intervalId);
                audioEl.intervalId = null;
            }
            audioEl.pause();
            audioEl.currentTime = 0;

            if (audioSourceRef.current) {
                audioSourceRef.current.disconnect();
                audioSourceRef.current = null;
            }

            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            audioDestinationRef.current = null;
            console.log("Background audio stopped and interval cleared");
        } catch (error) {
            console.error("Error stopping background audio:", error);
        }
    };

    const startRecording = async (videoStream, audioStream, backgroundAudioStream) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioDestination = audioContext.createMediaStreamDestination();

            const videoTracks = videoStream.getVideoTracks();
            const micTracks = audioStream.getAudioTracks();

            if (micTracks.length > 0) {
                const micSource = audioContext.createMediaStreamSource(new MediaStream([micTracks[0]]));
                micSource.connect(audioDestination);
            }

            if (backgroundAudioStream && backgroundAudioStream.getAudioTracks().length > 0) {
                const backgroundSource = audioContext.createMediaStreamSource(backgroundAudioStream);
                backgroundSource.connect(audioDestination);
            }

            const combinedTracks = [...videoTracks, ...audioDestination.stream.getAudioTracks()];
            const combinedStream = new MediaStream(combinedTracks);

            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 3000000,
                audioBitsPerSecond: 128000
            };

            const recorder = new MediaRecorder(combinedStream, options);
            let chunks = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: "video/webm" });
                    setRecordedChunks(chunks);
                    setRecordingLink(URL.createObjectURL(blob));
                    uploadRecording(chunks);
                }
                if (audioContext && audioContext.state !== 'closed') {
                    audioContext.close();
                }
            };

            recorder.start(1000);
            setMediaRecorder(recorder);
            setIsRecording(true);
            console.log("Recording started with background audio");
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Failed to start recording: " + error.message);
        }
    };

    const joinChannel = async () => {
        try {
            await client.join(appId, channel, token, uid);

            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);

            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            setLocalVideoTrack(videoTrack);

            await client.publish([audioTrack, videoTrack]);

            if (videoContainerRef.current) {
                videoContainerRef.current.innerHTML = "";
                videoTrack.play(videoContainerRef.current);
            }

            setJoinState(true);
            console.log("Join and publish success!");
        } catch (error) {
            console.error("Error joining channel:", error);
            alert("Failed to join channel: " + error.message);
        }
    };

    const startScreenSharing = async () => {
        try {
            console.log("Starting screen sharing...");

            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
                (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'));

            if (isSafari) {
                const screenTrack = await AgoraRTC.createScreenVideoTrack({
                    encoderConfig: "1080p_1"
                }, "disable");

                if (localVideoTrack) {
                    await client.unpublish(localVideoTrack);
                }

                setLocalScreenTrack(screenTrack);
                await client.publish(screenTrack);

                if (screenContainerRef.current) {
                    screenContainerRef.current.innerHTML = "";
                    screenTrack.play(screenContainerRef.current);
                }

                if (localVideoTrack && videoContainerRef.current) {
                    localVideoTrack.play(videoContainerRef.current);
                }

                const backgroundAudioStream = await startBackgroundAudio();
                await new Promise(resolve => setTimeout(resolve, 500));

                const screenMediaTrack = screenTrack.getMediaStreamTrack();
                const screenStream = new MediaStream([screenMediaTrack]);
                const micStream = new MediaStream([localAudioTrack.getMediaStreamTrack()]);

                startRecording(screenStream, micStream, backgroundAudioStream);
                setIsScreenSharing(true);

                screenTrack.on("track-ended", () => {
                    stopScreenSharing();
                });
            } else {
                const screenTrack = await AgoraRTC.createScreenVideoTrack({
                    encoderConfig: "1080p_1",
                    screenSourceType: "screen"
                });

                if (localVideoTrack) {
                    await client.unpublish(localVideoTrack);
                }

                setLocalScreenTrack(screenTrack);
                await client.publish(screenTrack);

                if (screenContainerRef.current) {
                    screenContainerRef.current.innerHTML = "";
                    screenTrack.play(screenContainerRef.current);
                }

                if (localVideoTrack && videoContainerRef.current) {
                    localVideoTrack.play(videoContainerRef.current);
                }

                const backgroundAudioStream = await startBackgroundAudio();
                await new Promise(resolve => setTimeout(resolve, 500));

                const screenMediaTrack = screenTrack.getMediaStreamTrack();
                const screenStream = new MediaStream([screenMediaTrack]);
                const micStream = new MediaStream([localAudioTrack.getMediaStreamTrack()]);

                startRecording(screenStream, micStream, backgroundAudioStream);
                setIsScreenSharing(true);

                screenTrack.on("track-ended", () => {
                    stopScreenSharing();
                });
            }
        } catch (error) {
            console.error("Error starting screen sharing:", error);
            alert("Failed to start screen sharing: " + error.message);

            if (localVideoTrack) {
                await client.publish(localVideoTrack);
            }

            stopBackgroundAudio();
        }
    };

    const stopScreenSharing = async () => {
        try {
            stopBackgroundAudio();

            if (localScreenTrack) {
                await client.unpublish(localScreenTrack);
                localScreenTrack.stop();
                localScreenTrack.close();
                setLocalScreenTrack(null);
            }

            if (localVideoTrack) {
                await client.publish(localVideoTrack);
                if (videoContainerRef.current) {
                    localVideoTrack.play(videoContainerRef.current);
                }
            }

            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                setMediaRecorder(null);
            }

            setIsScreenSharing(false);
            setIsRecording(false);

            if (recordedChunks.length > 0) {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                setRecordingLink(URL.createObjectURL(blob));
            }

            console.log("Screen sharing stopped successfully!");
        } catch (error) {
            console.error("Error stopping screen sharing:", error);
            alert("Error stopping screen sharing: " + error.message);
            stopBackgroundAudio();
        }
    };

    const leaveChannel = async () => {
        if (joinState) {
            if (isScreenSharing) {
                await stopScreenSharing();
            }

            if (localVideoTrack) {
                localVideoTrack.stop();
                localVideoTrack.close();
                setLocalVideoTrack(null);
            }

            if (localAudioTrack) {
                localAudioTrack.stop();
                localAudioTrack.close();
                setLocalAudioTrack(null);
            }

            const remoteContainer = document.getElementById("remote-container");
            if (remoteContainer) {
                remoteContainer.innerHTML = "";
            }

            await client.leave();
            setJoinState(false);

            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }

            setRecordingLink(null);
            stopBackgroundAudio();
        }
    };

    const uploadRecording = async (chunks) => {
        try {
            const blob = new Blob(chunks, { type: "video/webm" });
            const formData = new FormData();
            formData.append("video", blob, "recording.webm");

            const response = await fetch("http://localhost:9000/api/videos/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                console.log("Video uploaded successfully");
            } else {
                console.error("Video upload failed");
            }
        } catch (error) {
            console.error("Error uploading video:", error);
        }
    };

    const downloadRecording = () => {
        if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = `screen-recording-${new Date().toISOString()}.webm`;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    };

    return (
        <Container className="p-4">
            <h2 className="text-center text-primary mb-4">Agora Web SDK Video Call</h2>
            <Row className="justify-content-center mb-3">
                <Col xs="auto">
                    <Button variant="success" onClick={joinChannel} disabled={joinState}>
                        Camera On
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="info" onClick={startScreenSharing} disabled={!joinState || isScreenSharing}>
                        Share Screen & Record
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="warning" onClick={stopScreenSharing} disabled={!isScreenSharing}>
                        Stop Screen Sharing
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="danger" onClick={leaveChannel} disabled={!joinState}>
                        Camera Off
                    </Button>
                </Col>
                {recordingLink && isScreenSharing === false && (
                    <Col xs="auto">
                        <Button variant="success" onClick={downloadRecording}>
                            Download Recording
                        </Button>
                    </Col>
                )}
            </Row>

            <div className="mt-4 text-center">
                <Row>
                    <Col md={8}>
                        <div className="rounded bg-dark border mt-3 mb-3">
                            <div
                                ref={videoContainerRef}
                                className="video-container"
                                style={{ width: '100%', height: '420px' }}
                            ></div>
                        </div>
                    </Col>
                </Row>
            </div>

            <div id="remote-container" className="d-flex flex-wrap justify-content-center mt-3"></div>

            <QuestionDisplay />
        </Container>
    );
};

export default Videocall;