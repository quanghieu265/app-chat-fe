import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
const mime = 'video/mp4; codecs="mp4a.40.2,avc1.64001f"';
const muxjs = require("mux.js");
let videoSegment = 0;
let transmuxer = new muxjs.mp4.Transmuxer();
let mediaSource: MediaSource;

const StreamOnlinePage: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const host =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://quanghieu265-app-chat.onrender.com";
    socket = io(host);

    socket.on("connect", () => {});

    socket.on("send-stream-to-client", (stream: any) => {
      transmuxer.push(new Uint8Array(stream));
      transmuxer.flush();
      if (!stream && mediaSource.readyState) {
        videoSegment = 0;
        mediaSource.endOfStream();
        transmuxer.off("data");
      }
    });
  }, []);

  useEffect(() => {
    if (open) {
      const video = document.getElementById("stream") as HTMLVideoElement;
      if (video !== null) {
        mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener("sourceopen", () => {
          URL.revokeObjectURL(video.src);
          let sourceBuffer = mediaSource.addSourceBuffer(mime);
          sourceBuffer.addEventListener("updateend", () => {
            transmuxer.off("data");
            transmuxer.on("data", (segment: any) => {
              let nextStream = new Uint8Array(segment.data.length);
              nextStream.set(segment.data, 0);
              sourceBuffer.appendBuffer(nextStream);
            });
            videoSegment++;
            socket.emit("get-stream", videoSegment);
          });

          transmuxer.on("data", (segment: any) => {
            let data = new Uint8Array(
              segment.initSegment.byteLength + segment.data.byteLength
            );
            data.set(segment.initSegment, 0);
            data.set(segment.data, segment.initSegment.byteLength);
            sourceBuffer.appendBuffer(data);
          });
        });
        socket.emit("get-stream", videoSegment);
      }
    }
  }, [open]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Checkbox
        onChange={(e) => {
          setOpen(e.target.checked);
        }}
      >
        Open Video
      </Checkbox>

      <div style={{ height: 500, display: "flex" }}>
        {open && (
          <video
            style={{ width: "100%" }}
            autoPlay
            controls
            muted
            id="stream"
            preload="false"
          ></video>
        )}
      </div>
    </div>
  );
};

export default StreamOnlinePage;
