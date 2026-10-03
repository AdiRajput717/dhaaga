'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsapUtils'
import { PRODUCTS, SIZES, formatPrice, type Product } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger)

const HEART_SVG = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  </svg>
)

// Color swatch color → name map
const COLOR_NAMES: Record<string, string> = {
  '#EFE8DA': 'Ivory',
  '#06223C': 'Navy',
  '#D8C6AA': 'Sand Beige',
  '#2b2b2b': 'Charcoal',
  '#0d3558': 'Heritage Navy',
  '#496174': 'Muted Slate',
  '#0a2c4d': 'Midnight Blue',
  '#222': 'Charcoal',
}

// Silhouette SVG for placeholder
function KurtaSilhouette({ color }: { color: string }) {
  const isLight =
    color === '#EFE8DA' || color === '#D8C6AA' || color === '#E8DFD1'
  const strokeColor = isLight ? 'rgba(6,34,60,0.15)' : 'rgba(248,245,239,0.15)'

  return (
    <svg viewBox="0 0 100 130" aria-hidden style={{ width: '65%', height: '85%' }}>
      {/* Simple kurta silhouette */}
      <path
        d="M36 6l14 8 14-8 12 10 10 40-10 4-2-18v90H26V42l-2 18-10-4 10-40z"
        fill={strokeColor}
      />
      {/* Collar detail */}
      <path
        d="M44 14 Q50 20 56 14"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
      />
      {/* Button line */}
      <line x1="50" y1="20" x2="50" y2="50" stroke={strokeColor} strokeWidth="0.8" />
    </svg>
  )
}

interface ProductCardProps {
  product: Product
  onQuickView: (product: Product) => void
  index: number
  variant?: 'default' | 'featured'
}

