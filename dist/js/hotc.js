/* ============================================
   THE WEDDING ARCHITECT — HOTC Homepage JS
   Navigation, Video Modal, Scroll Effects
   ============================================ */

(function () {
  'use strict';

  // ─────────── NAV: Transparent → Solid on scroll ───────────
  const nav = document.getElementById('hotc-nav');
  if (nav) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on load
  }

  // ─────────── HAMBURGER MOBILE MENU ───────────
  const hamburger = document.getElementById('hotc-hamburger');
  const mobileMenu = document.getElementById('hotc-mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when link is clicked
    mobileMenu.querySelectorAll('.hotc-mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─────────── VIDEO LIGHTBOX MODAL ───────────
  const modal = document.getElementById('hotc-video-modal');
  const videoContainer = document.getElementById('hotc-video-container');
  const closeBtn = document.getElementById('hotc-video-close');

  const openModal = (url) => {
    if (!modal || !videoContainer) return;
    let embedUrl = url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('youtube.com/watch')) {
      try {
        const id = new URL(url).searchParams.get('v');
        if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
      } catch (e) {}
    }
    const sep = embedUrl.includes('?') ? '&' : '?';
    videoContainer.innerHTML = `<iframe src="${embedUrl}${sep}autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  };

  const closeModal = () => {
    if (!modal || !videoContainer) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
    setTimeout(() => {
      videoContainer.innerHTML = '';
    }, 400);
  };

  // ─────────── VIDEO LIGHTBOX EVENT DELEGATION ───────────
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-video-url]');
    if (card) {
      const url = card.getAttribute('data-video-url');
      if (url) {
        e.preventDefault();
        openModal(url);
      }
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });


  // ─────────── INTERSECTION OBSERVER ANIMATIONS ───────────
  const animateElements = document.querySelectorAll(
    '.hotc-ethos-title, .hotc-ethos-body, .hotc-ethos-img-wrap, .hotc-story-card, .hotc-press-logo, ' +
    '.hotc-cinema-title, .hotc-cinema-text, .hotc-film-card, .hotc-stories-cta, ' +
    '.moon-ethos-title-col, .moon-ethos-img-col, .moon-ethos-text-col, .moon-heading, .moon-subtext, ' +
    '.hotc-what-we-do-gallery, .hotc-what-we-do-content, .hotc-wd-block, .moon-testimonial-card, ' +
    '.twa-about-header, .twa-portrait-card, .twa-story-text-col, .twa-pillar-card, .twa-recognition-strip, ' +
    '.twa-stat-box, .twa-closing-quote, .twa-meet-team-inner'
  );

  if (animateElements.length > 0 && 'IntersectionObserver' in window) {
    // Add initial hidden state with hardware acceleration
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translate3d(0, 16px, 0)';
      el.style.willChange = 'opacity, transform';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.children) : [];
          const i = siblings.indexOf(entry.target);
          const delay = Math.min(Math.max(i, 0) * 0.06, 0.25);

          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translate3d(0, 0, 0)';
            setTimeout(() => {
              entry.target.style.willChange = 'auto';
            }, 900);
          }, delay * 1000);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -15px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
  }

  // ─────────── MOONLIGHT PHOTO SLIDER TRACK NAVIGATION ───────────
  const track = document.getElementById('moonSlideTrack');
  const prevBtn = document.getElementById('moonSlidePrev');
  const nextBtn = document.getElementById('moonSlideNext');

  if (track && prevBtn && nextBtn) {
    const scrollAmount = 360;
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // ─────────── YOUTUBE THUMBNAIL FALLBACK ───────────
  document.querySelectorAll('img[src*="img.youtube.com"]').forEach(img => {
    const fallback = () => {
      if (img.src.includes('maxresdefault.jpg')) {
        img.src = img.src.replace('maxresdefault.jpg', 'sddefault.jpg');
      } else if (img.src.includes('sddefault.jpg')) {
        img.src = img.src.replace('sddefault.jpg', 'hqdefault.jpg');
      }
    };
    img.addEventListener('error', fallback);
    if (img.complete && img.naturalWidth === 120 && img.naturalHeight === 90) {
      fallback();
    } else {
      img.addEventListener('load', () => {
        if (img.naturalWidth === 120 && img.naturalHeight === 90) {
          fallback();
        }
      });
    }
  });

  // ─────────── OVA FULLSCREEN SCROLL SLIDER (YEARS OF LOVE) ───────────
  const initOvaSlider = () => {
    const sliderEl = document.querySelector('.ova-slider-section');
    if (!sliderEl) return;

    const slides = [
      {
        couple: "Vaishali & Atharva",
        location: "Destination Story",
        date: "May 1, 2026",
        image: "assets/images/pixieset_covers/vaishali-atharva.jpg",
        link: "https://theweddingarchitect25.pixieset.com/vaishaliandatharva/",
        excerpt: "Some connections are so natural that they feel like they were always meant to be. Vaishali & Atharva’s story isn’t loud or staged; it’s tender, effortless, and beautifully real."
      },
      {
        couple: "Tisha & Harsh",
        location: "Heritage Romance",
        date: "October 7, 2025",
        image: "assets/images/pixieset_covers/tisha-harsh.jpg",
        link: "https://theweddingarchitect25.pixieset.com/tishaandharsh/",
        excerpt: "There’s something magical about Tisha and Harsh; a couple whose chemistry feels effortless, warm, and deeply rooted in friendship and joyful celebration."
      },
      {
        couple: "Kajol & Prasad",
        location: "Palace Ceremony",
        date: "August 25, 2025",
        image: "assets/images/pixieset_covers/kajol-prasad.jpg",
        link: "https://theweddingarchitect25.pixieset.com/kajolandprasad/",
        excerpt: "Two wild-hearted souls who found in each other a quiet refuge and an untamed adventure. Watching them get married felt like pure universe magic."
      },
      {
        couple: "Ayesha & Andres",
        location: "Cross-Cultural Celebration",
        date: "August 8, 2025",
        image: "assets/images/pixieset_covers/ayesha-andres.jpg",
        link: "https://theweddingarchitect25.pixieset.com/ayeshaandandres/",
        excerpt: "A seamless blending of traditions, laughter, and lifelong devotion. Every stolen glance and radiant smile reflected a love that knows no bounds."
      },
      {
        couple: "Neha & Aniruddh",
        location: "Royal Destination",
        date: "June 14, 2025",
        image: "assets/images/pixieset_covers/neha-aniruddh.jpg",
        link: "https://theweddingarchitect25.pixieset.com/nehaandaniruddh/",
        excerpt: "Some love stories feel like they were destined to be told through an artistic lens, and Neha & Aniruddh’s celebration was sheer poetry in motion."
      },
      {
        couple: "Sneha & Ashish",
        location: "Intimate Heritage",
        date: "April 19, 2025",
        image: "assets/images/pixieset_covers/sneha-ashish.jpg",
        link: "https://theweddingarchitect25.pixieset.com/snehaandashish/",
        excerpt: "A beautiful reflection of the love and warmth that has blossomed between them over the years. Best friends who walk through life side by side."
      }
    ];

    const progressBar = sliderEl.querySelector(".ova-slider-progress");
    const sliderImages = sliderEl.querySelector(".ova-slider-images");
    const sliderTitle = sliderEl.querySelector(".ova-slider-title");
    const sliderIndices = sliderEl.querySelector(".ova-slider-indices");

    let activeSlide = 0;
    let scrollTriggerInstance = null;

    function createIndices() {
      if (!sliderIndices) return;
      sliderIndices.innerHTML = "";
      slides.forEach((_, index) => {
        const indexNum = (index + 1).toString().padStart(2, "0");
        const indicatorElement = document.createElement("p");
        indicatorElement.dataset.index = index;
        indicatorElement.innerHTML = `<span class="ova-marker"></span><span class="ova-index">${indexNum}</span>`;

        indicatorElement.addEventListener('click', () => {
          activeSlide = index;
          animateNewSlide(activeSlide);
          if (typeof ScrollTrigger !== 'undefined' && scrollTriggerInstance) {
            const progress = index / (slides.length - 1);
            const targetScroll = scrollTriggerInstance.start + progress * (scrollTriggerInstance.end - scrollTriggerInstance.start);
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        });

        sliderIndices.appendChild(indicatorElement);

        if (typeof gsap !== 'undefined') {
          if (index === 0) {
            gsap.set(indicatorElement.querySelector(".ova-index"), { opacity: 1 });
            gsap.set(indicatorElement.querySelector(".ova-marker"), { scaleX: 1 });
          } else {
            gsap.set(indicatorElement.querySelector(".ova-index"), { opacity: 0.35 });
            gsap.set(indicatorElement.querySelector(".ova-marker"), { scaleX: 0 });
          }
        }
      });
    }

    function animateNewSlide(index) {
      if (!sliderImages) return;

      const newSliderImage = document.createElement("img");
      newSliderImage.src = slides[index].image;
      newSliderImage.alt = slides[index].couple;

      if (typeof gsap !== 'undefined') {
        gsap.set(newSliderImage, {
          opacity: 0,
          scale: 1.06,
        });

        sliderImages.appendChild(newSliderImage);

        // Smoothly fade in and settle new image
        gsap.to(newSliderImage, {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: "power2.out",
        });

        // Dissolve old images out smoothly
        const allImages = sliderImages.querySelectorAll("img");
        if (allImages.length > 1) {
          for (let i = 0; i < allImages.length - 1; i++) {
            const oldImg = allImages[i];
            gsap.to(oldImg, {
              opacity: 0,
              duration: 0.75,
              ease: "power2.out",
              onComplete: () => {
                if (oldImg.parentNode) oldImg.parentNode.removeChild(oldImg);
              }
            });
          }
        }
      } else {
        sliderImages.innerHTML = '';
        sliderImages.appendChild(newSliderImage);
      }

      animateContent(index);
      animateIndicators(index);
    }

    function animateIndicators(index) {
      if (!sliderIndices) return;
      const indicators = sliderIndices.querySelectorAll("p");
      indicators.forEach((indicator, i) => {
        const markerElement = indicator.querySelector(".ova-marker");
        const indexElement = indicator.querySelector(".ova-index");
        if (!markerElement || !indexElement) return;

        if (typeof gsap !== 'undefined') {
          if (i === index) {
            gsap.to(indexElement, { opacity: 1, duration: 0.4, ease: "power2.out" });
            gsap.to(markerElement, { scaleX: 1, duration: 0.4, ease: "power2.out" });
          } else {
            gsap.to(indexElement, { opacity: 0.35, duration: 0.4, ease: "power2.out" });
            gsap.to(markerElement, { scaleX: 0, duration: 0.4, ease: "power2.out" });
          }
        } else {
          indexElement.style.opacity = i === index ? '1' : '0.35';
          markerElement.style.transform = i === index ? 'scaleX(1)' : 'scaleX(0)';
        }
      });
    }

    function animateContent(index) {
      if (!sliderTitle) return;
      const slide = slides[index];

      const renderHtml = () => {
        sliderTitle.innerHTML = `
          <span class="ova-slider-tag">YEARS OF LOVE &bull; ${slide.date}</span>
          <h2 class="ova-slider-couple">${slide.couple}</h2>
          <p class="ova-slider-location">${slide.location}</p>
          <p class="ova-slider-desc">${slide.excerpt}</p>
          <a href="${slide.link || 'portfolio.html'}" ${slide.link && slide.link.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="ova-slider-btn">Read Story &rarr;</a>
        `;
      };

      if (typeof gsap !== 'undefined') {
        if (sliderTitle.children.length > 0) {
          gsap.to(sliderTitle.children, {
            y: -10,
            opacity: 0,
            duration: 0.22,
            stagger: 0.03,
            ease: "power2.in",
            onComplete: () => {
              renderHtml();
              gsap.fromTo(sliderTitle.children,
                { y: 14, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
              );
            }
          });
        } else {
          renderHtml();
          gsap.fromTo(sliderTitle.children,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
          );
        }
      } else {
        renderHtml();
      }
    }

    createIndices();

    // Touch swipe support for mobile
    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && activeSlide < slides.length - 1) {
          activeSlide++;
          animateNewSlide(activeSlide);
          if (scrollTriggerInstance) {
            const progress = activeSlide / (slides.length - 1);
            const targetScroll = scrollTriggerInstance.start + progress * (scrollTriggerInstance.end - scrollTriggerInstance.start);
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        } else if (diff < 0 && activeSlide > 0) {
          activeSlide--;
          animateNewSlide(activeSlide);
          if (scrollTriggerInstance) {
            const progress = activeSlide / (slides.length - 1);
            const targetScroll = scrollTriggerInstance.start + progress * (scrollTriggerInstance.end - scrollTriggerInstance.start);
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        }
      }
    }, { passive: true });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const pinDistance = window.innerHeight * (slides.length - 0.5);

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: sliderEl,
        start: "top top",
        end: `+=${pinDistance}px`,
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          if (progressBar) {
            gsap.set(progressBar, {
              scaleY: self.progress,
            });
          }

          const currentSlide = Math.min(
            slides.length - 1,
            Math.floor(self.progress * slides.length)
          );

          if (activeSlide !== currentSlide && currentSlide >= 0) {
            activeSlide = currentSlide;
            animateNewSlide(activeSlide);
          }
        },
      });
    }
  };

  initOvaSlider();

  // ─────────── CREW LIST OVERLAY (Meet the Team) ───────────
  const openCrewBtn = document.getElementById('openCrewList');
  const closeCrewBtn = document.getElementById('closeCrewList');
  const crewOverlay = document.getElementById('crewOverlay');

  const openCrewModal = () => {
    if (!crewOverlay) return;
    crewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lenis) {
      window.lenis.stop();
    }
  };

  const closeCrewModal = () => {
    if (!crewOverlay) return;
    crewOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (window.lenis) {
      window.lenis.start();
    }
  };

  if (openCrewBtn) {
    openCrewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCrewModal();
    });
  }

  // Also allow clicking on team photo strips or any team CTA
  document.querySelectorAll('.twa-team-btn, .twa-team-strips, a[href="#crew-list"]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openCrewModal();
    });
  });

  if (closeCrewBtn) {
    closeCrewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCrewModal();
    });
  }

  // Close when clicking directly on overlay background
  if (crewOverlay) {
    crewOverlay.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });

    crewOverlay.addEventListener('click', (e) => {
      if (e.target === crewOverlay) {
        closeCrewModal();
      }
    });
  }

  // Close overlay on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && crewOverlay && crewOverlay.classList.contains('active')) {
      closeCrewModal();
    }
  });

  // Open overlay if URL contains #crew-list
  if (window.location.hash === '#crew-list' && crewOverlay) {
    openCrewModal();
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#crew-list' && crewOverlay) {
      openCrewModal();
    }
  });

  // ─────────── CREW PHOTO LIGHTBOX MODAL ───────────
  const crewCards = document.querySelectorAll('.twa-crew-card');
  const crewLightbox = document.getElementById('crewLightbox');
  const lightboxImg = document.getElementById('crewLightboxImg');
  const lightboxName = document.getElementById('crewLightboxName');
  const lightboxRole = document.getElementById('crewLightboxRole');
  const lightboxNum = document.getElementById('crewLightboxNum');
  const lightboxCloseBtn = document.getElementById('crewLightboxClose');
  const lightboxBackdrop = document.getElementById('crewLightboxBackdrop');
  const lightboxPrev = document.getElementById('crewLightboxPrev');
  const lightboxNext = document.getElementById('crewLightboxNext');

  let currentCrewIdx = 0;
  const crewMembers = [];

  crewCards.forEach((card, idx) => {
    const member = {
      index: idx,
      name: card.getAttribute('data-name') || '',
      role: card.getAttribute('data-role') || '',
      img: card.getAttribute('data-img') || '',
    };
    crewMembers.push(member);

    card.addEventListener('click', () => {
      openCrewLightbox(idx);
    });
  });

  function openCrewLightbox(idx) {
    if (!crewLightbox || !crewMembers.length) return;
    currentCrewIdx = (idx + crewMembers.length) % crewMembers.length;
    const m = crewMembers[currentCrewIdx];
    if (lightboxImg) lightboxImg.src = m.img;
    if (lightboxName) lightboxName.textContent = m.name;
    if (lightboxRole) lightboxRole.textContent = `( ${m.role} )`;
    if (lightboxNum) lightboxNum.textContent = `${String(currentCrewIdx + 1).padStart(2, '0')} / ${String(crewMembers.length).padStart(2, '0')}`;
    crewLightbox.classList.add('active');
    if (window.lenis) window.lenis.stop();
  }

  function closeCrewLightbox() {
    if (crewLightbox) crewLightbox.classList.remove('active');
    if (window.lenis && (!crewOverlay || !crewOverlay.classList.contains('active'))) {
      window.lenis.start();
    }
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeCrewLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeCrewLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => openCrewLightbox(currentCrewIdx - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => openCrewLightbox(currentCrewIdx + 1));

  document.addEventListener('keydown', (e) => {
    if (crewLightbox && crewLightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeCrewLightbox();
      if (e.key === 'ArrowLeft') openCrewLightbox(currentCrewIdx - 1);
      if (e.key === 'ArrowRight') openCrewLightbox(currentCrewIdx + 1);
    }
  });

  // Touch Swipe for Mobile Lightbox Navigation
  let touchCrewStartX = 0;
  if (crewLightbox) {
    crewLightbox.addEventListener('touchstart', (e) => {
      touchCrewStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    crewLightbox.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchCrewStartX - touchEndX > 50) {
        openCrewLightbox(currentCrewIdx + 1);
      } else if (touchEndX - touchCrewStartX > 50) {
        openCrewLightbox(currentCrewIdx - 1);
      }
    }, { passive: true });
  }

})();
