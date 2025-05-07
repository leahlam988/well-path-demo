import { useEffect, useState } from "react";

function useGeolocation() {
  const [isReady, setIsReady] = useState<boolean>(false);

  async function getCurrentPosition() {
    const { promise, resolve, reject } = Promise.withResolvers<GeolocationPosition>();
    navigator.geolocation.getCurrentPosition(resolve, reject);

    return promise;
  }

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, []);

  return { isReady, getCurrentPosition };
}

export { useGeolocation };
