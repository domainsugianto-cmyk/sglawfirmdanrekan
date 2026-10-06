'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './AboutMediaSlider.module.css';

export default function AboutMediaSlider({ media }) {
  const [slideIndex, setSlideIndex] = useState(media.length > 1 ? 1 : 0);
  const [animateSlide, setAnimateSlide] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeIndex = media.length > 1
    ? (slideIndex - 1 + media.length) % media.length
    : 0;
  const activeMedia = media[activeIndex];
  const slides = media.length > 1
    ? [media[media.length - 1], ...media, media[0]]
    : media;

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(motionPreference.matches);

    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (media.length < 2 || isPaused || prefersReducedMotion || activeMedia.type === 'video') return;

    const timer = window.setTimeout(() => {
      setAnimateSlide(true);
      setSlideIndex(index => index + 1);
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [activeIndex, activeMedia.type, isPaused, media.length, prefersReducedMotion]);

  const showMedia = index => {
    setAnimateSlide(true);
    setSlideIndex(index + 1);
  };

  const handleSlideTransitionEnd = event => {
    if (event.target !== event.currentTarget || media.length < 2) return;
    if (slideIndex === 0 || slideIndex === media.length + 1) {
      setAnimateSlide(false);
      setSlideIndex(slideIndex === 0 ? media.length : 1);
    }
  };

  return (
    <div
      className={styles.slider}
      role="region"
      aria-roledescription="carousel"
      aria-label="Media tentang SG Law Firm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div
        className={`${styles.track} ${animateSlide && !prefersReducedMotion ? styles.animatedTrack : ''}`}
        style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        onTransitionEnd={handleSlideTransitionEnd}
      >
        {slides.map((item, index) => {
          const isActive = index === slideIndex;
          return (
            <div className={styles.frame} key={`${item.src}-${index}`} aria-hidden={!isActive}>
              {item.type === 'video' ? (
                <video
                  className={styles.media}
                  src={item.src}
                  aria-label={item.alt || 'Video SG Law Firm'}
                  autoPlay={isActive && !prefersReducedMotion}
                  muted
                  playsInline
                  controls={isActive}
                  preload={isActive ? 'auto' : 'none'}
                  onEnded={() => media.length > 1 && !isPaused && showMedia(activeIndex + 1)}
                />
              ) : (
                <Image
                  className={styles.media}
                  src={item.src}
                  alt={item.alt || 'Media SG Law Firm'}
                  fill
                  priority={index === 1 || (media.length === 1 && index === 0)}
                  sizes="(max-width: 992px) 100vw, 50vw"
                  style={{ objectFit: item.fit === 'contain' ? 'contain' : 'cover' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {media.length > 1 && (
        <>
          <div className={styles.navigation}>
            <button type="button" onClick={() => showMedia(activeIndex - 1)} aria-label="Media sebelumnya">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" onClick={() => showMedia(activeIndex + 1)} aria-label="Media berikutnya">
              <span aria-hidden="true">›</span>
            </button>
          </div>
          <div className={styles.indicators} aria-label={`Media ${activeIndex + 1} dari ${media.length}`}>
            {media.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                className={index === activeIndex ? styles.activeIndicator : ''}
                onClick={() => showMedia(index)}
                aria-label={`Tampilkan media ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>
          {!prefersReducedMotion && activeMedia.type !== 'video' && (
            <button
              type="button"
              className={styles.pauseButton}
              onClick={() => setIsPaused(paused => !paused)}
              aria-label={isPaused ? 'Putar slideshow' : 'Jeda slideshow'}
            >
              {isPaused ? 'Putar' : 'Jeda'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
