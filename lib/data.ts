// lib/data.ts
// Central data store for Dhaaga-E-Jashn

export interface Product {
  id: string
  name: string
  price: number
  color: string
  colorName: string
  description: string
  category: 'new' | 'featured' | 'bestseller'
  swatches: string[]
}

export interface Category {
  id: string
  name: string
  color: string
  href: string
}

export const PRODUCTS: Product[] = [
  // =========================================================
  // NEW ARRIVALS
  // =========================================================

  {
    id: 'new-1',
    name: 'Classic Ivory Kurta',
    price: 1499,
    color: '#EFE8DA',
    colorName: 'Ivory',
    description:
      'Soft cotton, mandarin collar, easy straight fit.',
    category: 'new',
    swatches: [
      '#EFE8DA',
      '#E8DFD1',
      '#496174',
    ],
  },

  {
    id: 'new-2',
    name: 'Midnight Navy Kurta',
    price: 1699,
    color: '#06223C',
    colorName: 'Navy',
    description:
      'Cotton-linen blend with fine tonal piping.',
    category: 'new',
    swatches: [
      '#06223C',
      '#EFE8DA',
      '#496174',
    ],
  },

  {
    id: 'new-3',
    name: 'Sand Beige Kurti',
    price: 1399,
    color: '#D8C6AA',
    colorName: 'Sand Beige',
    description:
      'Relaxed A-line kurti in breathable cotton.',
    category: 'new',
    swatches: [
      '#D8C6AA',
      '#06223C',
      '#EFE8DA',
    ],
  },

  {
    id: 'new-4',
    name: 'Charcoal Everyday Kurta',
    price: 1599,
    color: '#2b2b2b',
    colorName: 'Charcoal',
    description:
      'A dependable daily kurta with a clean placket.',
    category: 'new',
    swatches: [
      '#2b2b2b',
      '#EFE8DA',
      '#D8C6AA',
    ],
  },

  // =========================================================
  // FEATURED
  // =========================================================

  {
    id: 'feat-1',
    name: 'Heritage Navy Kurta',
    price: 1799,
    color: '#0d3558',
    colorName: 'Heritage Navy',
    description:
      'Textured weave, quiet gold-thread detail.',
    category: 'featured',
    swatches: [
      '#0d3558',
      '#EFE8DA',
      '#D8C6AA',
    ],
  },

  {
    id: 'feat-2',
    name: 'Ivory Straight Kurti',
    price: 1499,
    color: '#EFE8DA',
    colorName: 'Ivory',
    description:
      'Straight cut, three-quarter sleeves.',
    category: 'featured',
    swatches: [
      '#EFE8DA',
      '#06223C',
      '#496174',
    ],
  },

  {
    id: 'feat-3',
    name: 'Muted Slate Kurta',
    price: 1599,
    color: '#496174',
    colorName: 'Muted Slate',
    description:
      'Soft slate cotton for everyday ease.',
    category: 'featured',
    swatches: [
      '#496174',
      '#EFE8DA',
      '#D8C6AA',
    ],
  },

  // =========================================================
  // BESTSELLERS
  // =========================================================

  {
    id: 'best-1',
    name: 'Heritage Ivory Kurta',
    price: 1599,
    color: '#EFE8DA',
    colorName: 'Ivory',
    description:
      'Our most-loved silhouette in pure ivory.',
    category: 'bestseller',
    swatches: [
      '#EFE8DA',
      '#06223C',
      '#D8C6AA',
    ],
  },

  {
    id: 'best-2',
    name: 'Midnight Blue Kurta',
    price: 1699,
    color: '#0a2c4d',
    colorName: 'Midnight Blue',
    description:
      'Deep blue, breathable and structured.',
    category: 'bestseller',
    swatches: [
      '#0a2c4d',
      '#EFE8DA',
      '#D8C6AA',
    ],
  },

  {
    id: 'best-3',
    name: 'Classic Beige Kurti',
    price: 1449,
    color: '#D8C6AA',
    colorName: 'Classic Beige',
    description:
      'A timeless kurti that pairs with everything.',
    category: 'bestseller',
    swatches: [
      '#D8C6AA',
      '#06223C',
      '#EFE8DA',
    ],
  },

  {
    id: 'best-4',
    name: 'Deep Charcoal Kurta',
    price: 1649,
    color: '#222',
    colorName: 'Charcoal',
    description:
      'Understated, tailored, made to repeat.',
    category: 'bestseller',
    swatches: [
      '#222',
      '#EFE8DA',
      '#D8C6AA',
    ],
  },
]

