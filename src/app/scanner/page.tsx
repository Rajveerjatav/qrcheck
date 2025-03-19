import dynamic from "next/dynamic";

// Dynamically import BrCodeScanner to disable SSR
const BrCodeScanner = dynamic(() => import("@/pages/scanner/components/brcode-scanner/BrCodeScanner"), { ssr: false });

const Page: React.FC = () => {
  return <BrCodeScanner />;
};

export default Page;
