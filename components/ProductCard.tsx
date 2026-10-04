'use client'

import { useState } from 'react'
import { formatPrice, type Product } from '@/lib/data'

interface ProductCardProps {
  product: Product
  onQuickView: (product: Product) => void
  index: number
  variant?: 'default' | 'featured'
}

const COLOR_NAMES: Record<string, string> = {
  '#EFE8DA': 'Ivory',
  '#06223C': 'Navy',
  '#D8C6AA': 'Sand Beige',
  '#2b2b2b': 'Charcoal',
  '#0d3558': 'Heritage Navy',
  '#496174': 'Muted Slate',
  '#0a2c4d': 'Midnight Blue',
  '#222': 'Charcoal',
  '#E8DFD1': 'Warm Ivory',
}

function KurtaSilhouette({ color }: { color: string }) {
  const isLight =
    color === '#EFE8DA' ||
    color === '#D8C6AA' ||
    color === '#E8DFD1'

  const strokeColor = isLight
    ? 'rgba(6,34,60,0.15)'
    : 'rgba(248,245,239,0.15)'

  return (
    <svg
      viewBox="0 0 100 130"
      aria-hidden="true"
      style={{
        width: '65%',
        height: '85%',
      }}
    >
      <path
        d="M36 6l14 8 14-8 12 10 10 40-10 4-2-18v90H26V42l-2 18-10-4 10-40z"
        fill={strokeColor}
      />

      <path
        d="M44 14 Q50 20 56 14"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
      />

      <line
        x1="50"
        y1="20"
        x2="50"
        y2="50"
        stroke={strokeColor}
        strokeWidth="0.8"
      />
    </svg>
  )
}

export default function ProductCard({
  product,
  onQuickView,
  index,
  variant = 'default',
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false)

  const handleWishlist = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation()

    const nextValue = !wishlisted
    setWishlisted(nextValue)

    window.dispatchEvent(
      new CustomEvent('dhaaga:toast', {
        detail: nextValue
          ? 'Added to wishlist ♥'
          : 'Removed from wishlist',
      })
    )
  }

  const handleAddToBag = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation()

    window.dispatchEvent(
      new CustomEvent('dhaaga:addtobag')
    )
  }

  return (
    <article
      className="product-card"
      aria-label={product.name}
    >
      {/* Product image */}
      <div
        className="product-card-img"
        tabIndex={0}
        role="button"
        aria-label={`Quick view ${product.name}`}
        onClick={() => onQuickView(product)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onQuickView(product)
          }
        }}
        style={{
          background: product.color,
        }}
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
          type="button"
          className={`product-card-wish ${
            wishlisted ? 'active' : ''
          }`}
          aria-label={`${
            wishlisted ? 'Remove' : 'Add'
          } ${product.name} from wishlist`}
          onClick={handleWishlist}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill={wishlisted ? '#C99A3D' : 'none'}
            stroke={wishlisted ? '#C99A3D' : '#06223C'}
            strokeWidth="1.5"
          >
            <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
          </svg>
        </button>

        {/* Add to bag */}
        <button
          type="button"
          className="product-card-add"
          aria-label={`Add ${product.name} to bag`}
          onClick={handleAddToBag}
        >
          ADD TO BAG
        </button>

        <div className="product-card-gold-line" />

        {/* New badge */}
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

      {/* Product information */}
      <div
        className={
          variant === 'featured'
            ? 'featured-card-info'
            : 'product-card-info'
        }
      >
        <h3
          className={
            variant === 'featured'
              ? 'featured-card-name'
              : 'product-card-name'
          }
        >
          {product.name}
        </h3>

        <p
          className={
            variant === 'featured'
              ? 'featured-card-desc'
              : 'product-card-desc'
          }
        >
          {product.description}
        </p>

        <p
          className={
            variant === 'featured'
              ? 'featured-card-price'
              : 'product-card-price'
          }
        >
          {formatPrice(product.price)}
        </p>

        <div className="product-swatches">
          {product.swatches.map((swatch, index) => (
            <div
              key={`${swatch}-${index}`}
              className="swatch"
              style={{
                background: swatch,
              }}
              title={
                COLOR_NAMES[swatch] ?? 'As shown'
              }
              aria-label={
                COLOR_NAMES[swatch] ?? 'Color swatch'
              }
            />
          ))}
        </div>
      </div>
    </article>
  )
}