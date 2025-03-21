
// new 18/03/2025
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState, useRef } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import QuestionDisplay from "../QuestionDisplay/QuestionDisplay";
import backAudio from "../../assets/audio/country-2-302328.mp3"

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

    // Use refs for DOM elements to prevent feedback loop
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
            // Clean up audio
            stopBackgroundAudio();
        };
    }, []);

    const setupIntervalAudio = () => {
        try {
            const audioEl = audioRef.current;

            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            // Create media element source
            const source = audioContext.createMediaElementSource(audioEl);
            audioSourceRef.current = source;

            // Create destination for recording
            const destination = audioContext.createMediaStreamDestination();
            audioDestinationRef.current = destination;

            // Connect source to both speakers and recording destination
            source.connect(audioContext.destination); // For speakers
            source.connect(destination); // For recording

            // Start playing the audio
            audioEl.play();

            // Set up interval to toggle audio playback every 5 seconds
            const intervalId = setInterval(() => {
                if (audioEl.paused) {
                    console.log("Resuming background audio");
                    audioEl.play();
                } else {
                    console.log("Pausing background audio");
                    audioEl.pause();
                }
            }, 5000); // 5 seconds

            // Store the interval ID for cleanup
            return {
                intervalId,
                audioStream: destination.stream
            };
        } catch (error) {
            console.error("Error setting up interval audio:", error);
            return { intervalId: null, audioStream: null };
        }
    };

    const startBackgroundAudio = async () => {
        try {
            // Start the interval-based audio playback
            const { intervalId, audioStream } = setupIntervalAudio();

            // Store the interval ID for cleanup
            audioRef.current.intervalId = intervalId;

            console.log("Background audio started with 5-second intervals");

            // Log audio tracks to verify
            if (audioStream) {
                console.log("Background audio stream created with tracks:",
                    audioStream.getAudioTracks().length);
                audioStream.getAudioTracks().forEach((track, i) => {
                    console.log(`Background audio track ${i}:`, track.label, track.enabled);
                });
            }

            return audioStream;
        } catch (error) {
            console.error("Error starting background audio:", error);
            return null;
        }
    };

    const stopBackgroundAudio = () => {
        try {
            const audioEl = audioRef.current;

            // Clear the interval if it exists
            if (audioEl.intervalId) {
                clearInterval(audioEl.intervalId);
                audioEl.intervalId = null;
            }

            audioEl.pause();
            audioEl.currentTime = 0;
            console.log("Background audio stopped and interval cleared");

            // Clean up audio context connections
            if (audioSourceRef.current) {
                audioSourceRef.current.disconnect();
                audioSourceRef.current = null;
            }

            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            audioDestinationRef.current = null;
        } catch (error) {
            console.error("Error stopping background audio:", error);
        }
    };

    const startRecording = async (videoStream, audioStream, backgroundAudioStream) => {
        try {
            // Create audio mixer for multiple audio sources
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioDestination = audioContext.createMediaStreamDestination();

            // Get all video tracks from the screen capture
            const videoTracks = videoStream.getVideoTracks();

            // Get microphone audio track if available
            const micTracks = audioStream.getAudioTracks();
            if (micTracks.length > 0) {
                console.log("Adding microphone audio to recording");
                const micSource = audioContext.createMediaStreamSource(new MediaStream([micTracks[0]]));
                micSource.connect(audioDestination);
            }

            // Add background audio track if available
            if (backgroundAudioStream && backgroundAudioStream.getAudioTracks().length > 0) {
                console.log("Adding background audio to recording mixer");
                const backgroundSource = audioContext.createMediaStreamSource(backgroundAudioStream);
                backgroundSource.connect(audioDestination);
            } else {
                console.warn("No background audio tracks available for recording");
            }

            // Create a combined stream with video track and mixed audio
            const combinedTracks = [
                ...videoTracks,
                ...audioDestination.stream.getAudioTracks()
            ];

            // Log all tracks being used for recording
            console.log(`Recording with ${combinedTracks.length} tracks:`);
            combinedTracks.forEach((track, index) => {
                console.log(`Track ${index}: ${track.kind} - ${track.readyState} - ${track.label}`);
            });

            const combinedStream = new MediaStream(combinedTracks);

            // Set up media recorder with appropriate options
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 3000000, // 3 Mbps
                audioBitsPerSecond: 128000   // 128 kbps for audio
            };

            const recorder = new MediaRecorder(combinedStream, options);
            let chunks = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                    console.log("Recording data available, chunk size:", event.data.size);
                }
            };

            recorder.onstop = () => {
                console.log("Recorder stopped, creating file from chunks:", chunks.length);

                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: "video/webm" });
                    setRecordedChunks(chunks);

                    // Create download link
                    const url = URL.createObjectURL(blob);
                    setRecordingLink(url);

                    // Upload if your server is ready
                    uploadRecording(chunks);
                }

                // Close audio context used for recording
                if (audioContext && audioContext.state !== 'closed') {
                    audioContext.close().catch(e => console.error("Error closing audio context:", e));
                }
            };

            // Start recording with 1-second data chunks
            recorder.start(1000);
            setMediaRecorder(recorder);
            setIsRecording(true);
            console.log("Recording started with background audio");
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Failed to start recording: " + error.message);
        }
    };

