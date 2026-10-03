// lib/gsapUtils.ts
// Reusable GSAP animation utilities for Dhaaga-E-Jashn

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** Reveal element upward on scroll */
export function revealUp(
  target: Element | Element[] | string,
  options?: {
    delay?: number
    duration?: number
    yOffset?: number
    trigger?: Element | string
    start?: string
    stagger?: number
  }
) {
  const {
    delay = 0,
    duration = 1.1,
    yOffset = 48,
    trigger,
    start = 'top 82%',
    stagger = 0,
  } = options ?? {}

  return gsap.fromTo(
    target,
    { opacity: 0, y: yOffset },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: trigger
        ? {
            trigger,
            start,
            once: true,
          }
        : undefined,
    }
  )
}

/** Reveal element by fading in on scroll */
export function revealFade(
  target: Element | Element[] | string,
  options?: {
    delay?: number
    duration?: number
    trigger?: Element | string
    start?: string
    stagger?: number
  }
) {
  const { delay = 0, duration = 1, trigger, start = 'top 82%', stagger = 0 } =
    options ?? {}

  return gsap.fromTo(
    target,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: 'power2.out',
      scrollTrigger: trigger
        ? { trigger, start, once: true }
        : undefined,
    }
  )
}

/** Reveal text with clip path mask */
export function revealClip(
  target: Element | Element[] | string,
  options?: {
    delay?: number
    duration?: number
    trigger?: Element | string
    start?: string
  }
) {
  const { delay = 0, duration = 1.2, trigger, start = 'top 80%' } =
    options ?? {}

  return gsap.fromTo(
    target,
    { clipPath: 'inset(0 0 100% 0)', y: 20, opacity: 0 },
    {
      clipPath: 'inset(0 0 0% 0)',
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: 'power4.out',
      scrollTrigger: trigger
        ? { trigger, start, once: true }
        : undefined,
    }
  )
}

/** Image parallax on scroll */
export function imageParallax(
  target: Element | string,
  options?: {
    trigger?: Element | string
    yPercent?: number
  }
) {
  const { trigger, yPercent = -15 } = options ?? {}

  return gsap.to(target, {
    yPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: trigger ?? target,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    },
  })
}

/** Gold ornament subtle rotate + float */
export function ornamentFloat(
  target: Element | string,
  options?: { duration?: number; delay?: number }
) {
  const { duration = 6, delay = 0 } = options ?? {}
  return gsap.to(target, {
    rotation: 8,
    y: -8,
    duration,
    delay,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}