function ProductCard({ product, onQuickView, index, variant = 'default' }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlisted((v) => !v)

    // Toast
    const event = new CustomEvent('dhaaga:toast', {
      detail: wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♥',
    })
    window.dispatchEvent(event)
  }

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation()
    const ev = new CustomEvent('dhaaga:addtobag')
    window.dispatchEvent(ev)
  }

  const isLight = product.color === '#EFE8DA' || product.color === '#D8C6AA' || product.color === '#E8DFD1'

  return (
    <article
      ref={cardRef}
      className="product-card"
      style={{ opacity: 0 }}
      aria-label={product.name}
    >
      {/* Image container */}
      <div
        className="product-card-img"
        tabIndex={0}
        role="button"
        aria-label={`Quick view ${product.name}`}
        onClick={() => onQuickView(product)}
        onKeyDown={(e) => e.key === 'Enter' && onQuickView(product)}
        style={{ background: product.color }}
      >
        <div
          className="product-card-img-inner"
          style={{
            background: product.color,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <KurtaSilhouette color={product.color} />
        </div>

        <div className="product-card-overlay" />

        {/* Wishlist */}
        <button
          className={`product-card-wish ${wishlisted ? 'active' : ''}`}
          aria-label={`${wishlisted ? 'Remove' : 'Add'} ${product.name} from wishlist`}
          onClick={handleWishlist}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill={wishlisted ? '#C99A3D' : 'none'} stroke={wishlisted ? '#C99A3D' : '#06223C'} strokeWidth="1.5">
            <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
          </svg>
        </button>

        {/* Add to bag */}
        <button
          className="product-card-add"
          aria-label={`Add ${product.name} to bag`}
          onClick={handleAddToBag}
        >
          ADD TO BAG
        </button>

        {/* Gold line hover */}
        <div className="product-card-gold-line" />

        {/* Tag */}
        {index < 2 && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: '#C99A3D',
              color: '#06223C',
              fontSize: 9,
              letterSpacing: '0.15em',
              fontWeight: 700,
              padding: '4px 10px',
              zIndex: 2,
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            NEW
          </div>
        )}
      </div>

      {/* Info */}
      <div className={variant === 'featured' ? 'featured-card-info' : 'product-card-info'}>
        <h3 className={variant === 'featured' ? 'featured-card-name' : 'product-card-name'}>
          {product.name}
        </h3>
        <p className={variant === 'featured' ? 'featured-card-desc' : 'product-card-desc'}>
          {product.description}
        </p>
        <p className={variant === 'featured' ? 'featured-card-price' : 'product-card-price'}>
          {formatPrice(product.price)}
        </p>

        {/* Swatches */}
        <div className="product-swatches">
          {product.swatches.map((sw, i) => (
            <div
              key={i}
              className="swatch"
              style={{ background: sw }}
              title={COLOR_NAMES[sw] ?? 'As shown'}
              aria-label={COLOR_NAMES[sw] ?? 'Color swatch'}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

// Quick View Modal
interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!overlayRef.current) return
    if (product) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [product])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!product) return null

  const handleAddToBag = () => {
    const ev = new CustomEvent('dhaaga:addtobag')
    window.dispatchEvent(ev)
    const toast = new CustomEvent('dhaaga:toast', { detail: 'Added to your bag ✓' })
    window.dispatchEvent(toast)
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      className="modal-overlay open"
      role="dialog"
      aria-modal
      aria-label="Quick view"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="modal-box">
        <button className="modal-close" aria-label="Close" onClick={onClose}>✕</button>

        {/* Image */}
        <div
          className="modal-img-wrap"
          style={{
            background: product.color,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <KurtaSilhouette color={product.color} />
        </div>

        {/* Info */}
        <div className="modal-info">
          <h3 className="modal-title">{product.name}</h3>
          <p className="modal-price">{formatPrice(product.price)}</p>
          <p className="modal-desc">{product.description}</p>

          <p className="modal-label">
            COLOR: <span style={{ color: '#06223C', fontWeight: 700 }}>{product.colorName}</span>
          </p>

          <div>
            <p className="modal-label" style={{ marginBottom: 10 }}>SIZE</p>
            <div className="modal-sizes">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className={`modal-size-btn ${selectedSize === size ? 'active' : ''}`}
                  aria-label={`Size ${size}`}
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-outline-dark"
            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            onClick={handleAddToBag}
          >
            ADD TO BAG
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast
function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail)
      setVisible(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(false), 2400)
    }
    window.addEventListener('dhaaga:toast', handler)
    return () => {
      window.removeEventListener('dhaaga:toast', handler)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div
      className={`toast-msg ${visible ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {msg}
    </div>
  )
}

// Bag count updater
function BagCountManager() {
  const countRef = useRef(0)

  useEffect(() => {
    const handler = () => {
      countRef.current += 1
      const ev = new CustomEvent('dhaaga:bagupdate', { detail: countRef.current })
      window.dispatchEvent(ev)
      const toast = new CustomEvent('dhaaga:toast', { detail: 'Added to your bag ✓' })
      window.dispatchEvent(toast)
    }
    window.addEventListener('dhaaga:addtobag', handler)
    return () => window.removeEventListener('dhaaga:addtobag', handler)
  }, [])

  return null
}

interface ProductGridProps {
  category: 'new' | 'bestseller'
  title: string
  subtitle?: string
  id: string
  background?: string
}

export default function ProductGrid({ category, title, subtitle, id, background }: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const products = PRODUCTS.filter((p) => p.category === category)

  useEffect(() => {
    if (!sectionRef.current || !headRef.current || !gridRef.current) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      gridRef.current.querySelectorAll('.product-card').forEach((el) => {
        ;(el as HTMLElement).style.opacity = '1'
      })
      return
    }

    const ctx = gsap.context(() => {
      // Head reveal
      gsap.fromTo(
        headRef.current,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headRef.current,
            start: 'top 82%',
            once: true,
          },
        }
      )

      // Cards stagger
      const cards = gridRef.current?.querySelectorAll('.product-card')
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <BagCountManager />
      <Toast />
      <section
        ref={sectionRef}
        id={id}
        className="section-pad"
        style={{ background: background ?? '#F8F5EF', maxWidth: '100%' }}
      >
        <div className="section-max">
          {/* Head */}
          <div ref={headRef} style={{ textAlign: 'center', marginBottom: 56, opacity: 0 }}>
            <div className="section-eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">
                {category === 'new' ? 'JUST ARRIVED' : 'MOST LOVED'}
              </span>
              <div className="eyebrow-line" />
            </div>
            <h2 className="section-title">{title}</h2>
            {subtitle && (
              <p className="section-subtitle">{subtitle}</p>
            )}
          </div>

          {/* Grid */}
          <div ref={gridRef} className="products-grid">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  )
}
