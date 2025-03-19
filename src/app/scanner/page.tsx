import dynamic from "next/dynamic";

// Disable SSR to avoid "navigator is not defined" error
const BrCodeScanner = dynamic(() => import("@/pages/scanner/components/brcode-scanner/BrCodeScanner"), { ssr: false });

const Page: React.FC = () => {
  return <BrCodeScanner />;
};

export default Page;