//21/3

// const startRecording = async (videoStream, audioStream, backgroundAudioStream) => {
//     try {
//         // Create audio mixer for multiple audio sources
//         const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         const audioDestination = audioContext.createMediaStreamDestination();

//         // Get all video tracks from the screen capture
//         const videoTracks = videoStream.getVideoTracks();

//         // Get microphone audio track if available
//         const micTracks = audioStream.getAudioTracks();
//         if (micTracks.length > 0) {
//             console.log("Adding microphone audio to recording");
//             const micSource = audioContext.createMediaStreamSource(new MediaStream([micTracks[0]]));
//             micSource.connect(audioDestination);
//         }

//         // Add background audio track if available
//         if (backgroundAudioStream && backgroundAudioStream.getAudioTracks().length > 0) {
//             console.log("Adding background audio to recording mixer");
//             const backgroundSource = audioContext.createMediaStreamSource(backgroundAudioStream);
//             backgroundSource.connect(audioDestination);
//         } else {
//             console.warn("No background audio tracks available for recording");
//         }

//         // Create a combined stream with video track and mixed audio
//         const combinedTracks = [
//             ...videoTracks,
//             ...audioDestination.stream.getAudioTracks()
//         ];

//         // Log all tracks being used for recording
//         console.log(`Recording with ${combinedTracks.length} tracks:`);
//         combinedTracks.forEach((track, index) => {
//             console.log(`Track ${index}: ${track.kind} - ${track.readyState} - ${track.label}`);
//         });

//         const combinedStream = new MediaStream(combinedTracks);

//         // Set up media recorder with appropriate options based on browser support
//         let options;
        
//         // Detect Safari
//         const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
//             (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'));
            
//         if (isSafari) {
//             // Try different MIME types that Safari might support
//             const mimeTypes = [
//                 'video/mp4',
//                 'video/quicktime',
//                 'video/webm',
//                 'video/webm;codecs=h264',
//                 ''  // Empty string will use browser default
//             ];
            
//             // Find the first supported MIME type
//             let supportedMimeType = '';
//             for (const type of mimeTypes) {
//                 if (type && MediaRecorder.isTypeSupported(type)) {
//                     supportedMimeType = type;
//                     console.log(`Safari supports MIME type: ${supportedMimeType}`);
//                     break;
//                 }
//             }
            
//             options = supportedMimeType ? { mimeType: supportedMimeType } : {};
//             console.log(`Using recorder options for Safari:`, options);
//         } else {
//             // For Chrome, Firefox, Edge etc.
//             options = {
//                 mimeType: 'video/webm;codecs=vp9',
//                 videoBitsPerSecond: 3000000, // 3 Mbps
//                 audioBitsPerSecond: 128000   // 128 kbps for audio
//             };
//             console.log(`Using recorder options for non-Safari:`, options);
//         }

//         const recorder = new MediaRecorder(combinedStream, options);
//         let chunks = [];

//         recorder.ondataavailable = (event) => {
//             if (event.data.size > 0) {
//                 chunks.push(event.data);
//                 console.log("Recording data available, chunk size:", event.data.size);
//             }
//         };

//         recorder.onstop = () => {
//             console.log("Recorder stopped, creating file from chunks:", chunks.length);

//             if (chunks.length > 0) {
//                 // Determine the correct MIME type for the blob
//                 let blobType = "video/webm";
//                 if (isSafari) {
//                     blobType = recorder.mimeType || "video/mp4";
//                 }
                
//                 const blob = new Blob(chunks, { type: blobType });
//                 setRecordedChunks(chunks);

//                 // Create download link
//                 const url = URL.createObjectURL(blob);
//                 setRecordingLink(url);

//                 // Upload if your server is ready
//                 uploadRecording(chunks);
//             }

//             // Close audio context used for recording
//             if (audioContext && audioContext.state !== 'closed') {
//                 audioContext.close().catch(e => console.error("Error closing audio context:", e));
//             }
//         };

