import { useRef, useState } from "react";

function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [_, setStream] = useState<MediaStream | null>(null);

  async function startCamera() {
    const _stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    setStream(_stream);
    if (videoRef.current) {
      videoRef.current.srcObject = _stream;
    }
  }

  function takePhoto(): string | null {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  }

  return { videoRef, startCamera, takePhoto };
}

export { useCamera };
