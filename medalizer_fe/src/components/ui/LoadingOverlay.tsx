import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingOverlayProps {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="w-48 h-48">
        <DotLottieReact
          src="https://lottie.host/3eea9988-cd3c-4067-8002-757c48144550/LzZTdkf73y.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
