'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/data'
import { gsap } from '@/lib/gsapUtils'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bagCount, setBagCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileLinksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen for bag updates
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail
      setBagCount(detail)
    }
    window.addEventListener('dhaaga:bagupdate', handler)
    return () => window.removeEventListener('dhaaga:bagupdate', handler)
  }, [])

  // Listen for search open request
  useEffect(() => {
    const handler = () => setSearchOpen(true)
    window.addEventListener('dhaaga:opensearch', handler)
    return () => window.removeEventListener('dhaaga:opensearch', handler)
  }, [])

  // GSAP mobile menu animation
  useEffect(() => {
    if (!mobileMenuRef.current || !mobileLinksRef.current) return

    const links = mobileLinksRef.current.querySelectorAll('a')

    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      gsap.fromTo(
        mobileMenuRef.current,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power4.out' }
      )
      gsap.fromTo(
        links,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, delay: 0.2, ease: 'power3.out' }
      )
    } else {
      document.body.style.overflow = ''
      gsap.to(mobileMenuRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.4,
        ease: 'power3.in',
      })
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Announcement bar */}
      <div className="announce-bar">
        CRAFTED FOR EVERYDAY JASHN &nbsp;·&nbsp; FREE SHIPPING ON ORDERS ABOVE ₹1499
      </div>

      {/* Main Navbar */}
      <header
        ref={navRef}
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        id="nav"
      >
        {/* Burger */}
        <button
          className={`burger-btn ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo */}
        <Link href="#top" className="nav-logo-wrap" aria-label="Dhaaga-e-Jashn home">
          <Image
            src="/images/logo.png"
            alt="Dhaaga-e-Jashn"
            width={126}
            height={48}
            className="nav-logo-full"
            priority
          />
          <Image
            src="/images/brandmark.png"
            alt=""
            width={40}
            height={40}
            className="nav-logo-mark"
            aria-hidden
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Primary navigation">
          <ul className="nav-menu" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {/* Search */}
          <button
            className="icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-5-5" />
            </svg>
          </button>

          {/* Wishlist */}
          <button className="icon-btn hide-mobile" aria-label="Wishlist">
            <svg viewBox="0 0 24 24">
              <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
            </svg>
          </button>

          {/* Account */}
          <button className="icon-btn hide-mobile" aria-label="Account">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
            </svg>
          </button>

          {/* Bag */}
          <button className="icon-btn" aria-label={`Shopping bag, ${bagCount} items`}>
            <svg viewBox="0 0 24 24">
              <path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0" />
            </svg>
            {bagCount > 0 && (
              <span className="bag-count">{bagCount}</span>
            )}
          </button>

          <Link href="#new" className="nav-cta">
            SHOP NOW
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        style={{ clipPath: 'inset(0 0 100% 0)' }}
        role="dialog"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <button
          className="mobile-menu-close"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          ✕
        </button>

        {/* Gold ornament */}
        <div style={{ marginBottom: 40, opacity: 0.5 }}>
          <Image
            src="/images/brandmark.png"
            alt=""
            width={48}
            height={48}
            aria-hidden
          />
        </div>

        <nav ref={mobileLinksRef} aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="mobile-menu-link"
              onClick={closeMenu}
              style={{ display: 'block' }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: 32 }}>
            <Link
              href="#new"
              className="btn-primary"
              onClick={closeMenu}
              style={{ display: 'inline-flex' }}
            >
              SHOP THE COLLECTION
            </Link>
          </div>
        </nav>

        {/* Social row */}
        <div style={{ position: 'absolute', bottom: 32, display: 'flex', gap: 20 }}>
          {['Instagram', 'Facebook', 'Pinterest'].map((s) => (
            <Link
              key={s}
              href="#"
              style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                color: 'rgba(248,245,239,0.55)',
                fontWeight: 500,
              }}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Overlay - rendered here, controlled by searchOpen state */}
      {searchOpen && (
        <div className="search-overlay open" role="dialog" aria-label="Search">
          <button
            className="search-close"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            ✕
          </button>
          <h2 className="search-title">What are you looking for?</h2>
          <input
            type="search"
            className="search-input"
            placeholder="Search kurtas, kurtis…"
            aria-label="Search products"
            autoFocus
          />
          <div className="search-chips">
            {['Kurtas', 'Kurtis', 'New Arrivals', 'Everyday Collection', 'Festive'].map((chip) => (
              <Link
                key={chip}
                href="#"
                className="search-chip"
                onClick={() => setSearchOpen(false)}
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
