/* ============================================
   The Wedding Architect — VMPF-Style Interactions & Animations
   ============================================ */

const init = () => {

  const apiBase = window.location.protocol === 'file:' || window.location.port !== '3000'
    ? 'http://localhost:3000'
    : '';

  // ─────────────── Lenis Smooth Scroll ───────────────
  let lenis;
  try {
    lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    window.lenis = lenis;

    // Sync with GSAP ScrollTrigger ticker for buttery 60-120fps scrolling without lag
    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
      }
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  } catch (e) { console.warn('Lenis not loaded'); }

  // ─────────────── Preloader / Grid Landing Gate ───────────────
  const preloader = document.getElementById('preloader');
  const enterBtn = document.getElementById('enter-btn');
  const heroVideo = document.querySelector('.hero-video-bg video');

  if (heroVideo) {
    // Ensure video properties for strict browser autoplay policies
    heroVideo.muted = true;

    // Attempt to play immediately
    heroVideo.play().catch(err => console.warn('Autoplay initially prevented:', err));
  }

  if (preloader) {
    let hasEntered = false;
    try {
      hasEntered = sessionStorage.getItem('fosh_entered') === 'true';
    } catch (e) {
      console.warn('sessionStorage is not accessible:', e);
    }

    if (hasEntered) {
      preloader.style.display = 'none';
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();

      if (enterBtn) {
        enterBtn.textContent = 'ENTER';
        enterBtn.classList.add('ready');

        enterBtn.addEventListener('click', function () {
          try {
            sessionStorage.setItem('fosh_entered', 'true');
          } catch (e) {
            console.warn('sessionStorage is not accessible:', e);
          }
          preloader.classList.add('loaded');
          document.body.style.overflow = '';
          if (lenis) lenis.start();
          setTimeout(function () {
            preloader.style.display = 'none';
          }, 1500);
        });
      }
    }
  }

  // ─────────────── Custom Cursor ───────────────
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');

  if (cursor && cursorDot && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = document.querySelectorAll('a, button, .portfolio-item, .film-card, .blog-card, .service-card, .masonry-item, .nav-hamburger, .btn-vmpf, .carousel-slide');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
  }

  // ─────────────── Navigation (VMPF Style) ───────────────
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.nav-overlay');
  const overlayLinks = document.querySelectorAll('.nav-overlay-link');

  if (nav) {
    // On desktop, transition from transparent to solid on scroll
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > scrollThreshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });

    // On mobile (<=1024px), nav is always fixed/solid via CSS, skip scroll logic for dark class
  }

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });

    const observer = new MutationObserver(() => {
      overlayLinks.forEach((link, i) => {
        link.style.transitionDelay = overlay.classList.contains('open') ? `${0.1 + i * 0.08}s` : '0s';
      });
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });

    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─────────────── Page Transition Links ───────────────
  const pageTransition = document.querySelector('.page-transition');
  if (pageTransition) {
    pageTransition.style.display = 'none';
  }

  // ─────────────── Hero Text Split Animation ───────────────
  const heroTitle = document.querySelector('.home-hero-title');
  if (heroTitle) {
    const html = heroTitle.innerHTML;
    // Split by <br> tags to preserve line breaks
    const lines = html.split(/<br\s*\/?>/i);
    heroTitle.innerHTML = '';

    lines.forEach((line, li) => {
      const lineText = line.trim();
      const words = lineText.split(' ');

      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';

        word.split('').forEach((char, ci) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;
          charSpan.style.animationDelay = `${0.3 + (li * 0.4) + (wi * 0.12) + (ci * 0.04)}s`;
          wordSpan.appendChild(charSpan);
        });

        heroTitle.appendChild(wordSpan);

        if (wi < words.length - 1) {
          const space = document.createElement('span');
          space.innerHTML = '&nbsp;';
          space.className = 'char';
          space.style.animationDelay = `${0.3 + (li * 0.4) + (wi * 0.12) + (word.length * 0.04)}s`;
          heroTitle.appendChild(space);
        }
      });

      if (li < lines.length - 1) {
        heroTitle.appendChild(document.createElement('br'));
      }
    });
  }

  // ─────────────── Hero Scroll Animation (Luca Mori Style) ───────────────
  const heroWrapper = document.querySelector('.hero-scroll-wrapper');
  const heroBgCover = document.querySelector('.hero-bg-cover');
  const heroText = document.querySelector('.luca-hero-content');
  const mosaicItems = document.querySelectorAll('.mosaic-item');

  if (heroWrapper) {
    // Angles indicating direction for each mosaic item to fly off screen
    const angles = [
      -135, -90, -45,
      -170, 10,
      135, 90, 45
    ];

    const scrollHandler = () => {
      const rect = heroWrapper.getBoundingClientRect();
      const scrollDistance = rect.height - window.innerHeight;
      let progress = -rect.top / scrollDistance;
      progress = Math.max(0, Math.min(1, progress));

      // 1. Reveal Video by fading the cover
      if (heroBgCover) {
        let coverOpacity = 1;
        if (progress > 0.3) coverOpacity = 1 - ((progress - 0.3) / 0.4);
        heroBgCover.style.opacity = Math.max(0, Math.min(1, coverOpacity));
      }

      // 2. Text scales up and fades out
      if (heroText) {
        const textScale = 1 + (progress * 1.5);
        let textOpacity = 1;
        if (progress > 0.1) textOpacity = 1 - ((progress - 0.1) / 0.3);
        heroText.style.transform = `scale(${textScale})`;
        heroText.style.opacity = Math.max(0, Math.min(1, textOpacity));
      }

      // 3. Mosaic images move outward and scale up
      mosaicItems.forEach((item, i) => {
        const angle = angles[i % angles.length] * (Math.PI / 180);
        const moveDist = progress * window.innerWidth * 1.5;
        const scale = 1 + (progress * 3);
        const tx = Math.cos(angle) * moveDist;
        const ty = Math.sin(angle) * moveDist;

        let itemOpacity = 1;
        if (progress > 0.6) itemOpacity = 1 - ((progress - 0.6) / 0.3);

        item.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
        item.style.opacity = Math.max(0, Math.min(1, itemOpacity));
      });
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', scrollHandler, { passive: true });
    scrollHandler();
  }

  // ─────────────── Hero Background Slideshow ───────────────
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-slide-dot');
  let currentHeroSlide = 0;
  let heroSlideInterval;

  function showHeroSlide(index) {
    heroSlides.forEach(s => s.classList.remove('active'));
    heroDots.forEach(d => d.classList.remove('active'));
    if (heroSlides[index]) heroSlides[index].classList.add('active');
    if (heroDots[index]) heroDots[index].classList.add('active');
    currentHeroSlide = index;
  }

  if (heroSlides.length > 1) {
    heroSlideInterval = setInterval(() => {
      showHeroSlide((currentHeroSlide + 1) % heroSlides.length);
    }, 5000);

    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(heroSlideInterval);
        showHeroSlide(i);
        heroSlideInterval = setInterval(() => {
          showHeroSlide((currentHeroSlide + 1) % heroSlides.length);
        }, 5000);
      });
    });
  }

  // ─────────────── Full-Width Image Carousel (VMPF Swiper-Style) ───────────────
  const carouselTrack = document.getElementById('carousel-track');
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  let currentCarousel = 0;
  let carouselInterval;

  function goToCarouselSlide(index) {
    if (carouselSlides.length === 0) return;
    if (index < 0) index = carouselSlides.length - 1;
    if (index >= carouselSlides.length) index = 0;
    currentCarousel = index;

    if (carouselTrack) {
      carouselTrack.style.transform = `translateX(-${currentCarousel * 100}%)`;
    }

    carouselSlides.forEach(s => s.classList.remove('active'));
    if (carouselSlides[currentCarousel]) carouselSlides[currentCarousel].classList.add('active');
  }

  if (carouselSlides.length > 1) {
    goToCarouselSlide(0);
    carouselInterval = setInterval(() => {
      goToCarouselSlide(currentCarousel + 1);
    }, 5000);

    // Touch swipe for carousel
    const carouselEl = document.getElementById('image-carousel');
    if (carouselEl) {
      let touchStartX = 0, touchEndX = 0;
      carouselEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      carouselEl.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          clearInterval(carouselInterval);
          if (diff > 0) goToCarouselSlide(currentCarousel + 1);
          else goToCarouselSlide(currentCarousel - 1);
          carouselInterval = setInterval(() => goToCarouselSlide(currentCarousel + 1), 5000);
        }
      }, { passive: true });
    }
  }

  // ─────────────── TWF-Style Image Slider (Legacy, for subpages) ───────────────
  const sliderTrack = document.querySelector('.twf-slider-track');
  const slides = document.querySelectorAll('.twf-slide');
  const sliderDots = document.querySelectorAll('.twf-slider-dot');
  const prevBtn = document.querySelector('.twf-slider-prev');
  const nextBtn = document.querySelector('.twf-slider-next');
  let currentSlide = 0;
  let sliderInterval;

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    slides.forEach(s => s.classList.remove('active'));
    sliderDots.forEach(d => d.classList.remove('active'));
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (sliderDots[currentSlide]) sliderDots[currentSlide].classList.add('active');
  }

  function startSliderAuto() {
    sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  function resetSliderAuto() {
    clearInterval(sliderInterval);
    startSliderAuto();
  }

  if (slides.length > 0) {
    goToSlide(0);
    startSliderAuto();

    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetSliderAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetSliderAuto(); });

    sliderDots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goToSlide(i); resetSliderAuto(); });
    });

    // Touch/swipe
    let touchStartX = 0, touchEndX = 0;
    const slider = document.querySelector('.twf-slider');
    if (slider) {
      slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goToSlide(currentSlide + 1);
          else goToSlide(currentSlide - 1);
          resetSliderAuto();
        }
      }, { passive: true });
    }
  }

  // ─────────────── Scroll Reveal ───────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));


  // ─────────────── Counter Animation ───────────────
  const counters = document.querySelectorAll('.about-stat-number');
  let counterAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counterAnimated) {
        counterAnimated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-count'));
          const suffix = counter.getAttribute('data-suffix') || '';
          let current = 0;
          const increment = target / 60;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            counter.textContent = Math.floor(current) + suffix;
          }, 25);
        });
      }
    });
  }, { threshold: 0.2 });
  counters.forEach(c => counterObserver.observe(c));

  // ─────────────── Contact Form ───────────────
  const showFormNotification = (message, type = 'info') => {
    let container = document.getElementById('form-notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'form-notification-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `form-toast form-toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Animate out
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4500);
  };

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.fs-form-submit') || contactForm.querySelector('.tbt-form-submit') || contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'SUBMIT';

      // Extract form values
      const firstNameVal = document.getElementById('first-name')?.value.trim() || '';
      const lastNameVal = document.getElementById('last-name')?.value.trim() || '';
      const fullName = `${firstNameVal} ${lastNameVal}`.trim();

      const emailVal = document.getElementById('email')?.value.trim() || '';
      const phoneVal = document.getElementById('phone')?.value.trim() || '';
      const subjectVal = document.getElementById('subject')?.value.trim() || '';
      const sourceVal = document.getElementById('source')?.value || '';
      const weddingDatesVal = document.getElementById('wedding-dates')?.value.trim() || '';
      const weddingLocationVal = document.getElementById('wedding-location')?.value.trim() || '';
      const eventsDetailsVal = document.getElementById('events-details')?.value.trim() || '';

      // Client-side validations
      if (!firstNameVal || !lastNameVal) {
        showFormNotification('Please enter your first name and last name.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        showFormNotification('Please enter a valid email address.', 'error');
        return;
      }

      const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(phoneVal)) {
        showFormNotification('Please enter a valid phone number (at least 7 digits).', 'error');
        return;
      }

      if (!subjectVal) {
        showFormNotification('Please enter a subject.', 'error');
        return;
      }

      if (!weddingDatesVal || !weddingLocationVal || !eventsDetailsVal) {
        showFormNotification('Please fill out all required fields.', 'error');
        return;
      }

      // Honeypot check for spam prevention
      const botcheck = contactForm.querySelector('input[name="botcheck"]')?.checked;
      const honeypotVal = document.getElementById('website')?.value;
      if (botcheck || honeypotVal) {
        console.warn('Spam detected via honeypot');
        showFormNotification('Enquiry submitted successfully.', 'success');
        contactForm.reset();
        return;
      }

      // Update button state
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      // Construct formatted Web3Forms payload
      const payload = {
        access_key: 'a0a25b27-9de5-4ec4-827c-238840331571',
        from_name: 'The Wedding Architect Website',
        subject: `New Wedding Enquiry: ${fullName} — ${subjectVal}`,
        name: fullName,
        email: emailVal,
        replyto: emailVal,
        phone: phoneVal,
        'Subject / Purpose': subjectVal,
        'Referral Source': sourceVal || 'N/A',
        'Wedding Dates': weddingDatesVal,
        'Wedding Location': weddingLocationVal,
        'Events & Timings': eventsDetailsVal,
        message: `=== NEW WEDDING ENQUIRY ===\n\n• Name: ${fullName}\n• Email: ${emailVal}\n• Phone: ${phoneVal}\n• Subject: ${subjectVal}\n• How Did You Hear: ${sourceVal || 'N/A'}\n• Wedding Dates: ${weddingDatesVal}\n• Wedding Location: ${weddingLocationVal}\n\n• Events & Guest Details:\n${eventsDetailsVal}\n\n---\nSent from The Wedding Architect Contact Page`
      };

      // Submit to Web3Forms API
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          const json = await response.json();
          if (response.status === 200 && json.success) {
            // Hide contact form
            contactForm.style.display = 'none';

            // Show inline success card directly on page
            const successMsg = document.getElementById('form-success-message');
            if (successMsg) {
              successMsg.style.display = 'flex';
              successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            showFormNotification('Enquiry submitted successfully! We will get back to you soon.', 'success');

            // Reset submit button state & form
            if (submitBtn) {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            }
            contactForm.reset();
          } else {
            throw new Error(json.message || 'Form submission failed');
          }
        })
        .catch(error => {
          console.error('Error submitting enquiry via Web3Forms:', error);

          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }

          showFormNotification(error.message || 'Unable to submit enquiry. Please check your network connection and try again.', 'error');
        });
    });

    // Wire up "Go Back" button on success card
    const sendAnotherBtn = document.getElementById('send-another-btn');
    if (sendAnotherBtn) {
      sendAnotherBtn.addEventListener('click', () => {
        const successMsg = document.getElementById('form-success-message');
        if (successMsg) successMsg.style.display = 'none';
        contactForm.style.display = 'flex';
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  // ─────────────── Fullscreen Image Lightbox ───────────────
  const imageLightbox = document.getElementById('lightbox-modal');
  const lightboxTrack = document.getElementById('lightbox-track');
  let lightboxSlides = [];
  let currentLightboxSlideIndex = 0;

  function showSlide(index) {
    lightboxSlides.forEach((slide, i) => {
      if (i === index) slide.classList.add('active');
      else slide.classList.remove('active');
    });
  }

  function nextSlide() {
    if (lightboxSlides.length <= 1) return;
    currentLightboxSlideIndex = (currentLightboxSlideIndex + 1) % lightboxSlides.length;
    showSlide(currentLightboxSlideIndex);
  }

  function prevSlide() {
    if (lightboxSlides.length <= 1) return;
    currentLightboxSlideIndex = (currentLightboxSlideIndex - 1 + lightboxSlides.length) % lightboxSlides.length;
    showSlide(currentLightboxSlideIndex);
  }

  function openLightbox(index, imageUrls) {
    if (!lightboxTrack || !imageLightbox) return;
    lightboxTrack.innerHTML = '';
    lightboxSlides = [];

    imageUrls.forEach((url, i) => {
      const slide = document.createElement('div');
      slide.className = 'lightbox-slide';
      const img = document.createElement('img');
      img.src = url.trim();
      img.alt = `Gallery Image ${i + 1}`;
      slide.appendChild(img);
      lightboxTrack.appendChild(slide);
      lightboxSlides.push(slide);
    });

    currentLightboxSlideIndex = index;
    showSlide(currentLightboxSlideIndex);

    imageLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    document.addEventListener('keydown', handleKeyDown);
  }

  function closeLightbox() {
    if (!imageLightbox) return;
    imageLightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    document.removeEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      if (lightboxTrack) lightboxTrack.innerHTML = '';
      lightboxSlides = [];
    }, 500);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
    else if (e.key === 'Escape') closeLightbox();
  }

  if (imageLightbox && lightboxTrack) {
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
      item.addEventListener('click', () => {
        const imagesStr = item.getAttribute('data-gallery-images');
        if (imagesStr) {
          const imageUrls = imagesStr.split(',');
          openLightbox(0, imageUrls);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    imageLightbox.addEventListener('click', (e) => {
      if (e.target === imageLightbox || e.target.classList.contains('lightbox-content-container') || e.target === lightboxTrack) {
        closeLightbox();
      }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    imageLightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    imageLightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, { passive: true });
  }

  // ─────────────── Video Lightbox ───────────────
  const filmCards = document.querySelectorAll('.film-card');
  const videoLightbox = document.getElementById('lightbox-modal');
  const videoWrapper = document.getElementById('lightbox-video-wrapper');

  if (videoLightbox && videoWrapper && !lightboxTrack) {
    const closeBtn = document.getElementById('lightbox-close');

    function openVideo(url) {
      let finalUrl = url;
      if (url.includes('vimeo.com')) {
        finalUrl = url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Automatically extract the YouTube ID and convert it to a playable embed URL
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
          videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('/embed/')) {
          videoId = url.split('/embed/')[1].split('?')[0];
        }

        if (videoId) {
          finalUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        } else {
          finalUrl = url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
        }
      }

      videoWrapper.innerHTML = `
        <iframe src="${finalUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      `;

      videoLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      document.addEventListener('keydown', handleKeyDown);
    }

    function closeVideo() {
      videoLightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      document.removeEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        videoWrapper.innerHTML = '';
      }, 500);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') closeVideo();
    }

    filmCards.forEach(card => {
      card.addEventListener('click', () => {
        const videoUrl = card.getAttribute('data-video-url');
        if (videoUrl) openVideo(videoUrl);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeVideo);

    videoLightbox.addEventListener('click', (e) => {
      if (e.target === videoLightbox || e.target.classList.contains('lightbox-content-container')) {
        closeVideo();
      }
    });
  }

  // ─────────────── Masonry Grid Lightbox ───────────────
  const masonryItems = document.querySelectorAll('.masonry-item');
  if (masonryItems.length > 0) {
    masonryItems.forEach((item, idx) => {
      item.addEventListener('click', () => {
        // Collect all masonry image URLs
        const allUrls = [];
        masonryItems.forEach(mi => {
          const img = mi.querySelector('img');
          if (img) allUrls.push(img.src);
        });
        openLightbox(idx, allUrls);
      });
    });
  }

  // ─────────────── Back to Top ───────────────
  const backTop = document.getElementById('back-to-top');
  if (backTop) {
    backTop.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─────────────── Smooth scroll anchors ───────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offsetVal = window.innerWidth > 1024 ? 0 : -70;
          if (lenis) lenis.scrollTo(target, { offset: offsetVal });
          else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (err) {
        console.warn('Invalid anchor selector:', href, err);
      }
    });
  });

  // ─────────────── Photo Wall Horizontal Scroll ───────────────
  const wallContainer = document.getElementById('photo-wall-container');
  const wallPrev = document.getElementById('wall-prev');
  const wallNext = document.getElementById('wall-next');

  if (wallContainer && wallPrev && wallNext) {
    wallPrev.addEventListener('click', () => {
      const scrollAmount = window.innerWidth * 0.8;
      wallContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    wallNext.addEventListener('click', () => {
      const scrollAmount = window.innerWidth * 0.8;
      wallContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Custom cursor support if available
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      const addHover = () => cursor.classList.add('cursor-hover');
      const removeHover = () => cursor.classList.remove('cursor-hover');

      wallPrev.addEventListener('mouseenter', addHover);
      wallPrev.addEventListener('mouseleave', removeHover);
      wallNext.addEventListener('mouseenter', addHover);
      wallNext.addEventListener('mouseleave', removeHover);
    }
  }

  // ─────────────── Split Services Menu Hover logic ───────────────
  const splitServicesSection = document.getElementById('split-services-section');
  if (splitServicesSection) {
    const menuItems = splitServicesSection.querySelectorAll('.split-menu-item');
    const bgImages = splitServicesSection.querySelectorAll('.split-bg-image');

    const setActiveBg = (serviceName) => {
      bgImages.forEach(img => {
        if (img.getAttribute('data-bg') === serviceName) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      });
    };

    menuItems.forEach(item => {
      const service = item.getAttribute('data-service');

      item.addEventListener('mouseenter', () => {
        setActiveBg(service);
      });

      item.addEventListener('mouseleave', () => {
        setActiveBg('default');
      });

      // Support for custom cursor if available
      const cursor = document.querySelector('.custom-cursor');
      if (cursor) {
        item.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
      }
    });
  }

  // ─────────────── Featured Stories Slider ───────────────
  const storySlides = document.querySelectorAll('.story-slide');
  const storyPrev = document.getElementById('story-prev');
  const storyNext = document.getElementById('story-next');

  if (storySlides.length > 0 && storyPrev && storyNext) {
    let currentSlideIndex = 0;

    const showSlide = (index) => {
      storySlides.forEach((slide, idx) => {
        if (idx === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    };

    storyPrev.addEventListener('click', () => {
      currentSlideIndex = (currentSlideIndex - 1 + storySlides.length) % storySlides.length;
      showSlide(currentSlideIndex);
    });

    storyNext.addEventListener('click', () => {
      currentSlideIndex = (currentSlideIndex + 1) % storySlides.length;
      showSlide(currentSlideIndex);
    });

    // Support for custom cursor if available
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      const addHover = () => cursor.classList.add('cursor-hover');
      const removeHover = () => cursor.classList.remove('cursor-hover');

      storyPrev.addEventListener('mouseenter', addHover);
      storyPrev.addEventListener('mouseleave', removeHover);
      storyNext.addEventListener('mouseenter', addHover);
      storyNext.addEventListener('mouseleave', removeHover);

      const slideBtns = document.querySelectorAll('.story-btn');
      slideBtns.forEach(btn => {
        btn.addEventListener('mouseenter', addHover);
        btn.addEventListener('mouseleave', removeHover);
      });
    }
  }

  // ─────────────── Portfolio Page Stories Slider ───────────────
  const portfolioPrev = document.getElementById('portfolio-prev');
  const portfolioNext = document.getElementById('portfolio-next');
  const portfolioSlides = document.querySelectorAll('.portfolio-slider-section .story-slide');

  if (portfolioSlides.length > 0 && portfolioPrev && portfolioNext) {
    let currentPortfolioSlideIndex = 0;

    const showPortfolioSlide = (index) => {
      portfolioSlides.forEach((slide, idx) => {
        if (idx === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    };

    portfolioPrev.addEventListener('click', () => {
      currentPortfolioSlideIndex = (currentPortfolioSlideIndex - 1 + portfolioSlides.length) % portfolioSlides.length;
      showPortfolioSlide(currentPortfolioSlideIndex);
    });

    portfolioNext.addEventListener('click', () => {
      currentPortfolioSlideIndex = (currentPortfolioSlideIndex + 1) % portfolioSlides.length;
      showPortfolioSlide(currentPortfolioSlideIndex);
    });

    // Support for custom cursor if available
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      const addHover = () => cursor.classList.add('cursor-hover');
      const removeHover = () => cursor.classList.remove('cursor-hover');

      portfolioPrev.addEventListener('mouseenter', addHover);
      portfolioPrev.addEventListener('mouseleave', removeHover);
      portfolioNext.addEventListener('mouseenter', addHover);
      portfolioNext.addEventListener('mouseleave', removeHover);
    }
  }

  // Explore Gallery buttons on the portfolio slider - Open in a new tab/page
  const portfolioTriggerBtns = document.querySelectorAll('.portfolio-trigger-btn');
  portfolioTriggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const slide = btn.closest('.story-slide');
      const slideIndex = slide ? slide.getAttribute('data-slide-index') : '0';
      const title = slide ? slide.querySelector('.story-title-middle').textContent : 'Featured Gallery';

      const folderMap = {
        '0': 'folder_1',
        '1': 'folder_2',
        '2': 'folder_3',
        '3': 'folder_4',
        '4': 'folder_1',
        '5': 'folder_2'
      };
      const folder = folderMap[slideIndex] || 'folder_1';

      // Save images list in sessionStorage as a local fallback
      const imagesStr = btn.getAttribute('data-gallery-images') || '';
      sessionStorage.setItem('current_gallery_images', imagesStr);

      const targetUrl = `gallery.html?folder=${folder}&title=${encodeURIComponent(title)}`;
      const pageTransition = document.querySelector('.page-transition');
      if (pageTransition) {
        pageTransition.classList.remove('loaded');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 750);
      } else {
        window.location.href = targetUrl;
      }
    });

    // Support for custom cursor if available
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      btn.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      btn.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    }
  });

  // ─────────────── Dedicated Gallery Page Dynamic Loading ───────────────
  const galleryPageGrid = document.getElementById('gallery-page-grid');
  if (galleryPageGrid) {
    const urlParams = new URLSearchParams(window.location.search);
    const folder = urlParams.get('folder') || 'folder_1';
    const rawTitle = urlParams.get('title') || 'Featured Gallery';

    // Update document title
    document.title = `${rawTitle} — The Wedding Architect`;

    const titleEl = document.getElementById('gallery-page-title');
    if (titleEl) titleEl.textContent = rawTitle;

    const countEl = document.getElementById('gallery-page-count');
    const loadingEl = document.getElementById('gallery-page-loading');

    // Retrieve fallback images from sessionStorage
    const localImagesStr = sessionStorage.getItem('current_gallery_images');
    const localImages = localImagesStr ? localImagesStr.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

    const renderGallery = (images) => {
      if (loadingEl) loadingEl.style.display = 'none';
      if (countEl) countEl.textContent = `${images.length} Photos`;

      galleryPageGrid.innerHTML = '';

      images.forEach((imgUrl, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-page-item';
        item.style.animationDelay = `${index * 0.03}s`;

        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = `${rawTitle} - Photo ${index + 1}`;
        img.loading = 'lazy';

        item.appendChild(img);
        galleryPageGrid.appendChild(item);

        // Open full-screen lightbox slideshow when clicked
        item.addEventListener('click', () => {
          openLightbox(index, images);
        });

        // Support for custom cursor if available
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
          item.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
          item.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        }
      });
    };

    // Fetch with apiBase. Fallback to local images on failure.
    fetch(`${apiBase}/api/gallery/${folder}`)
      .then(res => {
        if (!res.ok) throw new Error('API server returned error');
        return res.json();
      })
      .then(data => {
        if (data.success && data.images && data.images.length > 0) {
          renderGallery(data.images);
        } else {
          if (localImages.length > 0) {
            renderGallery(localImages);
          } else {
            if (loadingEl) loadingEl.textContent = 'No photos found in this gallery.';
          }
        }
      })
      .catch(err => {
        console.warn('Error fetching gallery from server, falling back to local images:', err);
        if (localImages.length > 0) {
          renderGallery(localImages);
        } else {
          if (loadingEl) loadingEl.textContent = 'Failed to load gallery. Please check if the local server is running.';
        }
      });
  }

  // ─────────────── HOTC Film Video Lightbox ───────────────
  const hotcFilmCards = document.querySelectorAll('.hotc-film-card');
  if (hotcFilmCards.length > 0) {
    hotcFilmCards.forEach(card => {
      card.addEventListener('click', () => {
        const videoUrl = card.getAttribute('data-video-url');
        if (!videoUrl) return;

        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'hotc-video-modal';
        modal.style.cssText = `
          position: fixed; inset: 0; z-index: 100000;
          background: rgba(0, 0, 0, 0.92); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.4s ease; padding: 40px 20px;
        `;

        modal.innerHTML = `
          <div style="position: absolute; top: 25px; right: 30px; cursor: pointer; color: #fff; font-size: 32px; font-weight: 300; z-index: 100001; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 50%;" class="modal-close-btn">&times;</div>
          <div style="width: 100%; max-width: 1000px; aspect-ratio: 16/9; box-shadow: 0 20px 60px rgba(0,0,0,0.8); border-radius: 8px; overflow: hidden; background: #000;">
            <iframe src="${videoUrl}?autoplay=1&title=0&byline=0&portrait=0" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
          </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
          modal.style.opacity = '1';
        });

        const closeModal = () => {
          modal.style.opacity = '0';
          setTimeout(() => {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
            document.body.style.overflow = '';
          }, 400);
        };

        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal();
        });

        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeyDown);
          }
        };
        document.addEventListener('keydown', handleKeyDown);
      });
    });
  }

};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
