import { useEffect, useRef } from "react";
import { useTossBanner } from "../hooks/useTossBanner";
import "./BottomBannerAd.css";

const BANNER_AD_GROUP_ID = "ait.v2.live.e35a51be239e48e9";

export function BottomBannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, attachBanner } = useTossBanner();

  useEffect(() => {
    if (!isInitialized || !containerRef.current) {
      return;
    }

    const attached = attachBanner(BANNER_AD_GROUP_ID, containerRef.current, {
      theme: "light",
      tone: "blackAndWhite",
      variant: "expanded",
      callbacks: {
        onAdRendered: (payload) => {
          console.log("배너 렌더링 완료:", payload.slotId);
        },
        onAdImpression: (payload) => {
          console.log("배너 노출:", payload.slotId);
        },
        onAdViewable: (payload) => {
          console.log("배너 노출 기록:", payload.slotId);
        },
        onAdClicked: (payload) => {
          console.log("배너 클릭:", payload.slotId);
        },
        onNoFill: (payload) => {
          console.warn("표시할 배너 광고가 없습니다:", payload.slotId);
        },
        onAdFailedToRender: (payload) => {
          console.error("배너 렌더링 실패:", payload.error.message);
        },
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [isInitialized, attachBanner]);

  return (
    <div className="bottom-banner-ad" aria-label="광고">
      <div ref={containerRef} className="bottom-banner-ad-slot" />
    </div>
  );
}
