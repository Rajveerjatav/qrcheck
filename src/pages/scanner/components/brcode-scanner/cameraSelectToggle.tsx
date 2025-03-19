import React, { Dispatch, memo, SetStateAction, useCallback } from "react";
import { MdCameraswitch } from "react-icons/md";
import classes from "./index.module.css";

interface IProps {
  allDevices: { value: string; label: string }[];
  setSelectedDevice: Dispatch<SetStateAction<string | null>>;
  selectedDevice: string | null;
  openCamera: (deviceId?: string) => Promise<void>;
}

const CameraSelectToggle: React.FC<IProps> = ({
  allDevices,
  setSelectedDevice,
  selectedDevice,
  openCamera,
}) => {
  // Toggle between front and back cameras
  const toggleCamera = useCallback(() => {
    if (allDevices.length < 2) return; // Ensure at least two devices exist

    const frontCamera = allDevices.find((device) =>
      device.label.toLowerCase().includes("front")
    );
    const backCamera = allDevices.find(
      (device) =>
        device.label.toLowerCase().includes("back") ||
        device.label.toLowerCase().includes("rear")
    );

    let newDeviceId = selectedDevice;

    if (selectedDevice === frontCamera?.value && backCamera) {
      newDeviceId = backCamera.value;
    } else if (selectedDevice === backCamera?.value && frontCamera) {
      newDeviceId = frontCamera.value;
    }

    if (newDeviceId && newDeviceId !== selectedDevice) {
      setSelectedDevice(newDeviceId);
      openCamera(newDeviceId); // Ensure the camera actually switches
    }
  }, [allDevices, selectedDevice, setSelectedDevice, openCamera]);

  return (
    <div className={classes.smallBtn} onClick={toggleCamera}>
      <MdCameraswitch size={20} />
    </div>
  );
};

export default memo(CameraSelectToggle);
