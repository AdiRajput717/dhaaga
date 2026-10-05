'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdminNav from '@/components/admin/AdminNav'
import { BagCountManager, Toast } from '@/components/ProductGrid'
import { getDashboardStats, getRecentOrders, DashboardStats } from '@/lib/admin'
import { Order } from '@/lib/orders'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/data'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login?redirect=/admin')
        return
      }
      if (user.role !== 'admin') {
        router.replace('/account')
        return
      }

      Promise.all([getDashboardStats(), getRecentOrders()])
        .then(([statsRes, ordersRes]) => {
          setStats(statsRes.stats)
          setRecentOrders(ordersRes.orders || [])
        })
        .catch((err) => {
          setError(err?.message || 'Failed to load dashboard metrics')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [user, authLoading, router])

  if (authLoading || (user?.role === 'admin' && loading)) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: '2px solid rgba(6,34,60,0.15)',
                borderTopColor: '#C99A3D',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#496174' }}>
              Loading Admin Portal...
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <>
      <Navbar />
      <BagCountManager />
      <Toast />

      <main style={{ minHeight: '80vh', padding: '48px 24px 100px', maxWidth: 1180, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C99A3D', fontWeight: 600 }}>
            PORTAL OVERVIEW
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
              fontSize: '2.8rem',
              color: '#06223C',
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Admin Management
          </h1>
        </div>

        <AdminNav />

        {error && (
          <div style={{ background: 'rgba(180,40,40,0.08)', border: '1px solid rgba(180,40,40,0.2)', color: '#900', padding: '12px 16px', fontSize: 13, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              marginBottom: 48,
            }}
          >
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#496174', fontWeight: 600 }}>
                Total Revenue
              </span>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#06223C', marginTop: 6 }}>
                {formatPrice(stats.totalRevenue)}
              </p>
              <span style={{ fontSize: 12, color: '#2E7D32' }}>Paid orders</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#496174', fontWeight: 600 }}>
                Total Orders
              </span>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#06223C', marginTop: 6 }}>
                {stats.totalOrders}
              </p>
              <span style={{ fontSize: 12, color: '#C99A3D' }}>{stats.pendingOrders} pending fulfillment</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#496174', fontWeight: 600 }}>
                Active Products
              </span>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#06223C', marginTop: 6 }}>
                {stats.totalProducts}
              </p>
              <span style={{ fontSize: 12, color: '#496174' }}>Across {stats.totalCategories} categories</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#496174', fontWeight: 600 }}>
                Delivered Orders
              </span>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#06223C', marginTop: 6 }}>
                {stats.deliveredOrders}
              </p>
              <span style={{ fontSize: 12, color: '#2E7D32' }}>{stats.totalReviews} customer reviews</span>
            </div>
          </div>
        )}

        {/* Recent Orders Section */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '32px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '1.8rem', color: '#06223C', fontWeight: 500 }}>
              Recent Customer Orders
            </h2>
            <Link href="/admin/orders" style={{ fontSize: 12, color: '#C99A3D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Manage All Orders →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(6,34,60,0.1)', color: '#496174' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order #</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Items</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid rgba(6,34,60,0.05)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#06223C' }}>
                        {ord.orderNumber}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {typeof ord.user === 'object' ? ord.user?.name || ord.user?.email : 'Guest'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#496174' }}>
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {ord.items.length} items
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {formatPrice(ord.totalAmount)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            padding: '3px 8px',
                            background: ord.orderStatus === 'delivered' ? 'rgba(46,125,50,0.1)' : 'rgba(201,154,61,0.15)',
                            color: ord.orderStatus === 'delivered' ? '#2E7D32' : '#06223C',
                          }}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link
                          href={`/order/${ord._id}`}
                          style={{ color: '#06223C', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#496174', padding: '20px 0' }}>No orders recorded yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
