"use client";
import React from "react";
import styles from "./index.module.css";
import { FaCamera, FaImage } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Use this for navigation in Next.js 13+

const HeroBanner = () => {
  const router = useRouter();

  const handleCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true }); // Request camera access
      router.push("/scanner"); // Navigate only if permission is granted
    } catch (error) {
      alert(
        `Camera access is required to scan! Please grant permission. \nError: ${error}`
      );
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={`${styles.col} ${styles.textSection}`}>
          <h2 className={styles.heading}>
            Scan <br /> Easy & Verify
          </h2>
          <p className={styles.description}>
            Simply scan any QR or barcode, and get instant access to the encoded
            data. Fast, reliable, and easy to use!
          </p>
          <div className={styles.btnSection}>
            <button
              onClick={handleCameraAccess}
              className={`${styles.btn} ${styles.primary}`}
            >
              <FaCamera />
              Scan with Camera
            </button>
            <button className={`${styles.btn} ${styles.secondary}`}>
              <FaImage />
              Scan from Image
            </button>
          </div>
        </div>
        <div className={`${styles.col} ${styles.rightSection}`}>
          <Image
            className={`${styles.heroBannerImage} `}
            src="/home-hero-banner.png"
            alt="QR scanner"
            width={512}
            height={538}
          />
        </div>
      </main>
    </div>
  );
};

export default HeroBanner;
