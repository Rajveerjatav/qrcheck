"use client";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface IUseScannerBrCode {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useScannerBrCode = (data: IUseScannerBrCode) => {
  const { videoRef, canvasRef } = data;
  const pathname = usePathname();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>("");
  const [results, setResults] = useState<
    {
      text: string;
      image: string;
      timestamp: number;
      latitude: number | null;
      longitude: number | null;
    }[]
  >([]);
  const [status, setStatus] = useState<string>("Ready for scan");
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scannedSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    codeReaderRef.current
      .listVideoInputDevices()
      .then((devices) => {
        setVideoInputDevices(devices);
        if (devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      stopCamera(); // Stop camera when unmounting
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [pathname]);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setVideoInputDevices(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error fetching camera devices:", error);
      }
    };

    fetchCameras();
  }, []);

  const toggleFlashlight = async () => {
    try {
      if (isFirefox) {
        alert("Flashlight is not supported on Firefox.");
        return;
      }

      if (!videoRef.current || !videoRef.current.srcObject) {
        alert("No video stream available.");
        return;
      }

      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];

      if (!videoTrack) {
        alert("No video track found.");
        return;
      }

      const capabilities =
        videoTrack.getCapabilities() as MediaTrackCapabilities & {
          torch?: boolean;
        };

      if (!capabilities.torch) {
        alert("Torch is not supported on this device/browser.");
        return;
      }

      // Apply torch constraints (works on Chrome, Edge, etc.)
      const constraints = {
        advanced: [{ torch: !isFlashOn }],
      } as unknown as MediaTrackConstraints;

      await videoTrack.applyConstraints(constraints);
      setIsFlashOn(!isFlashOn);
    } catch (error) {
      alert(`Error toggling flashlight: ${error}`);
    }
  };

  const openCamera = async (deviceId?: string) => {
    try {
      stopCamera(); 
      // Get available video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Filter only video input devices (cameras)
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        alert("No camera found!");
        return;
      }

      

      // Find the back camera
      const backCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear")
      );

      // Set the selected device (back camera if available, otherwise first camera)
      const selectedDeviceId = backCamera
        ? backCamera.deviceId
        : videoDevices[0].deviceId;
      setSelectedDeviceId(selectedDeviceId);

      const selectedId = deviceId || selectedDeviceId || videoDevices[0].deviceId;
      setSelectedDeviceId(selectedId);

      // Open camera with the selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access is required! Please grant permission.");
    }
  };

  const stopCamera = () => {
    if (!videoRef.current) {
      return; // Exit early if videoRef is not set
    }

    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const startScanning = async () => {
    if (!isCameraOpen) return;
    setStatus("Scanning...");

    codeReaderRef.current?.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.current!,
      async (result, err) => {
        if (result) {
          const scannedText = result.getText();
          if (scannedSetRef.current.has(scannedText)) {
            setStatus("Already Scanned");
            setTimeout(() => setStatus("Ready for scan"), 1000);
            return;
          }

          setStatus("Scanning");
          scannedSetRef.current.add(scannedText);
          const capturedImage = captureImage();
          const scanEntry = {
            text: scannedText,
            image: capturedImage,
            latitude: null, // Set later
            longitude: null, // Set later
            timestamp: Date.now(),
          };

          setResults((prev) => [...prev, scanEntry]);

          // Fetch updated location in the background
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setResults((prev) =>
                prev.map((entry) =>
                  entry.text === scannedText
                    ? {
                        ...entry,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      }
                    : entry
                )
              );
            },
            (error) => console.error("Error getting updated location:", error),
            {
              enableHighAccuracy: true,
            }
          );

          setStatus("Scanned");
          setTimeout(() => setStatus("Ready for scan"), 1000);
        }

        if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      }
    );
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png");
      }
    }
    return "";
  };

  const resetScanner = () => {
    stopCamera(); // Stop camera when resetting
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setResults([]);
    setStatus("Ready for scan");
  };

  return {
    startScanning,
    resetScanner,
    status,
    videoInputDevices,
    results,
    openCamera,
    stopCamera,
    isCameraOpen,
    toggleFlashlight,
    isFlashOn,
    // isLoadingLocation
    selectedDeviceId,
    setSelectedDeviceId,
  };
};
