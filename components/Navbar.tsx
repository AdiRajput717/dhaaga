'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NAV_LINKS } from '@/lib/data'
import { gsap } from '@/lib/gsapUtils'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, cartCount, wishlistIds, logout } = useAuth()
  const router = useRouter()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileLinksRef = useRef<HTMLDivElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    setAccountMenuOpen(false)
    await logout()
    router.push('/')
  }

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
        <Link href="/" className="nav-logo-wrap" aria-label="Dhaaga-e-Jashn home">
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
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-5-5" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="icon-btn hide-mobile"
            aria-label={`Wishlist, ${wishlistIds.length} items`}
            style={{ position: 'relative' }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill={wishlistIds.length > 0 ? '#C99A3D' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
            </svg>
            {wishlistIds.length > 0 && (
              <span className="bag-count" style={{ background: '#C99A3D' }}>
                {wishlistIds.length}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div ref={accountMenuRef} style={{ position: 'relative' }}>
            <button
              className="icon-btn hide-mobile"
              aria-label="Account"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
              </svg>
            </button>

            {accountMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: 220,
                  background: '#F8F5EF',
                  border: '1px solid rgba(6,34,60,0.12)',
                  boxShadow: '0 12px 32px rgba(6,34,60,0.12)',
                  padding: '12px 0',
                  zIndex: 200,
                  animation: 'fadeIn 0.2s ease-out',
                }}
              >
                {user ? (
                  <>
                    <div
                      style={{
                        padding: '8px 16px 12px',
                        borderBottom: '1px solid rgba(6,34,60,0.08)',
                        marginBottom: 6,
                      }}
                    >
                      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C99A3D', fontWeight: 600 }}>
                        {user.role === 'admin' ? 'Administrator' : 'Signed in as'}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#06223C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </p>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          fontSize: 13,
                          color: '#C99A3D',
                          fontWeight: 600,
                        }}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: 13,
                        color: '#06223C',
                      }}
                    >
                      My Account
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: 13,
                        color: '#06223C',
                      }}
                    >
                      My Orders
                    </Link>

                    <Link
                      href="/account/addresses"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: 13,
                        color: '#06223C',
                      }}
                    >
                      Saved Addresses
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: 13,
                        color: '#06223C',
                      }}
                    >
                      Wishlist ({wishlistIds.length})
                    </Link>

                    <div style={{ borderTop: '1px solid rgba(6,34,60,0.08)', marginTop: 6, paddingTop: 6 }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 16px',
                          fontSize: 13,
                          color: '#A33',
                          fontWeight: 500,
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid rgba(6,34,60,0.08)' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#06223C' }}>Welcome to Dhaaga</p>
                    </div>

                    <Link
                      href="/login"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: 13,
                        color: '#06223C',
                        fontWeight: 600,
                      }}
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: 13,
                        color: '#496174',
                      }}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bag */}
          <Link href="/cart" className="icon-btn" aria-label={`Shopping bag, ${cartCount} items`}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0" />
            </svg>
            {cartCount > 0 && (
              <span className="bag-count">{cartCount}</span>
            )}
          </Link>

          <Link href="/shop" className="nav-cta">
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
        <div style={{ marginBottom: 32, opacity: 0.5 }}>
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

          <Link
            href="/cart"
            className="mobile-menu-link"
            onClick={closeMenu}
            style={{ display: 'block' }}
          >
            Shopping Bag ({cartCount})
          </Link>

          <Link
            href="/wishlist"
            className="mobile-menu-link"
            onClick={closeMenu}
            style={{ display: 'block' }}
          >
            Wishlist ({wishlistIds.length})
          </Link>

          {user ? (
            <>
              <Link
                href="/account"
                className="mobile-menu-link"
                onClick={closeMenu}
                style={{ display: 'block', color: '#C99A3D' }}
              >
                Account ({user.name})
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="mobile-menu-link"
                  onClick={closeMenu}
                  style={{ display: 'block', color: '#C99A3D' }}
                >
                  Admin Portal
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="mobile-menu-link"
              onClick={closeMenu}
              style={{ display: 'block' }}
            >
              Sign In / Register
            </Link>
          )}

          <div style={{ marginTop: 28 }}>
            <Link
              href="/shop"
              className="btn-primary"
              onClick={closeMenu}
              style={{ display: 'inline-flex' }}
            >
              SHOP THE COLLECTION
            </Link>
          </div>
        </nav>

        {/* Social row */}
        <div style={{ position: 'absolute', bottom: 28, display: 'flex', gap: 20 }}>
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

      {/* Search Overlay */}
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
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 560 }}>
            <input
              type="search"
              className="search-input"
              placeholder="Search kurtas, kurtis, colors…"
              aria-label="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </form>
          <div className="search-chips">
            {[
              { label: 'All Kurtas', href: '/category/kurtas' },
              { label: 'Kurtis', href: '/category/kurtis' },
              { label: 'Everyday Collection', href: '/category/everyday' },
              { label: 'Festive Wear', href: '/category/festive' },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="search-chip"
                onClick={() => setSearchOpen(false)}
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
