import {
  CopyOutlined,
  LoadingOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { Button, Col, Input, Modal, Row, Spin } from "antd";
import { memo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "src/app/redux/store";
import { DefaultEventsMap } from "@socket.io/component-emitter";

import "./style.scss";
import { openNotification } from "@/app/layout/notification";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
let myPeerConnection: RTCPeerConnection | null;
let webcamStream: MediaStream | null;

// Flow component: https://fireship.io/lessons/webrtc-firebase-video-chat/
// 1: handleMakeCall - Make a call to other user
// 2: handleReceiveOffer - Handle an offer from other user
// 3: if Accept offer = handleAnswerOffer ; if decline offer = handleDeclineOffer
// 4: handleHangUpCall - Handle hang up call

function VideoCallPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [disabled, setDisabled] = useState(false);
  const [localUser, setLocalUser] = useState({
    name: user.username,
    id: ""
  });
  const [remoteUser, setRemoteUser] = useState({ name: "", id: "" });
  const [openComingCall, setOpenComingCall] = useState(false);
  const [openMakeCall, setOpenMakeCall] = useState(false);

  const [playVideo, setPlayVideo] = useState(true);
  const [playAudio, setPlayAudio] = useState(true);

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  // ----------------- Flow ------------------------

  // Handle a click make call button.
  // Calling RTCPeerConnection.addTrack() trigger
  // a |negotiationneeded| event, so we'll let our handler for that make the offer.
  const handleMakeCall = async () => {
    // Starting to prepare an invitation
    if (myPeerConnection) {
      openNotification(
        "error",
        "You can't start a call because you already have one open!"
      );
    } else {
      // Don't allow users to call themselves, because weird.
      if (localUser.id === remoteUser.id) {
        openNotification(
          "error",
          "I'm afraid I can't let you talk to yourself."
        );
        return;
      }

      if (!remoteUser.id) {
        openNotification("error", "Please input user's ID");
        return;
      }

      // Call createPeerConnection() to create the RTCPeerConnection.
      // When this returns, myPeerConnection is our RTCPeerConnection
      // and webcamStream is a stream coming from the camera.
      // They are not linked together in any way yet.

      // Setting up connection to invite user
      handleCreatePeerConnection();

      // Get access to the webcam stream and attach it to the localVideo
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (localVideo.current) {
          localVideo.current.srcObject = webcamStream;
        }
      } catch (err) {
        handleGetUserMediaError(err);
        return;
      }

      // Add the tracks from the stream to the RTCPeerConnection
      try {
        webcamStream.getTracks().forEach(track => {
          if (webcamStream && myPeerConnection) {
            myPeerConnection.addTrack(track, webcamStream);
          }
        });
      } catch (err) {
        handleGetUserMediaError(err);
      }
    }

    // handle ui
    setOpenMakeCall(true);
  };

  // Accept an offer to video chat. We configure our local settings,
  // create our RTCPeerConnection, get and attach our local camera
  // stream, then create and send an answer to the caller.
  const handleReceiveOffer = async (data: any) => {
    // If we're not already connected, create an RTCPeerConnection
    // to be linked to the caller.
    // Received video chat offer from
    if (!myPeerConnection) {
      handleCreatePeerConnection();
    }

    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.
    const offerDescription = new RTCSessionDescription(data.offer);

    // If the connection isn't stable yet, wait for it...
    if (myPeerConnection) {
      if (myPeerConnection.signalingState !== "stable") {
        //  But the signaling state isn't stable, so triggering rollback
        // Set the local and remove descriptions for rollback; don't proceed
        // until both return.
        await Promise.all([
          myPeerConnection.setLocalDescription({ type: "rollback" }),
          myPeerConnection.setRemoteDescription(offerDescription)
        ]);
        return;
      } else {
        //  Setting remote description
        await myPeerConnection.setRemoteDescription(offerDescription);
        // enable the button answer
        setOpenComingCall(true);
        setRemoteUser(data.signalFrom);
      }
    }
  };

  //create an answer for an offer
  const handleAnswerOffer = async () => {
    // Get the webcam stream if we don't already have it
    if (!webcamStream) {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (err) {
        handleGetUserMediaError(err);
        return;
      }
      if (localVideo.current) {
        localVideo.current.srcObject = webcamStream;
      }
    }
    // Add the camera stream to the RTCPeerConnection
    try {
      webcamStream.getTracks().forEach(track => {
        if (webcamStream && myPeerConnection) {
          myPeerConnection.addTrack(track, webcamStream);
        }
      });
    } catch (err) {
      handleGetUserMediaError(err);
    }

    if (!myPeerConnection) return;
    // Creating and sending answer to caller
    const answerDescription = await myPeerConnection.createAnswer();
    await myPeerConnection.setLocalDescription(answerDescription);
    socket.emit("send-answer", {
      signalTo: remoteUser.id,
      answer: answerDescription,
      signalFrom: localUser
    });
    // handle UI
    setDisabled(true);
    setRemoteUser({ ...remoteUser, id: remoteUser.id });
  };

  // Responds to the "send-answer" message sent to the caller
  // once the callee has decided to accept our request to talk.
  const handleReceiveAnswer = async (data: any) => {
    if (myPeerConnection) {
      // Call recipient has accepted our call
      // Configure the remote description
      await myPeerConnection
        .setRemoteDescription(data.answer)
        .catch(reportError);
      setOpenMakeCall(false);
      setDisabled(true);
    }
    setRemoteUser(data.signalFrom);
  };

  // Hang up the call by closing our end of the connection, then
  // sending a "send-ended" message to the other peer (keep in mind that
  // the signaling is done on a different connection). This notifies
  // the other peer that the connection should be terminated and the UI
  const handleHangUpCall = () => {
    closeVideoCall();
    socket.emit("send-ended", { signalTo: remoteUser.id });
  };

  // ------------------ Event handlers --------------------------------

  // Create the RTCPeerConnection which knows how to talk to our
  // selected STUN/TURN server and then uses getUserMedia() to find
  // our camera and microphone and add that stream to the connection for
  // use in our video call. Then we configure event handlers to get
  // needed notifications on the call.
  const handleCreatePeerConnection = async () => {
    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.
    const configuration = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302"
          ]
        }
      ]
    };

    myPeerConnection = new RTCPeerConnection(configuration);

    // Set up event handlers for the ICE negotiation process.

    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.oniceconnectionstatechange =
      handleICEConnectionStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.ontrack = handleTrackEvent;
  };

  // Called by the WebRTC layer to let us know when it's time to
  // begin, resume, or restart ICE negotiation.
  // Trigger by Calling RTCPeerConnection.addTrack() or removeTrack()
  const handleNegotiationNeededEvent = async (event: any) => {
    // *** Negotiation needed"
    try {
      if (!myPeerConnection) return;
      // ---> Creating offer"
      const offerDescription = await myPeerConnection.createOffer();

      // If the connection hasn't yet achieved the "stable" state,
      // return to the caller. Another negotiationneeded event
      // will be fired when the state stabilizes.
      if (myPeerConnection.signalingState !== "stable") {
        // -- The connection isn't stable yet; postponing...
        return;
      }

      // Establish the offer as the local peer's current description.
      // ---> Setting local description to the offer
      await myPeerConnection.setLocalDescription(offerDescription);

      // Send the offer to the remote peer.
      socket.emit("send-offer", {
        signalTo: remoteUser.id,
        offer: offerDescription,
        signalFrom: localUser
      });
    } catch (err) {
      handleError(err);
    }
  };

  // Called by the WebRTC layer when events occur on the media tracks
  // on our WebRTC call. This includes when streams are added to and
  // removed from the call.
  // In our case, we're just taking the first stream found and attaching
  // it to the <video> element for incoming media.
  function handleTrackEvent(event: any) {
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = event.streams[0];
    }
  }

  // Forwarding the specified ICE candidate (created by our local ICE agent)
  // to the other peer through the signaling server.
  // Run when setLocalDescription added
  const handleICECandidateEvent = (event: { candidate: any }) => {
    event.candidate &&
      socket.emit("send-ice", {
        signalTo: remoteUser.id,
        ice: event.candidate
      });
  };

  // Handle |iceconnectionstatechange| events.
  // This will detect when the ICE connection is closed, failed, or disconnected.
  const handleICEConnectionStateChangeEvent = () => {
    if (myPeerConnection) {
      switch (myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
          closeVideoCall();
          break;
      }
    }
  };

  // Set up a |signalingstatechange| event handler. This will detect when
  // the signaling connection is closed.
  const handleSignalingStateChangeEvent = () => {
    if (myPeerConnection) {
      switch (myPeerConnection.signalingState) {
        case "closed":
          closeVideoCall();
          break;
      }
    }
  };

  // Close the RTCPeerConnection and reset variables so that the user can
  // make or receive another call if they wish. This is called both
  // when the user hangs up, the other user hangs up, or if a connection
  // failure is detected.
  const closeVideoCall = () => {
    // Close the RTCPeerConnection
    if (myPeerConnection) {
      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.
      myPeerConnection.ontrack = null;
      myPeerConnection.onicecandidate = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnegotiationneeded = null;

      // Stop all transceivers on the connection
      myPeerConnection.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });

      if (remoteVideo.current && remoteVideo.current.srcObject) {
        remoteVideo.current.srcObject = null;
      }

      if (localVideo.current && localVideo.current.srcObject) {
        localVideo.current.srcObject = null;
      }

      // Close the peer connection
      myPeerConnection.close();
      myPeerConnection = null;
      webcamStream = null;

      // handle reset UI
      setOpenComingCall(false);
      setOpenMakeCall(false);
      setDisabled(false);
      setRemoteUser({ ...remoteUser, name: "" });
    }
  };

  // Handle errors which occur when trying to access the local media
  const handleGetUserMediaError = (e: any) => {
    switch (e.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone" +
            "were found."
        );
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + e.message);
        break;
    }

    // Make sure we shut down our end of the RTCPeerConnection so we're
    // ready to try again.

    closeVideoCall();
  };

  // When we got an ice candidate from a other user
  // Call RTCPeerConnection.addIceCandidate() to send it along to the local ICE framework.
  const handleNewICECandidate = async (
    data: RTCIceCandidateInit | undefined
  ) => {
    let candidate = new RTCIceCandidate(data);

    try {
      // add receive ICE
      if (myPeerConnection) {
        await myPeerConnection.addIceCandidate(candidate);
      }
    } catch (err) {
      handleError(err);
    }
  };

  // Handles reporting errors.
  function handleError(errMessage: any) {
    return openNotification(
      "error",
      `Error ${errMessage.name}: ${errMessage.message}`
    );
  }

  // Handle turn on/off camera when calling
  const handleToggleCamera = (type: string, status: boolean) => {
    // // handle remove video track from peer
    let senderList = myPeerConnection?.getSenders() || [];
    senderList.forEach(sender => {
      if (sender?.track?.kind === type) {
        sender.track.enabled = status;
      }
    });
    if (type === "video") setPlayVideo(!playVideo);
    setPlayAudio(!playAudio);
  };

  useEffect(() => {
    const host =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://quanghieu265-app-chat.onrender.com";
    socket = io(host);

    socket.on("connect", () => {
      setLocalUser({ ...localUser, id: socket.id });
    });

    socket.on("receive-offer", offer => {
      handleReceiveOffer(offer);
    });

    socket.on("receive-answer", answer => {
      handleReceiveAnswer(answer);
    });

    socket.on("receive-ice", ice => {
      handleNewICECandidate(ice);
    });

    socket.on("receive-ended", () => {
      closeVideoCall();
    });

    return () => {
      socket.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="video-container">
        <Row gutter={16}>
          {/* local container */}
          <Col span={12}>
            <div className="video-card">
              <p>{localUser.name}</p>
              <video
                ref={localVideo}
                autoPlay
                controls
                muted
                id="local-video"
                preload="false"
              ></video>
            </div>
            <div className="video-info">
              <div>
                <Input
                  value={localUser.id}
                  disabled={true}
                  bordered={false}
                ></Input>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    if (localUser) {
                      navigator.clipboard.writeText(localUser.id);
                    }
                  }}
                >
                  COPY YOUR ID
                </Button>
              </div>

              <div>
                <Input
                  value={remoteUser.id}
                  onChange={e => {
                    setRemoteUser({ ...remoteUser, id: e.target.value });
                  }}
                  disabled={disabled}
                  bordered={false}
                  placeholder="Input user's ID"
                ></Input>
                {disabled ? (
                  <Button icon={<PhoneOutlined />} onClick={handleHangUpCall}>
                    Hang Up
                  </Button>
                ) : (
                  <Button icon={<PhoneOutlined />} onClick={handleMakeCall}>
                    Call
                  </Button>
                )}
              </div>
              <Button
                onClick={() => {
                  handleToggleCamera("video", !playVideo);
                }}
              >
                {playVideo ? "Hide" : "Show"} webcam
              </Button>
              <Button
                onClick={() => {
                  handleToggleCamera("audio", !playAudio);
                }}
              >
                {playAudio ? "Mute" : "Unmute"} voice
              </Button>
            </div>
          </Col>

          {/* remote container */}
          <Col span={12}>
            <div className="video-card">
              <p>Remote User: {remoteUser.name}</p>
              <video
                ref={remoteVideo}
                autoPlay
                controls
                muted
                id="local-video"
                preload="false"
              ></video>
            </div>
          </Col>
        </Row>
      </div>
      {/* Modal coming call */}
      <Modal
        maskClosable={false}
        title={`${remoteUser.name} calling ....`}
        centered
        open={openComingCall}
        onCancel={handleHangUpCall}
        footer={[
          <Button key="cancel-coming" onClick={handleHangUpCall}>
            Cancel
          </Button>,
          <Button
            type="primary"
            key="answer"
            onClick={() => {
              handleAnswerOffer();
              setOpenComingCall(false);
            }}
          >
            Answer
          </Button>
        ]}
      >
        <Spin
          style={{ display: "flex", justifyContent: "center" }}
          indicator={<LoadingOutlined />}
        />
      </Modal>

      {/* Modal make call */}
      <Modal
        maskClosable={false}
        title={`Calling ${remoteUser.id} ....`}
        centered
        open={openMakeCall}
        onCancel={handleHangUpCall}
        footer={[
          <Button key="cancel-call" onClick={handleHangUpCall}>
            Cancel
          </Button>
        ]}
      >
        <Spin
          style={{ display: "flex", justifyContent: "center" }}
          indicator={<LoadingOutlined />}
        />
      </Modal>
    </>
  );
}

export default memo(VideoCallPage);
