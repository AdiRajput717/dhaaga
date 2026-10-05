'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  const links = [
    { label: 'Overview', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Reviews', href: '/admin/reviews' },
  ]

  return (
    <nav
      style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid rgba(6,34,60,0.1)',
        marginBottom: 36,
        overflowX: 'auto',
        paddingBottom: 4,
      }}
    >
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '10px 18px',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: isActive ? '#06223C' : '#496174',
              borderBottom: isActive ? '2px solid #C99A3D' : '2px solid transparent',
              background: isActive ? 'rgba(6,34,60,0.03)' : 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
