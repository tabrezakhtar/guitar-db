class ParallaxBackground {
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || "body",
      zIndex: options.zIndex || -1,
      speeds: options.speeds || [50, 70, 42, 20],
      gap: options.gap || "8px",
      imagesPerRow: options.imagesPerRow || 6,
      imageUrls: options.imageUrls || [
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/27_vorpi1.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/25_ldhbut.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/26_aipzgr.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/20_q0rxi6.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/21_lukucc.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/24_jdloiq.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/19_inpwgm.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/23_tnmsoo.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/18_vvt30d.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/22_ixcbue.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/12_kyauhv.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/17_w2k92s.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/16_qh0op8.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/14_hpmizd.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/3_vlhaod.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/8_bm8ck0.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/15_swdyo5.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/10_o3cmy3.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/13_filfgx.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/2_iak4vf.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/11_zkis74.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/6_kmujsd.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/9_wiupux.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/4_bsbsnk.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/7_uit5dj.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/1_xekvrv.jpg",
        "https://res.cloudinary.com/dx8d5hlk1/image/upload/w_500,c_limit,q_auto:low,f_auto,fl_progressive/v1754915725/5_mwohvw.jpg"
      ],
      ...options
    };
  }

  init() {
    this.injectCSS();
    this.createParallaxHTML();
    this.startAnimations();
  }

  injectCSS() {
    if (document.getElementById("parallax-bg-styles")) return;

    const style = document.createElement("style");
    style.id = "parallax-bg-styles";
    style.textContent = `
      .parallax-bg-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: ${this.options.zIndex};
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: ${this.options.gap};
        overflow: hidden;
      }
      
      .parallax-bg-row {
        flex: 1;
        display: flex;
        width: 100vw;
        height: 25vh;
        gap: ${this.options.gap};
        overflow: hidden;
        position: relative;
      }
      
      .parallax-bg-row img {
        flex: 1;
        object-fit: cover;
        width: 100%;
        height: 100%;
        display: block;
      }
      
      .parallax-bg-scrolling-inner {
        display: flex;
        gap: ${this.options.gap};
        width: max-content;
        height: 100%;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-play-state: paused;
        will-change: transform;
      }
      
      .parallax-bg-scrolling-inner.loaded {
        animation-play-state: running;
      }
      
      .parallax-bg-scroll-right .parallax-bg-scrolling-inner {
        animation-name: parallax-scroll-right;
      }
      
      .parallax-bg-scroll-left .parallax-bg-scrolling-inner {
        animation-name: parallax-scroll-left;
      }
      
      @keyframes parallax-scroll-right {
        0% {
          transform: translateX(-50%);
        }
        100% {
          transform: translateX(0);
        }
      }
      
      @keyframes parallax-scroll-left {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  createParallaxHTML() {
    const existing = document.querySelector(".parallax-bg-container");
    if (existing) {
      existing.remove();
    }

    const container = document.createElement("div");
    container.className = "parallax-bg-container";

    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      const row = document.createElement("div");
      const direction = rowIndex % 2 === 0 ? "scroll-right" : "scroll-left";
      const speed = this.options.speeds[rowIndex] || 30;
      
      row.className = `parallax-bg-row parallax-bg-${direction}`;
      
      const scrollingInner = document.createElement("div");
      scrollingInner.className = "parallax-bg-scrolling-inner";
      scrollingInner.style.animationDuration = `${speed}s`;

      const startIndex = rowIndex * this.options.imagesPerRow;
      const rowImages = [];
      
      for (let i = 0; i < this.options.imagesPerRow; i++) {
        const imageIndex = startIndex + i;
        if (imageIndex < this.options.imageUrls.length) {
          rowImages.push(this.options.imageUrls[imageIndex]);
        }
      }

      [...rowImages, ...rowImages].forEach((imageUrl, index) => {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = `Parallax Image ${index + 1}`;
        img.loading = "lazy";
        scrollingInner.appendChild(img);
      });

      row.appendChild(scrollingInner);
      container.appendChild(row);
    }

    const targetContainer = document.querySelector(this.options.containerSelector);
    if (targetContainer === document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    } else {
      targetContainer.appendChild(container);
    }
  }

  startAnimations() {
    const images = document.querySelectorAll(".parallax-bg-container img");
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      this.activateAnimations();
      return;
    }

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        this.activateAnimations();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.addEventListener("load", checkAllLoaded);
        img.addEventListener("error", checkAllLoaded);
      }
    });

    setTimeout(() => {
      this.activateAnimations();
    }, 3000);
  }

  activateAnimations() {
    const scrollingElements = document.querySelectorAll(".parallax-bg-scrolling-inner");
    scrollingElements.forEach(element => {
      element.classList.add("loaded");
    });
  }

  destroy() {
    const container = document.querySelector(".parallax-bg-container");
    const styles = document.getElementById("parallax-bg-styles");
    
    if (container) container.remove();
    if (styles) styles.remove();
  }

  static init(options) {
    const instance = new ParallaxBackground(options);
    instance.init();
    return instance;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const script = document.querySelector("script[src*=\"parallax-bg.js\"]");
  if (script && script.hasAttribute("data-auto-init")) {
    const options = {};
    
    if (script.dataset.imagePath) options.imagePath = script.dataset.imagePath;
    if (script.dataset.imageCount) options.imageCount = parseInt(script.dataset.imageCount);
    if (script.dataset.zIndex) options.zIndex = parseInt(script.dataset.zIndex);
    if (script.dataset.gap) options.gap = script.dataset.gap;
    
    ParallaxBackground.init(options);
  }
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = ParallaxBackground;
}

window.ParallaxBackground = ParallaxBackground;