/* =========================================================
   CATEGORIES
   ========================================================= */

export const CATEGORIES: Category[] = [
  {
    id: 'kurtas',
    name: 'Kurtas',
    color: '#496174',
    href: '/shop',
  },

  {
    id: 'kurtis',
    name: 'Kurtis',
    color: '#C8B79F',
    href: '/shop',
  },

  {
    id: 'everyday',
    name: 'Everyday',
    color: '#E8DFD1',
    href: '/shop',
  },

  {
    id: 'festive',
    name: 'Festive',
    color: '#06223C',
    href: '/shop',
  },
]

/* =========================================================
   SIZES
   ========================================================= */

export const SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
] as const

/* =========================================================
   INSTAGRAM COLORS
   ========================================================= */

export const INSTA_COLORS = [
  '#496174',
  '#E8DFD1',
  '#06223C',
  '#D8C6AA',
  '#2b2b2b',
  '#EFE8DA',
]

/* =========================================================
   CRAFT PILLARS
   ========================================================= */

export const CRAFT_PILLARS = [
  {
    number: '01',
    icon: 'wave',
    title: 'THOUGHTFUL FABRICS',
    desc:
      'Comfortable materials selected for everyday wear — soft against skin, mindful of origin.',
  },

  {
    number: '02',
    icon: 'loom',
    title: 'EASY SILHOUETTES',
    desc:
      'Classic Indian silhouettes designed for modern wardrobes and effortless movement.',
  },

  {
    number: '03',
    icon: 'repeat',
    title: 'MADE TO REPEAT',
    desc:
      'Pieces designed to become everyday favourites, worn again and again with ease.',
  },

  {
    number: '04',
    icon: 'thread',
    title: 'THE DHAAGA DETAIL',
    desc:
      'Subtle details inspired by Indian textile traditions — present but never overwhelming.',
  },
]

/* =========================================================
   NAVIGATION
   ========================================================= */

export const NAV_LINKS = [
  {
    label: 'Women',
    href: '/shop',
  },

  {
    label: 'Men',
    href: '/shop',
  },

  {
    label: 'Kurtas',
    href: '/shop',
  },

  {
    label: 'Collections',
    href: '/shop',
  },

  {
    label: 'Our Story',
    href: '#story',
  },
]

/* =========================================================
   FOOTER LINKS
   ========================================================= */

export const FOOTER_LINKS = {
  SHOP: [
    {
      label: 'Kurtas',
      href: '/shop',
    },

    {
      label: 'Kurtis',
      href: '/shop',
    },

    {
      label: 'New Arrivals',
      href: '/shop',
    },

    {
      label: 'Collections',
      href: '/shop',
    },

    {
      label: 'Bestsellers',
      href: '/shop',
    },
  ],

  ABOUT: [
    {
      label: 'Our Story',
      href: '#story',
    },

    {
      label: 'Our Craft',
      href: '#why',
    },

    {
      label: 'Journal',
      href: '#',
    },

    {
      label: 'Press',
      href: '#',
    },
  ],

  HELP: [
    {
      label: 'Contact',
      href: '/contact',
    },

    {
      label: 'Shipping',
      href: '/policies/shipping',
    },

    {
      label: 'FAQs',
      href: '/faqs',
    },
  ],

  FOLLOW: [
    {
      label: 'Instagram',
      href: '#',
    },

    {
      label: 'Facebook',
      href: '#',
    },

    {
      label: 'Pinterest',
      href: '#',
    },
  ],
}

/* =========================================================
   PRICE FORMATTER
   ========================================================= */

export const formatPrice = (n: number): string =>
  '₹' + n.toLocaleString('en-IN')