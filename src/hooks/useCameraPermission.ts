"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CameraState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export function useCameraPermission() {
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      setError("Camera access is not supported on this device.");
      return null;
    }

    setState("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      setState("granted");
      return stream;
    } catch {
      setState("denied");
      setError("Camera permission was blocked. You can still continue with manual entry.");
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setState("idle");
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return {
    cameraState: state,
    cameraError: error,
    stream: streamRef.current,
    requestCamera,
    stopCamera
  };
}
