import { useMemo, useRef, useState, type FormEvent } from "react";
import { foodData, type FodmapLevel, type FoodItem } from "../data/foodData";
import { useInAppAds } from "../hooks/useInAppAds";
import "./FodmapGuidePage.css";

type Screen = "home" | "list" | "detail";
type DetailTopicKey = "tip" | "analysis" | "serving" | "alternatives" | "caution";

const DETAIL_TOPICS: { key: DetailTopicKey; title: string }[] = [
  { key: "tip", title: "한눈에 보기" },
  { key: "analysis", title: "포드맵 성분 분석" },
  { key: "serving", title: "권장 섭취량 및 조리 팁" },
  { key: "alternatives", title: "대체 식품 추천" },
  { key: "caution", title: "주의 사항" },
];

const REWARDED_AD_GROUP_ID = "ait-ad-test-rewarded-id";

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function FodmapGuidePage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [level, setLevel] = useState<FodmapLevel>("high");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [adWatched, setAdWatched] = useState(false);
  const [detailStep, setDetailStep] = useState(0);
  const [watchFirstNotice, setWatchFirstNotice] = useState(false);
  const adNoticeRef = useRef<HTMLDivElement>(null);
  const rewardedAd = useInAppAds(REWARDED_AD_GROUP_ID);

  function scrollToAdNotice() {
    requestAnimationFrame(() => {
      adNoticeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleAdBannerClick() {
    if (adWatched) return;

    if (!rewardedAd.isSupported) {
      return;
    }

    if (!rewardedAd.isAdLoaded) {
      return;
    }

    rewardedAd.showAd(() => {
      setAdWatched(true);
      setWatchFirstNotice(false);
    });
  }

  function handleOpenDetail(food: FoodItem) {
    if (!adWatched) {
      setWatchFirstNotice(true);
      scrollToAdNotice();
      return;
    }

    setWatchFirstNotice(false);
    setSelectedFood(food);
    setDetailStep(0);
    setScreen("detail");
  }

  const normalizedQuery = submittedQuery.trim().toLowerCase();

  const items = useMemo(() => {
    return foodData.filter((item) => {
      if (item.level !== level) return false;
      if (!normalizedQuery) return true;
      return item.name.toLowerCase().includes(normalizedQuery);
    });
  }, [level, normalizedQuery]);

  function openList(nextLevel: FodmapLevel) {
    setLevel(nextLevel);
    setQuery("");
    setSubmittedQuery("");
    setScreen("list");
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  function goBack() {
    if (screen === "detail") {
      setSelectedFood(null);
      setDetailStep(0);
      setScreen("list");
      return;
    }
    setScreen("home");
  }

  return (
    <main className="fodmap-page">
      <div className="fodmap-container">
        {screen === "home" && (
          <>
            <h1 className="fodmap-title">과민성대장타파</h1>
            <p className="fodmap-subtitle">
              과민성대장증후군을 위한 포드맵(FODMAP) 식단
            </p>
            <p className="fodmap-desc">
              * 포드맵은 장에서 잘 흡수되지 않고 발효되어
              <br />
              가스·복통·설사를 유발할 수 있는 당류를 말합니다.
            </p>

            <div className="choice-row">
              <button
                type="button"
                className="choice-card high"
                onClick={() => openList("high")}
              >
                <span className="choice-icon" aria-hidden="true">
                  ❌
                </span>
                <span className="choice-label">피할 음식</span>
              </button>
              <button
                type="button"
                className="choice-card low"
                onClick={() => openList("low")}
              >
                <span className="choice-icon" aria-hidden="true">
                  ✔
                </span>
                <span className="choice-label">안심 음식</span>
              </button>
            </div>

            <p className="disclaimer">
              본 앱에서 제공하는 식품 정보는
              <br />
              소화기내과 포드맵(FODMAP) 가이드라인을 기반으로 제작된
              <br />
              참고용 자료입니다.
              <br />
              <br />
              개인의 증상 차이가 있을 수 있으므로
              <br />
              정확한 진단과 식단 관리는
              <br />
              의사 또는 영양사와 상담하시길 권장합니다.
            </p>
          </>
        )}

        {screen === "list" && (
          <>
            <div className="list-header">
              <button type="button" className="back-btn" onClick={goBack}>
                ← 뒤로가기
              </button>
              <h1 className="fodmap-title">
                {level === "high" ? "고위험 식품 목록" : "저위험 식품 목록"}
              </h1>
            </div>

            <form className="search-bar" onSubmit={handleSearch}>
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.65 16.65" />
              </svg>
              <input
                type="search"
                className="search-input"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  if (value.trim() === "") {
                    setSubmittedQuery("");
                  }
                }}
                placeholder="음식을 검색하세요 (예: 커피, 우유)"
              />
              <button type="submit" className="search-submit">
                찾기
              </button>
            </form>

            <div className="ad-cta" ref={adNoticeRef}>
              <div className={`ad-banner${adWatched ? " unlocked" : ""}`}>
              {adWatched ? (
                <span className="ad-banner-text">
                  시청 완료! 이제 상세 해설을 볼 수 있어요
                </span>
              ) : (
                <>
                  <span className="ad-banner-text">
                    간단한 광고시청 후 모든 상세 설명이 열려요!
                  </span>
                  <button
                    type="button"
                    className="ad-play"
                    onClick={handleAdBannerClick}
                  >
                    {rewardedAd.isAdLoaded ? "광고보기" : "준비 중"}
                  </button>
                </>
              )}
            </div>
            {watchFirstNotice && !adWatched ? (
              <p className="ad-watch-notice">
                간단한 광고시청 후 모든 상세 설명이 열려요!
              </p>
            ) : null}
            </div>

            {items.length === 0 ? (
              <p className="empty-result">검색 결과가 없습니다.</p>
            ) : (
              <div className="food-grid">
                {items.map((item) => (
                  <div
                    className="food-tile"
                    key={`${item.level}-${item.name}`}
                  >
                    <span
                      className={`risk-badge ${item.level === "high" ? "high" : "low"}`}
                    >
                      {item.level === "high" ? "고위험" : "저위험"}
                    </span>
                    <span className="food-tile-name">{item.name}</span>
                    <button
                      type="button"
                      className="food-tile-detail"
                      onClick={() => handleOpenDetail(item)}
                    >
                      상세설명
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {screen === "detail" && selectedFood && (
          <>
            <button type="button" className="back-btn" onClick={goBack}>
              ← 뒤로가기
            </button>
            <article className="detail-card">
              <span
                className={`risk-badge ${selectedFood.level === "high" ? "high" : "low"}`}
              >
                {selectedFood.level === "high" ? "고위험" : "저위험"}
              </span>
              <h2 className="detail-name">{selectedFood.name}</h2>
              <p className="detail-meta">{selectedFood.category}</p>
              <p className="detail-topic">
                {DETAIL_TOPICS[detailStep].title}
              </p>
              <div className="detail-body">
                <div className="detail-text-block">
                  {selectedFood[DETAIL_TOPICS[detailStep].key].map(
                    (paragraph) => (
                      <p className="detail-info" key={paragraph}>
                        {renderBold(paragraph)}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="detail-nav">
                <button
                  type="button"
                  className="detail-arrow"
                  onClick={() => setDetailStep((step) => step - 1)}
                  disabled={detailStep === 0}
                  aria-label="이전 주제"
                >
                  ←
                </button>
                <span className="detail-step">
                  {detailStep + 1} / {DETAIL_TOPICS.length}
                </span>
                <button
                  type="button"
                  className="detail-arrow"
                  onClick={() => setDetailStep((step) => step + 1)}
                  disabled={detailStep === DETAIL_TOPICS.length - 1}
                  aria-label="다음 주제"
                >
                  →
                </button>
              </div>
            </article>
          </>
        )}
      </div>
    </main>
  );
}
