import services from "@/app/services";
import { Col, Row } from "antd";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const StreamWatchPage = () => {
  let [searchParams] = useSearchParams();
  let id = searchParams.get("id");
  const videoRef: any = useRef(null);

  const getVideoUrlById = async (id: string) => {
    const res = await services.Playlist.getVideoById(id);
    if (res.status === 200 && res.data) {
      videoRef.current.src = res.data.videoUrl;
    }
  };

  useEffect(() => {
    if (id && videoRef.current) {
      getVideoUrlById(id);
    }
  }, [id, videoRef]);

  return (
    <>
      <Row>
        <Col span={20}>
          <video
            style={{ width: "100%", }}
            ref={videoRef}
            controls
            autoPlay
            muted
          ></video>
        </Col>
        <Col span={4}>List</Col>
      </Row>
    </>
  );
};

export default StreamWatchPage;
