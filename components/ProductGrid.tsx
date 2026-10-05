'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsapUtils'
import {
  PRODUCTS,
  SIZES,
  formatPrice,
} from '@/lib/data'
import ProductCard, { AnyProduct, KurtaSilhouette } from '@/components/ProductCard'
import { useAuth } from '@/context/AuthContext'
import { addToCart } from '@/lib/cart'

gsap.registerPlugin(ScrollTrigger)

/* =========================================================
   QUICK VIEW MODAL
   ========================================================= */

interface QuickViewModalProps {
  product: AnyProduct | null
  onClose: () => void
}

export function QuickViewModal({
  product,
  onClose,
}: QuickViewModalProps) {
  const { user, refreshCart } = useAuth()
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
      if (product.variants && product.variants.length > 0) {
        setSelectedSize(product.variants[0].size)
        setSelectedColor(product.variants[0].color)
      } else {
        setSelectedSize('M')
        setSelectedColor(product.colorName || 'Ivory')
      }
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [product])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!product) {
    return null
  }

  const sizes = product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : Array.from(SIZES)

  const handleAddToBag = async () => {
    if (product._id) {
      if (!user) {
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', {
            detail: 'Please sign in to add items to your bag',
          })
        )
        return
      }

      try {
        setLoading(true)
        const variant = product.variants?.find(
          (v) => v.size === selectedSize && (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase())
        ) || product.variants?.[0]

        await addToCart({
          productId: product._id,
          size: variant ? variant.size : selectedSize,
          color: variant ? variant.color : (selectedColor || 'Ivory'),
          quantity: 1,
        })
        await refreshCart()
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', {
            detail: `Added ${product.name} (${selectedSize}) to your bag ✓`,
          })
        )
        onClose()
      } catch (err: any) {
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', {
            detail: err?.message || 'Could not add to bag',
          })
        )
      } finally {
        setLoading(false)
      }
    } else {
      window.dispatchEvent(new CustomEvent('dhaaga:addtobag'))
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', {
          detail: 'Added to your bag ✓',
        })
      )
      onClose()
    }
  }

  const bgHex = product.color || '#EFE8DA'

  return (
    <div
      ref={overlayRef}
      className="modal-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label="Quick view"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose()
        }
      }}
    >
      <div className="modal-box">
        <button
          type="button"
          className="modal-close"
          aria-label="Close quick view"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Image */}
        <div
          className="modal-img-wrap"
          style={{
            background: bgHex,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {product.images && product.images.length > 0 && product.images[0].startsWith('http') ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <KurtaSilhouette color={bgHex} />
          )}
        </div>

        {/* Product info */}
        <div className="modal-info">
          <h3 className="modal-title">{product.name}</h3>

          <p className="modal-price">{formatPrice(product.price)}</p>

          <p className="modal-desc">{product.description}</p>

          <p className="modal-label">
            COLOR:{' '}
            <span
              style={{
                color: '#06223C',
                fontWeight: 700,
              }}
            >
              {product.colorName || selectedColor || 'Classic'}
            </span>
          </p>

          <div>
            <p
              className="modal-label"
              style={{
                marginBottom: 10,
              }}
            >
              SIZE
            </p>

            <div className="modal-sizes">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={`modal-size-btn ${
                    selectedSize === size ? 'active' : ''
                  }`}
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
            type="button"
            className="btn-outline-dark"
            style={{
              marginTop: 16,
              width: '100%',
              justifyContent: 'center',
            }}
            onClick={handleAddToBag}
            disabled={loading}
          >
            {loading ? 'ADDING TO BAG...' : 'ADD TO BAG'}
          </button>

          {product.slug && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                style={{
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#C99A3D',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                View Full Details & Reviews →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   TOAST
   ========================================================= */

export function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<string>

      setMessage(customEvent.detail)
      setVisible(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setVisible(false)
      }, 2400)
    }

    window.addEventListener('dhaaga:toast', handleToast)

    return () => {
      window.removeEventListener('dhaaga:toast', handleToast)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div
      className={`toast-msg ${visible ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}

/* =========================================================
   BAG COUNT MANAGER
   ========================================================= */

export function BagCountManager() {
  const { cartCount, refreshCart } = useAuth()

  useEffect(() => {
    const handleAddToBag = () => {
      refreshCart()
    }

    window.addEventListener('dhaaga:addtobag', handleAddToBag)

    return () => {
      window.removeEventListener('dhaaga:addtobag', handleAddToBag)
    }
  }, [refreshCart])

  return null
}

/* =========================================================
   PRODUCT GRID
   ========================================================= */

interface ProductGridProps {
  category: 'new' | 'bestseller'
  title: string
  subtitle?: string
  id: string
  background?: string
}

export default function ProductGrid({
  category,
  title,
  subtitle,
  id,
  background,
}: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<AnyProduct | null>(null)

  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const products = PRODUCTS.filter((product) => product.category === category)

  useEffect(() => {
    if (!sectionRef.current || !headRef.current || !gridRef.current) {
      return
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reducedMotion) {
      gridRef.current
        .querySelectorAll('.product-card')
        .forEach((card) => {
          ;(card as HTMLElement).style.opacity = '1'
        })
      return
    }

    const context = gsap.context(() => {
      /* Heading */
      gsap.fromTo(
        headRef.current,
        {
          y: 32,
          opacity: 0,
        },
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

      /* Cards */
      const cards = gridRef.current?.querySelectorAll('.product-card')

      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            y: 48,
            opacity: 0,
          },
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

    return () => {
      context.revert()
    }
  }, [])

  return (
    <>
      <BagCountManager />
      <Toast />

      <section
        ref={sectionRef}
        id={id}
        className="section-pad"
        style={{
          background: background ?? '#F8F5EF',
          maxWidth: '100%',
        }}
      >
        <div className="section-max">
          {/* Heading */}
          <div
            ref={headRef}
            style={{
              textAlign: 'center',
              marginBottom: 56,
              opacity: 0,
            }}
          >
            <div className="section-eyebrow">
              <div className="eyebrow-line" />

              <span className="eyebrow-text">
                {category === 'new' ? 'JUST ARRIVED' : 'MOST LOVED'}
              </span>

              <div className="eyebrow-line" />
            </div>

            <h2 className="section-title">{title}</h2>

            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>

          {/* Products */}
          <div ref={gridRef} className="products-grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  )
}