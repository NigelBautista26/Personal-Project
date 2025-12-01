import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Fast touch - eliminate 300ms delay on mobile
if ('ontouchstart' in window) {
  let touchStartY = 0;
  let touchStartX = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    
    // Only trigger if it was a tap (not a scroll/swipe)
    const deltaY = Math.abs(touchEndY - touchStartY);
    const deltaX = Math.abs(touchEndX - touchStartX);
    
    if (deltaY < 10 && deltaX < 10) {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"], label');
      
      if (clickable) {
        e.preventDefault();
        (clickable as HTMLElement).click();
      }
    }
  }, { passive: false });
}

createRoot(document.getElementById("root")!).render(<App />);