//         // Start recording with 1-second data chunks
//         recorder.start(1000);
//         setMediaRecorder(recorder);
//         setIsRecording(true);
//         console.log("Recording started with background audio");
//     } catch (error) {
//         console.error("Error starting recording:", error);
//         alert("Failed to start recording: " + error.message);
//     }
// };

    const joinChannel = async () => {
        try {
            await client.join(appId, channel, token, uid);

            // Create audio track
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);

            // Create camera video track
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            setLocalVideoTrack(videoTrack);

            // Publish audio and camera tracks
            await client.publish([audioTrack, videoTrack]);

            // Show local video
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
    
    // 19/3 final 
    const startScreenSharing = async () => {
        try {
            console.log("Starting screen sharing...");

            // Detect Safari more reliably
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
                (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'));
            console.log("Browser detected as Safari:", isSafari);
            

            //21/3
            if (isSafari) {
                try {
                    // Create screen video track with minimal configuration for Safari
                    const screenTrack = await AgoraRTC.createScreenVideoTrack({
                        encoderConfig: "1080p_1",  // Set the resolution to 1080p
                    }, "disable");  // "disable" to avoid creating audio track together with screen video track
            
                    // Unpublish the camera track before starting screen sharing
                    if (localVideoTrack) {
                        console.log("Unpublishing camera track before screen sharing");
                        await client.unpublish(localVideoTrack);
                    }
            
                    // Set the local screen track to the state
                    setLocalScreenTrack(screenTrack);
            
                    // Publish the screen track
                    console.log("Publishing screen track");
                    await client.publish(screenTrack);
            
                    // Play the screen track in the screen container
                    if (screenContainerRef.current) {
                        screenContainerRef.current.innerHTML = "";
                        screenTrack.play(screenContainerRef.current);
                    }
            
                    // Even though the camera track is unpublished, we can still show the local video
                    if (localVideoTrack && videoContainerRef.current) {
                        localVideoTrack.play(videoContainerRef.current);
                    }
            
                    // Start the background audio - must be started before recording
                    console.log("Starting background audio for recording");
                    const backgroundAudioStream = await startBackgroundAudio();
            
                    // Wait a moment to ensure background audio is playing
                    await new Promise(resolve => setTimeout(resolve, 500));
            
                    // Get the screen video stream from the screen track
                    const screenMediaTrack = screenTrack.getMediaStreamTrack();
                    const screenStream = new MediaStream([screenMediaTrack]);
            
                    // Get the microphone audio stream if it's available
                    const micStream = new MediaStream([localAudioTrack.getMediaStreamTrack()]);
            
                    // Start recording with all streams: screen, microphone, and background audio
                    console.log("Starting recording with background audio");
                    startRecording(screenStream, micStream, backgroundAudioStream);
            
                    // Update state to indicate screen sharing has started
                    setIsScreenSharing(true);
                    console.log("Screen sharing started!");
            
                    // Handle when screen sharing ends
                    screenTrack.on("track-ended", () => {
                        console.log("Screen track ended event received");
                        stopScreenSharing();
                    });
            
                } catch (error) {
                    console.error("Error during screen sharing process:", error);
                }
            }            
            else {
                // Non-Safari browsers (Chrome, Edge, etc.)
                console.log("Using configuration for non-Safari browsers");

                // Create screen track with enhanced configuration for other browsers
                const screenTrackConfig = {
                    encoderConfig: "1080p_1",
                    screenSourceType: "screen",
                    screenConfig: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: null,
                            minWidth: 1920,
                            maxWidth: 1920,
                            minHeight: 1080,
                            maxHeight: 1080
                        },
                        displaySurface: "monitor",
                        logicalSurface: false,
                        cursor: "always",
                        updateInterval: 100
                    }
                };

                console.log("Creating screen track with configuration:", screenTrackConfig);
                const screenTrack = await AgoraRTC.createScreenVideoTrack(screenTrackConfig);

                // Unpublish camera track
                if (localVideoTrack) {
                    console.log("Unpublishing camera track before screen sharing");
                    await client.unpublish(localVideoTrack);
                }

                setLocalScreenTrack(screenTrack);

                // Publish screen track
                console.log("Publishing screen track");
                await client.publish(screenTrack);

                // Show screen track in the container
                if (screenContainerRef.current) {
                    screenContainerRef.current.innerHTML = "";
                    screenTrack.play(screenContainerRef.current);
                }

                // Even though we unpublished camera track, we can still show it locally
                if (localVideoTrack && videoContainerRef.current) {
                    localVideoTrack.play(videoContainerRef.current);
                }

                // Start the background audio - MUST be started before recording
                console.log("Starting background audio for recording");
                const backgroundAudioStream = await startBackgroundAudio();

                // Wait a moment to ensure background audio is playing
                await new Promise(resolve => setTimeout(resolve, 500));

                // Get the screen video stream
                const screenMediaTrack = screenTrack.getMediaStreamTrack();

                // Apply constraints for better quality
                if (screenMediaTrack.applyConstraints) {
                    try {
                        await screenMediaTrack.applyConstraints({
                            width: { ideal: window.screen.width },
                            height: { ideal: window.screen.height },
                            frameRate: { ideal: 30 }
                        });
                        console.log("Applied additional constraints to screen track");
                    } catch (constraintError) {
                        console.warn("Could not apply additional constraints:", constraintError);
                    }
                }

                const screenStream = new MediaStream([screenMediaTrack]);

                // Get the microphone audio stream
                const micStream = new MediaStream([localAudioTrack.getMediaStreamTrack()]);

                // Start recording with all sources
                console.log("Starting recording with background audio");
                startRecording(screenStream, micStream, backgroundAudioStream);

                setIsScreenSharing(true);
                console.log("Screen sharing started!");

                // Handle when screen sharing stops
                screenTrack.on("track-ended", () => {
                    console.log("Screen track ended event received");
                    stopScreenSharing();
                });
            }
        } catch (error) {
            console.error("Error starting screen sharing:", error);
            alert("Failed to start screen sharing: " + error.message);

            // If screen sharing fails, republish camera track
            if (localVideoTrack) {
                try {
                    console.log("Republishing camera track after screen sharing failure");
                    await client.publish(localVideoTrack);
                } catch (pubError) {
                    console.error("Error republishing camera:", pubError);
                }
            }

            // Also stop background audio if it started
            stopBackgroundAudio();
        }
    };

    const stopScreenSharing = async () => {
        console.log("Stopping screen sharing...");
        try {
            // Stop background audio
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

            // Show Download button
            if (recordedChunks.length > 0) {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                setRecordingLink(URL.createObjectURL(blob));
            }

            console.log("Screen sharing stopped successfully!");
        } catch (error) {
            console.error("Error stopping screen sharing:", error);
            alert("Error stopping screen sharing: " + error.message);

            // Make sure audio stops even if there's an error
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
            console.log("Left the channel.");
            setJoinState(false);

            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }

            // Hide Download button when Camera Off is clicked
            setRecordingLink(null);

            // Make sure audio is stopped
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


    //21/3

    // const uploadRecording = async (chunks) => {
    //     try {
    //         // Detect Safari
    //         const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    //             (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'));
                
    //         // Use the appropriate MIME type
    //         const blobType = isSafari ? "video/mp4" : "video/webm";
    //         const fileExtension = isSafari ? "mp4" : "webm";
            
    //         const blob = new Blob(chunks, { type: blobType });
    //         const formData = new FormData();
    //         formData.append("video", blob, `recording.${fileExtension}`);
    
    //         const response = await fetch("http://localhost:9000/api/videos/upload", {
    //             method: "POST",
    //             body: formData,
    //         });
    
    //         if (response.ok) {
    //             console.log("Video uploaded successfully");
    //         } else {
    //             console.error("Video upload failed");
    //         }
    //     } catch (error) {
    //         console.error("Error uploading video:", error);
    //     }
    // };
    
    // const downloadRecording = () => {
    //     if (recordedChunks.length > 0) {
    //         // Detect Safari
    //         const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    //             (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'));
                
    //         // Use the appropriate MIME type
    //         const blobType = isSafari ? "video/mp4" : "video/webm";
    //         const fileExtension = isSafari ? "mp4" : "webm";
            
    //         const blob = new Blob(recordedChunks, { type: blobType });
    //         const url = URL.createObjectURL(blob);
    //         const a = document.createElement("a");
    //         document.body.appendChild(a);
    //         a.style.display = "none";
    //         a.href = url;
    //         a.download = `screen-recording-${new Date().toISOString()}.${fileExtension}`;
    //         a.click();
    //         window.URL.revokeObjectURL(url);
    //         document.body.removeChild(a);
    //     }
    // };


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
                    <Button
                        variant="warning"
                        onClick={stopScreenSharing}
                        disabled={!isScreenSharing}
                        style={{ fontWeight: 'bold' }}
                    >
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
                    {/* Camera feed - always visible */}
                    <Col md={8}>
                        <div className="rounded bg-dark border mt-3 mb-3">
                            {/* <h5>Camera</h5> */}
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

