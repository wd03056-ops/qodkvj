import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

function preventZoom(event: Event) {
  event.preventDefault();
}

document.addEventListener("gesturestart", preventZoom);
document.addEventListener("gesturechange", preventZoom);
document.addEventListener("gestureend", preventZoom);

let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
