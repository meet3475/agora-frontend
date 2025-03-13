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

import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState, useRef } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import QuestionDisplay from "../QuestionDisplay/QuestionDisplay";

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
        };
    }, []);

    const startRecording = async (stream) => {
        try {
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 3000000 // 3 Mbps
            };

            const recorder = new MediaRecorder(stream, options);
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

                    // Create download link but don't auto-download
                    const url = URL.createObjectURL(blob);
                    setRecordingLink(url);

                    // Note: Auto-download code removed from here

                    // Upload if your server is ready
                    uploadRecording(chunks);
                }
            };

            // Set up data collection at 1-second intervals
            recorder.start(1000);
            setMediaRecorder(recorder);
            setIsRecording(true);
            console.log("Recording started");
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Failed to start recording: " + error.message);
        }
    };

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

    const startScreenSharing = async () => {
        try {
            console.log("Starting screen sharing...");

            // First, unpublish the camera track to avoid the multiple video tracks error
            if (localVideoTrack) {
                console.log("Unpublishing camera track before screen sharing");
                await client.unpublish(localVideoTrack);
                // Don't stop or close the camera track, just keep it for later
            }

            // Create screen track
            console.log("Creating screen track");
            const screenTrack = await AgoraRTC.createScreenVideoTrack({
                encoderConfig: "1080p_1",
                screenSourceType: "screen"
            });

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

            // Start recording with screen and audio
            const stream = new MediaStream([
                screenTrack.getMediaStreamTrack(),
                localAudioTrack.getMediaStreamTrack()
            ]);
            startRecording(stream);

            setIsScreenSharing(true);
            console.log("Screen sharing started!");

            // Handle when screen sharing stops
            screenTrack.on("track-ended", () => {
                console.log("Screen track ended event received");
                stopScreenSharing();
            });

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
        }
    };

    const stopScreenSharing = async () => {
        console.log("Stopping screen sharing...");
        try {
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
                        {/* Join Channel */}
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
                        style={{ fontWeight: 'bold' }} // Make it more visible
                    >
                        Stop Screen Sharing
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="danger" onClick={leaveChannel} disabled={!joinState}>
                        {/* Leave Channel */}
                        Camera Off
                    </Button>
                </Col>
                {/* {recordingLink && (
                    <Col xs="auto">
                        <Button variant="success" onClick={downloadRecording}>
                            Download Recording
                        </Button>
                    </Col>
                )} */}

                {recordingLink && isScreenSharing === false && (
                    <Col xs="auto">
                        <Button variant="success" onClick={downloadRecording}>
                            Download Recording
                        </Button>
                    </Col>
                )}
            </Row>

            <div className="mt-4 text-center">
                {/* {joinState && <p className="text-success">Connected to channel!</p>}
                {isScreenSharing && <p className="text-info">Screen sharing active</p>}
                {isRecording && <p className="text-danger">Recording in progress...</p>} */}

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
