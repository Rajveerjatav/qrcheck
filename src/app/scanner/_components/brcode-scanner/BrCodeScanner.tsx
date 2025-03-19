// SonarQube Ignore: Video element is for QR scanning, captions not needed
"use client";
import React, { useEffect, useRef } from "react";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";
import {
  IoIosArrowBack,
  IoIosFlash,
  IoIosFlashOff,
  IoMdCheckmark,
  IoMdStopwatch,
} from "react-icons/io";
import CameraSelectToggle from "./cameraSelectToggle";
import { useScannerBrCode } from "@/helpers/useScannerBrCode";
import Image from "next/image";

const BrCodeScanner: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    results,
    selectedDeviceId,
    setSelectedDeviceId,
    startScanning,
    status,
    isCameraOpen,
    openCamera,
    stopCamera,
    isFlashOn,
    toggleFlashlight,
    videoInputDevices,
  } = useScannerBrCode({
    canvasRef: canvasRef,
    videoRef: videoRef,
  });

  useEffect(() => {
    openCamera();
  }, []);

  useEffect(() => {
    if (isCameraOpen) {
      startScanning();
    }
  }, [isCameraOpen]);


  const newVideoInputDevices = videoInputDevices.map((device) => ({
    value: device.deviceId,
    label: device.label || `Camera ${videoInputDevices.indexOf(device) + 1}`,
  }));

  

  return (
    <div className={classes.wrapper}>
      <div>
        <video ref={videoRef} className={classes.video} />
        <div className={classes.frameContainer}>
          <div className={`${classes.corner} ${classes.topLeft}`} />
          <div className={`${classes.corner} ${classes.topRight}`} />
          <div className={`${classes.corner} ${classes.bottomLeft}`} />
          <div className={`${classes.corner} ${classes.bottomRight}`} />
          <div
            className={`${classes.scanStatus} 
              ${status === "Already Scanned" && classes.scanStatusBgRed} 
              ${status === "Scanned" && classes.scanStatusSuccess} 
              ${status === "Scanning" && classes.scanStatusScanning} 
              `}
          >
            {" "}
            <IoMdStopwatch /> <span>{status}</span>
          </div>
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
      <div className={classes.topHeader}>
        <button
          className={classes.smallBtn}
          onClick={() => {
            stopCamera();
            router.push("/");
          }}
        >
          <IoIosArrowBack size={20} />
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <CameraSelectToggle
            allDevices={newVideoInputDevices}
            selectedDevice={selectedDeviceId}
            setSelectedDevice={setSelectedDeviceId}
            openCamera={openCamera}
          />

          <button className={classes.smallBtn} onClick={toggleFlashlight}>
            {isFlashOn ? <IoIosFlash size={20} /> : <IoIosFlashOff size={20} />}
          </button>
        </div>
      </div>
      <div className={classes.scannedCodesContainer}>
        <button className={classes.submitBtn}>
          <IoMdCheckmark size={40} />
        </button>
        <div className={classes.scannedCodesList}>
          {results.map((item, index) => (
            <div key={index + "_"} className={classes.scannedCode}>
              <Image
                className={classes.scannerImg}
                alt="scanned-image"
                src={item.image || "/placeholder.svg"}
                width={50}
                height={50}
              />
              <p className={classes.scannerCount}>{results.length}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrCodeScanner;
