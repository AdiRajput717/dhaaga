'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, ScrollTrigger } from '@/lib/gsapUtils'

gsap.registerPlugin(ScrollTrigger)

// Gold 4-petal brandmark SVG (inline, matching brand identity)
function BrandmarkInline({ size = 80, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={{ opacity }}
      aria-hidden
    >
      {/* Petal top */}
      <path d="M50 50 C50 50 44 30 50 15 C56 30 50 50 50 50Z" fill="#C99A3D" />
      {/* Petal bottom */}
      <path d="M50 50 C50 50 56 70 50 85 C44 70 50 50 50 50Z" fill="#C99A3D" />
      {/* Petal left */}
      <path d="M50 50 C50 50 30 44 15 50 C30 56 50 50 50 50Z" fill="#C99A3D" />
      {/* Petal right */}
      <path d="M50 50 C50 50 70 56 85 50 C70 44 50 50 50 50Z" fill="#C99A3D" />
      {/* Center circle */}
      <circle cx="50" cy="50" r="5" fill="#C99A3D" />
    </svg>
  )
}

// Gold decorative corner element
function GoldCorner({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      aria-hidden
    >
      <path
        d="M4 76 L4 4 L76 4"
        stroke="#C99A3D"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <circle cx="4" cy="4" r="2.5" fill="#C99A3D" opacity="0.8" />
      <path
        d="M14 66 L14 14 L66 14"
        stroke="#C99A3D"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />
    </svg>
  )
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const hindiRef = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const ornamentRef = useRef<HTMLDivElement>(null)
  const cornerTLRef = useRef<HTMLDivElement>(null)
  const cornerBRRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (
      !eyebrowRef.current ||
      !titleRef.current ||
      !hindiRef.current ||
      !subtitleRef.current ||
      !ctaRef.current ||
      !ornamentRef.current
    )
      return

    // Check for reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      ;[eyebrowRef, titleRef, hindiRef, subtitleRef, ctaRef, ornamentRef].forEach((r) => {
        if (r.current) {
          r.current.style.opacity = '1'
          r.current.style.transform = 'none'
        }
      })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Sequence: eyebrow → title → hindi → subtitle → cta → ornament
      tl.fromTo(eyebrowRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.3)
        .fromTo(titleRef.current, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 }, 0.55)
        .fromTo(hindiRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 0.85)
        .fromTo(subtitleRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 1.05)
        .fromTo(ctaRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.3)
        .fromTo(ornamentRef.current, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 1.2 }, 0.8)

      // Corners
      if (cornerTLRef.current && cornerBRRef.current) {
        tl.fromTo(
          [cornerTLRef.current, cornerBRRef.current],
          { opacity: 0 },
          { opacity: 1, duration: 1, stagger: 0.2 },
          0.5
        )
      }

      // Floating ornament animation
      if (ornamentRef.current) {
        gsap.to(ornamentRef.current, {
          y: -12,
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2,
        })
        gsap.to(ornamentRef.current, {
          rotation: 5,
          duration: 7,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1,
        })
      }

      // Thread SVG draw
      if (threadRef.current) {
        gsap.fromTo(
          threadRef.current,
          { strokeDashoffset: 900 },
          { strokeDashoffset: 0, duration: 3.5, ease: 'power2.out', delay: 1 }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="hero-section" id="top">
      {/* Background image */}
      <div className="hero-bg-overlay" />
      <div className="hero-texture" />

      {/* Corner ornaments */}
      <div
        ref={cornerTLRef}
        style={{ position: 'absolute', top: 32, left: 32, zIndex: 3, opacity: 0 }}
      >
        <GoldCorner />
      </div>
      <div
        ref={cornerBRRef}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          zIndex: 3,
          opacity: 0,
          transform: 'rotate(180deg)',
        }}
      >
        <GoldCorner />
      </div>

      {/* Thread decoration */}
      <svg
        style={{
          position: 'absolute',
          right: 0,
          bottom: '15%',
          width: 'min(36vw, 480px)',
          zIndex: 2,
          opacity: 0.6,
        }}
        viewBox="0 0 400 120"
        aria-hidden
      >
        <path
          ref={threadRef}
          d="M0 90C80 90 90 20 170 30s90 70 160 20c30-22 50-26 70-10"
          fill="none"
          stroke="#C99A3D"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset="900"
        />
        <circle cx="400" cy="40" r="3" fill="#C99A3D" opacity="0.9" />
      </svg>

      {/* Main content */}
      <div className="hero-content">
        <div>
          {/* Eyebrow */}
          <div ref={eyebrowRef} className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <span className="hero-eyebrow-text">
              ROOTED IN TRADITION · DESIGNED FOR TODAY
            </span>
            <div className="hero-eyebrow-line" />
          </div>

          {/* Brand name */}
          <h1 ref={titleRef} className="hero-title">
            DHAAGA-E
            <br />
            <span style={{ color: '#C99A3D' }}>JASHN</span>
          </h1>

          {/* Hindi name */}
          <p ref={hindiRef} className="hero-title-hindi">
            धागा-ए-जश्न
          </p>

          {/* Subtitle */}
          <p ref={subtitleRef} className="hero-subtitle">
            Where every thread tells a story of celebration,
            craft, and the timeless beauty of Indian textile heritage.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="hero-cta-group">
            <Link href="#new" className="btn-primary">
              EXPLORE COLLECTION
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="#story" className="btn-outline-light">
              OUR STORY
            </Link>
          </div>
        </div>

        {/* Right side ornament */}
        <div ref={ornamentRef} className="hero-ornament-side relative left-[220px]" style={{ opacity: 0 }}>
          <Image
            src="/images/brandmark.png"
            alt="Dhaaga-e-Jashn brandmark"
            width={160}
            height={160}
            style={{ filter: 'drop-shadow(0 0 24px rgba(201,154,61,0.25))' }}
          />

          {/* Decorative vertical text */}
          <div
            style={{
              writingMode: 'vertical-rl',
              letterSpacing: '0.3em',
              fontSize: 10,
              color: 'rgba(201,154,61,0.5)',
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              userSelect: 'none',
            }}
          >
            DHAAGA-E-JASHN · 2026 ·
          </div>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'rgba(201,154,61,0.6)',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 500,
          }}
        >
          SCROLL
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, rgba(201,154,61,0.6), transparent)',
          }}
        />
      </div>
    </section>
  )
}
