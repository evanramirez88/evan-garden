/**
 * GSAP ScrollTrigger Animation System
 *
 * Provides premium scroll-driven animations for the digital garden.
 * All animations respect prefers-reduced-motion for accessibility.
 *
 * Animation Types:
 * - fade-up: Elements fade in while moving up (default, 70% of use cases)
 * - stagger: Children animate in sequence
 * - line-reveal: Horizontal lines scale in
 * - parallax: Background elements move at different scroll speeds
 */

// GSAP is loaded dynamically to avoid SSR issues
let gsap: any;
let ScrollTrigger: any;
let isInitialized = false;

/**
 * Dynamically load GSAP (only in browser)
 */
async function loadGSAP(): Promise<boolean> {
  if (isInitialized) return true;
  if (typeof window === 'undefined') return false;

  try {
    const gsapModule = await import('gsap');
    const scrollTriggerModule = await import('gsap/ScrollTrigger');

    gsap = gsapModule.gsap;
    ScrollTrigger = scrollTriggerModule.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);
    isInitialized = true;
    return true;
  } catch (e) {
    console.warn('Failed to load GSAP:', e);
    return false;
  }
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initialize all scroll-triggered animations
 * Call this on page load and after View Transitions
 */
export async function initScrollAnimations(): Promise<void> {
  // Load GSAP dynamically (browser only)
  const loaded = await loadGSAP();
  if (!loaded) return;

  // Respect reduced motion preference
  if (prefersReducedMotion()) {
    // Remove initial opacity/transform from animated elements
    gsap.set('[data-animate]', { clearProps: 'all' });
    return;
  }

  // Kill existing ScrollTriggers to prevent duplicates
  ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());

  // Initialize each animation type
  initFadeUp();
  initStagger();
  initLineReveal();
  initParallax();

  // Refresh ScrollTrigger to recalculate positions
  ScrollTrigger.refresh();
}

/**
 * Fade Up Animation
 * Elements fade in while moving up 30px
 */
function initFadeUp(): void {
  const elements = gsap.utils.toArray<Element>('[data-animate="fade-up"]');

  elements.forEach((el) => {
    // Set initial state
    gsap.set(el, { y: 30, opacity: 0 });

    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/**
 * Stagger Animation
 * Children of a parent animate in sequence
 */
function initStagger(): void {
  const parents = gsap.utils.toArray<Element>('[data-animate="stagger-parent"]');

  parents.forEach((parent) => {
    const children = parent.querySelectorAll('[data-animate="stagger-child"]');

    if (children.length === 0) return;

    // Set initial state for all children
    gsap.set(children, { y: 30, opacity: 0 });

    gsap.to(children, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: parent,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/**
 * Line Reveal Animation
 * Horizontal lines scale in from left
 */
function initLineReveal(): void {
  const elements = gsap.utils.toArray<Element>('[data-animate="line-reveal"]');

  elements.forEach((el) => {
    gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });

    gsap.to(el, {
      scaleX: 1,
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/**
 * Parallax Animation
 * Elements move at a fraction of scroll speed
 */
function initParallax(): void {
  const elements = gsap.utils.toArray<Element>('[data-animate="parallax"]');

  elements.forEach((el) => {
    const speed = parseFloat((el as HTMLElement).dataset.parallaxSpeed || '0.3');

    gsap.to(el, {
      y: () => -ScrollTrigger.maxScroll(window) * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  });
}

/**
 * Animate a single element on demand
 * Useful for dynamically added content
 */
export async function animateElement(
  element: Element,
  type: 'fade-up' | 'line-reveal' = 'fade-up'
): Promise<void> {
  const loaded = await loadGSAP();
  if (!loaded || prefersReducedMotion()) return;

  switch (type) {
    case 'fade-up':
      gsap.fromTo(
        element,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
      break;
    case 'line-reveal':
      gsap.fromTo(
        element,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }
      );
      break;
  }
}

/**
 * Cleanup ScrollTrigger instances
 * Call this before page transitions
 */
export function cleanupScrollAnimations(): void {
  if (!isInitialized || !ScrollTrigger) return;
  ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
}
