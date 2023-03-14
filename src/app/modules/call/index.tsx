import { CopyOutlined, PhoneOutlined } from "@ant-design/icons";
import { Button, Col, Input, Modal, Row } from "antd";
import { memo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "src/app/redux/store";
import { DefaultEventsMap } from "@socket.io/component-emitter";

import "./style.scss";
import { openNotification } from "@/app/layout/notification";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
let myPeerConnect: RTCPeerConnection;
let videoTrack: RTCRtpSender;

// Flow component: https://fireship.io/lessons/webrtc-firebase-video-chat/
// 1: Thiết lập peer connection giữ local và remote:
// + local: lấy luồng stream từ cam và add vào peer
// + remote: Initialize a remote video feed with an empty stream.
// + Thiết lập cổng trao đổi ICE
// + Thiết lập cổng trao đổi stream
// 2: Khởi tạo offer:
// + Gửi offerDescription cho other user qua socket hoặc lưu ở DB cho remote tự vào lấy
// 3: Khi nhận offer :
// + Add offerDescription vào setRemoteDescription
// + Tạo answerDescription và add answer vào setLocalDescription, rồi gửi qua socket
// 4: Khi nhận được answer:
// + Add answerDescription vào setRemoteDescription

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

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const handleSetupPeer = async () => {
    // Set up peer connection between local and remote
    // ------------------------------------------------------
    //getting local video stream
    let localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    //displaying local video stream on the page
    if (localVideo.current) {
      localVideo.current.srcObject = localStream;
    }

    //using Google public stun server
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

    // create peer connection
    myPeerConnect = new RTCPeerConnection(configuration);

    // Push tracks(audioTrack and videoTrack) from local stream to peer connection
    localStream.getTracks().forEach(track => {
      myPeerConnect.addTrack(track, localStream);
    });

    // Initialize a remote video feed with an empty stream
    let remoteStream = new MediaStream();

    //Thiết lập sự kiện lắng nghe
    //Run when a remote user adds track to the peer connection
    myPeerConnect.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    };
  };

  // Local user
  const handleMakeCall = async () => {
    if (!!!remoteUser.id) {
      return openNotification("error", "Not found remote id");
    }
    // Setup ICE handling , Run when setLocalDescription added
    myPeerConnect.onicecandidate = event => {
      event.candidate &&
        socket.emit("send-ice", {
          signalTo: remoteUser.id,
          ice: event.candidate
        });
    };
    // Create offer
    const offerDescription = await myPeerConnect.createOffer();
    if (offerDescription) {
      await myPeerConnect.setLocalDescription(offerDescription);
      socket.emit("send-offer", {
        signalTo: remoteUser.id,
        offer: offerDescription,
        signalFrom: localUser
      });
    }
    setDisabled(true);
    setOpenMakeCall(true);
  };

  // Local user
  //when we got an answer from a remote user
  const handleReceiveAnswer = async (data: {
    answer: RTCSessionDescriptionInit;
  }) => {
    myPeerConnect.setRemoteDescription(data.answer);
    setOpenMakeCall(false);
  };

  // Remote user
  //when somebody sends us an offer
  const handleReceiveOffer = (data: any) => {
    // add the offer description from socket
    if (!myPeerConnect.currentRemoteDescription && data?.offer) {
      const offerDescription = new RTCSessionDescription(data.offer);
      myPeerConnect.setRemoteDescription(offerDescription);
    }
    // enable the button answer
    setOpenComingCall(true);
    setRemoteUser(data.signalFrom);
  };

  // Remote user
  //create an answer to an offer
  const handleAnswer = async () => {
    const answerDescription = await myPeerConnect.createAnswer();
    await myPeerConnect.setLocalDescription(answerDescription);
    socket.emit("send-answer", {
      signalTo: remoteUser.id,
      answer: answerDescription,
      signalFrom: localUser
    });

    // handle UI
    setDisabled(true);
    setRemoteUser({ ...remoteUser, id: remoteUser.id });
  };

  //when we got an ice candidate from a remote user
  const handleICE = (data: RTCIceCandidateInit | undefined) => {
    // add receive ICE
    myPeerConnect.addIceCandidate(new RTCIceCandidate(data));
  };

  const handleCloseCall = () => {
    if (myPeerConnect) {
      myPeerConnect.close();
      myPeerConnect.onicecandidate = null;
    }
    if (remoteVideo.current && remoteVideo.current.srcObject) {
      remoteVideo.current.srcObject = null;
      socket.emit("send-ended", { signalTo: remoteUser.id });
    }

    // handle UI
    setDisabled(false);
  };

  const handleToggleCamera = (type: string, status: string) => {
    let camera = type === "local" ? localVideo : remoteVideo;
    if (status === "off") {
      // handle on local video
      if (camera.current) {
        const stream = camera.current.srcObject as MediaStream;
        const tracks = stream.getVideoTracks();

        tracks.forEach(track => {
          track.stop();
        });
      }
      // handle on remote video

      return;
    } else {
    }
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
      handleICE(ice);
    });

    socket.on("receive-ended", () => {
      handleCloseCall();
    });

    return () => {
      socket.off();
    };
  }, []);

  useEffect(() => {
    handleSetupPeer();
  }, []);

  return (
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
            <Button
              onClick={() => {
                handleToggleCamera("local", "on");
              }}
            >
              Show webcam
            </Button>
            <Button
              onClick={() => {
                handleToggleCamera("local", "off");
              }}
            >
              Turn off webcam
            </Button>
          </div>
          <div className="video-info">
            <div>
              <p>Account info</p>
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
          </div>
        </Col>

        {/* remote container */}
        <Col span={12}>
          <div className="video-card">
            <p>Remote User:</p>
            <video
              ref={remoteVideo}
              autoPlay
              controls
              muted
              id="local-video"
              preload="false"
            ></video>
          </div>
          <div className="video-info">
            <div>
              <p>Make a call</p>
              <Input
                value={remoteUser.id}
                onChange={e => {
                  setRemoteUser({ ...remoteUser, id: e.target.value });
                }}
                disabled={disabled}
                bordered={false}
                placeholder="ID to call"
              ></Input>
              {disabled ? (
                <Button icon={<PhoneOutlined />} onClick={handleCloseCall}>
                  Hang Up
                </Button>
              ) : (
                <Button icon={<PhoneOutlined />} onClick={handleMakeCall}>
                  Call
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
      {/* Modal coming call */}
      <Modal
        title={`${remoteUser.name} calling ....`}
        centered
        open={openComingCall}
        onCancel={() => setOpenComingCall(false)}
        footer={[
          <Button
            onClick={() => {
              handleAnswer();
              setOpenComingCall(false);
            }}
          >
            Answer
          </Button>,
          <Button
            onClick={() => {
              setOpenComingCall(false);
            }}
          >
            Cancel
          </Button>
        ]}
      ></Modal>

      {/* Modal make call */}
      <Modal
        title={`Calling ${remoteUser.id} ....`}
        centered
        open={openMakeCall}
        onCancel={() => setOpenMakeCall(false)}
        footer={[
          <Button
            onClick={() => {
              setOpenMakeCall(false);
            }}
          >
            Cancel
          </Button>
        ]}
      ></Modal>
    </div>
  );
}

export default memo(VideoCallPage);
