'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

import {
  BagCountManager,
  QuickViewModal,
  Toast,
} from '@/components/ProductGrid'

import { gsap } from '@/lib/gsapUtils'

import {
  PRODUCTS,
  formatPrice,
  type Product,
} from '@/lib/data'

type CollectionFilter =
  | 'all'
  | Product['category']

type ProductType =
  | 'all'
  | 'kurta'
  | 'kurti'

type SortOption =
  | 'featured'
  | 'price-low'
  | 'price-high'
  | 'name'

const COLLECTIONS: Array<{
  value: CollectionFilter
  label: string
}> = [
  {
    value: 'all',
    label: 'All pieces',
  },
  {
    value: 'new',
    label: 'New arrivals',
  },
  {
    value: 'featured',
    label: 'Featured',
  },
  {
    value: 'bestseller',
    label: 'Bestsellers',
  },
]

const PRODUCT_TYPES: Array<{
  value: ProductType
  label: string
}> = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'kurta',
    label: 'Kurtas',
  },
  {
    value: 'kurti',
    label: 'Kurtis',
  },
]

const SORT_OPTIONS: Array<{
  value: SortOption
  label: string
}> = [
  {
    value: 'featured',
    label: 'Featured',
  },
  {
    value: 'price-low',
    label: 'Price: Low to High',
  },
  {
    value: 'price-high',
    label: 'Price: High to Low',
  },
  {
    value: 'name',
    label: 'Name: A–Z',
  },
]

function matchesProductType(
  product: Product,
  type: ProductType
) {
  if (type === 'all') {
    return true
  }

  const name =
    product.name.toLowerCase()

  if (type === 'kurti') {
    return name.includes('kurti')
  }

  return (
    name.includes('kurta') &&
    !name.includes('kurti')
  )
}

export default function ShopPage() {
  const [collection, setCollection] =
    useState<CollectionFilter>('all')

  const [productType, setProductType] =
    useState<ProductType>('all')

  const [sort, setSort] =
    useState<SortOption>('featured')

  const [query, setQuery] =
    useState('')

  const [
    quickViewProduct,
    setQuickViewProduct,
  ] = useState<Product | null>(null)

  const gridRef =
    useRef<HTMLDivElement>(null)

  const filteredProducts = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    const result = PRODUCTS.filter(
      (product) => {
        const matchesCollection =
          collection === 'all' ||
          product.category === collection

        const matchesType =
          matchesProductType(
            product,
            productType
          )

        const matchesSearch =
          !normalizedQuery ||
          [
            product.name,
            product.description,
            product.colorName,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(normalizedQuery)
          )

        return (
          matchesCollection &&
          matchesType &&
          matchesSearch
        )
      }
    )

    return [...result].sort(
      (a, b) => {
        if (sort === 'price-low') {
          return a.price - b.price
        }

        if (sort === 'price-high') {
          return b.price - a.price
        }

        if (sort === 'name') {
          return a.name.localeCompare(
            b.name
          )
        }

        return (
          PRODUCTS.indexOf(a) -
          PRODUCTS.indexOf(b)
        )
      }
    )
  }, [
    collection,
    productType,
    query,
    sort,
  ])

  useEffect(() => {
    if (!gridRef.current) {
      return
    }

    const cards =
      gridRef.current.querySelectorAll(
        '.product-card'
      )

    if (cards.length === 0) {
      return
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

    if (reducedMotion) {
      cards.forEach((card) => {
        ;(
          card as HTMLElement
        ).style.opacity = '1'
      })

      return
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          y: 28,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power3.out',
        }
      )
    }, gridRef)

    return () => {
      context.revert()
    }
  }, [filteredProducts])

  const resetFilters = () => {
    setCollection('all')
    setProductType('all')
    setSort('featured')
    setQuery('')
  }

  return (
    <>
      <Navbar />

      <BagCountManager />
      <Toast />

      <main className="shop-page">
        {/* =================================================
            SHOP HERO
        ================================================= */}

        <section className="shop-hero">
          <div className="shop-hero-inner">
            <div className="section-eyebrow shop-eyebrow">
              <div className="eyebrow-line" />

              <span className="eyebrow-text">
                THE COLLECTION
              </span>

              <div className="eyebrow-line" />
            </div>

            <h1 className="shop-title">
              The Dhaaga Edit
            </h1>

            <p className="shop-intro">
              Thoughtful Indian silhouettes,
              quiet details and everyday
              pieces made for your jashn.
            </p>
          </div>
        </section>

        {/* =================================================
            SHOP CONTENT
        ================================================= */}

        <section
          className="shop-content"
          aria-label="Shop products"
        >
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="shop-toolbar-top">
              <div>
                <span className="shop-result-label">
                  CURATED FOR YOU
                </span>

                <p className="shop-result-count">
                  {filteredProducts.length}{' '}
                  {filteredProducts.length ===
                  1
                    ? 'piece'
                    : 'pieces'}
                </p>
              </div>

              {/* Sort */}
              <label className="shop-sort">
                <span>Sort</span>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target
                        .value as SortOption
                    )
                  }
                >
                  {SORT_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {/* Product type */}
            <div
              className="shop-filter-row"
              aria-label="Product type"
            >
              {PRODUCT_TYPES.map(
                (type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`shop-filter-button ${
                      productType ===
                      type.value
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setProductType(
                        type.value
                      )
                    }
                  >
                    {type.label}
                  </button>
                )
              )}
            </div>

            {/* Collections + Search */}
            <div className="shop-controls">
              <div
                className="shop-collection-tabs"
                aria-label="Collections"
              >
                {COLLECTIONS.map(
                  (item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`shop-tab ${
                        collection ===
                        item.value
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setCollection(
                          item.value
                        )
                      }
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>

              <label className="shop-search">
                <span className="sr-only">
                  Search products
                </span>

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    fill="none"
                  />

                  <path
                    d="M21 21l-5-5"
                    fill="none"
                  />
                </svg>

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search the collection"
                />
              </label>
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length > 0 ? (
            <div
              ref={gridRef}
              className="products-grid shop-grid"
            >
              {filteredProducts.map(
                (product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onQuickView={
                      setQuickViewProduct
                    }
                  />
                )
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="shop-empty">
              <span className="shop-empty-eyebrow">
                NOTHING MATCHED
              </span>

              <h2>
                Try another edit.
              </h2>

              <p>
                Clear your filters or
                search for another piece
                from the collection.
              </p>

              <button
                type="button"
                className="btn-outline-dark"
                onClick={resetFilters}
              >
                RESET FILTERS
              </button>
            </div>
          )}

          {/* Bottom note */}
          <div className="shop-note">
            <span>
              CRAFTED FOR EVERYDAY JASHN
            </span>

            <span>
              FREE SHIPPING ON ORDERS ABOVE{' '}
              {formatPrice(1499)}
            </span>
          </div>
        </section>
      </main>

      <Footer />

      {/* Quick View */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() =>
          setQuickViewProduct(null)
        }
      />
    </>
  )
}