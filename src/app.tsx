import { useRef, useState } from "react";
import { useGeolocation } from "./hooks/geolocation-hook";
import { useDevicemotion } from "./hooks/devicemotion-hook";
import { useCamera } from "./hooks/camera-hook";

type Record = {
  timestamp: number;
  magnitude: number;
  latitude: number;
  longitude: number;
  text: string;
  imageUrl?: string | null;
};

const BUMP_THRESHOLD = 15;
const THROTTLE_TIME = 3000;

function App() {
  const lastBumpTimeRef = useRef(0);
  const [records, setRecords] = useState<Record[]>([]);
  const { getCurrentPosition } = useGeolocation();
  const { requestPermission } = useDevicemotion(devicemotionEventHandler);
  const { videoRef, startCamera, takePhoto } = useCamera();

  function speak(text: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = "zh-TW";
      window.speechSynthesis.speak(utter);
    }
  }

  async function devicemotionEventHandler(event: DeviceMotionEvent) {
    const { acceleration } = event;

    if (!acceleration) return;

    const x = acceleration.x ?? 0;
    const y = acceleration.y ?? 0;
    const z = acceleration.z ?? 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (magnitude > BUMP_THRESHOLD) {
      const now = Date.now();

      if (now - lastBumpTimeRef.current > THROTTLE_TIME) {
        lastBumpTimeRef.current = now;

        const { coords, timestamp } = await getCurrentPosition();
        const { latitude, longitude } = coords;
        const text =
          magnitude >= 25
            ? "偵測到嚴重顛簸"
            : magnitude >= 20
              ? "偵測到中等顛簸"
              : "偵測到輕微顛簸";
        const imageUrl = takePhoto();

        setRecords((prev) => [
          { timestamp, magnitude, latitude, longitude, text, imageUrl },
          ...prev,
        ]);
        speak(text);
      }
    }
  }

  return (
    <main className="flex h-dvh w-dvw flex-col gap-4 p-4 pb-8">
      <video ref={videoRef} className="rounded-box" autoPlay playsInline />

      <ul className="list bg-base-100 rounded-box flex-1 overflow-scroll shadow-md">
        <li className="p-4 pb-2 text-sm tracking-wide opacity-60">顛簸事件記錄</li>
        {records.map((record, index) => {
          return (
            <li key={index} className="list-row">
              <div>
                <img
                  className="rounded-box size-10 contain-content"
                  src={record.imageUrl || "null"}
                />
              </div>
              <div>
                <div>{new Date(record.timestamp).toLocaleTimeString()}</div>
                <div className="text-xs font-semibold uppercase opacity-60">{record.text}</div>
              </div>
              <button
                className={`btn btn-square btn-ghost ${record.magnitude >= 25 ? "text-error" : record.magnitude >= 20 ? "text-warning" : "text-info"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        className="btn btn-block btn-primary"
        onClick={() => (requestPermission(), speak("開始檢測"), startCamera())}
      >
        開始檢測
      </button>
    </main>
  );
}

export { App };
