import { useRef } from "react";

function useDevicemotion(listener: (this: Window, ev: DeviceMotionEvent) => any) {
  const permissionGranted = useRef(false);

  async function requestPermission() {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result === "granted") {
          window.addEventListener("devicemotion", listener);
          permissionGranted.current = true;
        } else {
          alert("請允許裝置動作權限以啟用功能");
        }
      } catch (e) {
        alert("取得權限時發生錯誤:" + (e as Error).message);
      }
    } else {
      window.addEventListener("devicemotion", listener);
      permissionGranted.current = true;
    }
  }

  function removeListener() {
    if (permissionGranted.current) {
      window.removeEventListener("devicemotion", listener);
    }
  }

  return { requestPermission, removeListener };
}

export { useDevicemotion };
