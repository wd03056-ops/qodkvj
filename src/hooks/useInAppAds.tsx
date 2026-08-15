import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Reward {
  unitType: string;
  unitAmount: number;
}

interface UseInAppAdsReturn {
  isAdLoaded: boolean;
  isSupported: boolean;
  showAd: (onReward?: (reward: Reward) => void) => void;
  lastReward: Reward | null;
}

// 참고: https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/interstitial-rewarded-ad
export function useInAppAds(adGroupId: string, enabled = true): UseInAppAdsReturn {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [lastReward, setLastReward] = useState<Reward | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const unregisterRef = useRef<(() => void) | null>(null);
  const rewardCallbackRef = useRef<((reward: Reward) => void) | undefined>(
    undefined,
  );

  const load = useCallback(() => {
    setIsAdLoaded(false);

    try {
      unregisterRef.current?.();
      unregisterRef.current = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "loaded") {
            setIsAdLoaded(true);
          }
        },
        onError: (error) => {
          console.error("광고 로드 실패:", error);
          setIsAdLoaded(false);
        },
      });
    } catch (error) {
      console.error("광고 로드 실패:", error);
      setIsAdLoaded(false);
    }
  }, [adGroupId]);

  useEffect(() => {
    if (!enabled) {
      setIsSupported(false);
      setIsAdLoaded(false);
      return;
    }

    try {
      const supported = loadFullScreenAd.isSupported();
      setIsSupported(supported);
      if (supported) {
        load();
      }
    } catch (error) {
      console.error("광고 지원 여부 확인 실패:", error);
      setIsSupported(false);
    }

    return () => {
      try {
        unregisterRef.current?.();
      } catch (error) {
        console.error("광고 정리(cleanup) 중 에러:", error);
      }
    };
  }, [enabled, load]);

  const showAd = useCallback(
    (onReward?: (reward: Reward) => void) => {
      rewardCallbackRef.current = onReward;

      if (!isSupported) {
        console.info("현재 환경에서는 인앱 광고가 지원되지 않아요.");
        return;
      }

      if (!isAdLoaded) {
        console.info("아직 광고가 로드되지 않았어요.");
        return;
      }

      try {
        showFullScreenAd({
          options: { adGroupId },
          onEvent: (event) => {
            switch (event.type) {
              case "userEarnedReward": {
                setLastReward(event.data);
                rewardCallbackRef.current?.(event.data);
                break;
              }
              case "dismissed":
                setIsAdLoaded(false);
                load();
                break;
              case "failedToShow":
                console.error("광고 표시 실패");
                setIsAdLoaded(false);
                load();
                break;
              default:
                break;
            }
          },
          onError: (error) => {
            console.error("광고 표시 실패:", error);
            setIsAdLoaded(false);
            load();
          },
        });
      } catch (error) {
        console.error("광고 표시 실패:", error);
        setIsAdLoaded(false);
        load();
      }
    },
    [adGroupId, isAdLoaded, isSupported, load],
  );

  return { isAdLoaded, isSupported, showAd, lastReward };
}
