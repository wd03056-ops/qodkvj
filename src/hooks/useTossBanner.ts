import { TossAds } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

type AttachBannerOptions = Parameters<typeof TossAds.attachBanner>[2];

let initializePromise: Promise<boolean> | null = null;

function initializeTossAdsOnce() {
  if (initializePromise) {
    return initializePromise;
  }

  if (!TossAds.initialize.isSupported()) {
    initializePromise = Promise.resolve(false);
    return initializePromise;
  }

  initializePromise = new Promise((resolve) => {
    TossAds.initialize({
      callbacks: {
        onInitialized: () => resolve(true),
        onInitializationFailed: (error) => {
          console.error("Toss Ads SDK initialization failed:", error);
          resolve(false);
        },
      },
    });
  });

  return initializePromise;
}

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    initializeTossAdsOnce().then((ready) => {
      if (!cancelled) {
        setIsInitialized(ready);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: AttachBannerOptions) => {
      if (!isInitialized || !TossAds.attachBanner.isSupported()) {
        return;
      }
      return TossAds.attachBanner(adGroupId, element, options);
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}
