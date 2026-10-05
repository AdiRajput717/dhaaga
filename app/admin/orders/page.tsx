'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdminNav from '@/components/admin/AdminNav'
import { BagCountManager, Toast } from '@/components/ProductGrid'
import { getAdminOrders, updateOrderStatus } from '@/lib/admin'
import { Order } from '@/lib/orders'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/data'

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getAdminOrders({
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      })
      setOrders(res.orders || [])
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Failed to load orders' })
      )
    } finally {
      setLoading(false)
    }
  }, [statusFilter, paymentFilter])

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login?redirect=/admin/orders')
        return
      }
      loadOrders()
    }
  }, [user, authLoading, router, loadOrders])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId)
      await updateOrderStatus(orderId, newStatus)
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: `Status updated to ${newStatus}` })
      )
      loadOrders()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Status transition invalid' })
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <Navbar />
      <BagCountManager />
      <Toast />

      <main style={{ minHeight: '80vh', padding: '48px 24px 100px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C99A3D', fontWeight: 600 }}>
            FULFILLMENT &amp; SHIPMENTS
          </span>
          <h1 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '2.8rem', color: '#06223C', fontWeight: 500, marginTop: 4 }}>
            Order Management
          </h1>
        </div>

        <AdminNav />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid rgba(6,34,60,0.15)', background: '#FFF', fontSize: 13 }}
          >
            <option value="">All Order Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid rgba(6,34,60,0.15)', background: '#FFF', fontSize: 13 }}
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Orders Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#496174' }}>
                Loading orders...
              </p>
            </div>
          ) : orders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(6,34,60,0.1)', color: '#496174' }}>
                    <th style={{ padding: '12px 14px' }}>Order #</th>
                    <th style={{ padding: '12px 14px' }}>Customer</th>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 14px' }}>Total</th>
                    <th style={{ padding: '12px 14px' }}>Payment</th>
                    <th style={{ padding: '12px 14px' }}>Order Status</th>
                    <th style={{ padding: '12px 14px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const isBusy = updatingId === ord._id
                    return (
                      <tr key={ord._id} style={{ borderBottom: '1px solid rgba(6,34,60,0.05)' }}>
                        <td style={{ padding: '14px', fontWeight: 600, color: '#06223C' }}>
                          {ord.orderNumber}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <strong style={{ display: 'block', color: '#06223C' }}>
                            {ord.shippingAddress?.fullName || 'Customer'}
                          </strong>
                          <span style={{ fontSize: 11, color: '#496174' }}>
                            {typeof ord.user === 'object' ? ord.user?.email : ''}
                          </span>
                        </td>
                        <td style={{ padding: '14px', color: '#496174' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 700 }}>
                          {formatPrice(ord.totalAmount)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 600, color: ord.paymentStatus === 'paid' ? '#2E7D32' : '#C99A3D' }}>
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <select
                            disabled={isBusy}
                            value={ord.orderStatus}
                            onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              border: '1px solid rgba(6,34,60,0.2)',
                              fontSize: 12,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: '#FFF',
                            }}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            style={{ color: '#06223C', fontWeight: 600, textDecoration: 'underline' }}
                          >
                            View Items
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '30px 0', textAlign: 'center', color: '#496174' }}>No orders found.</p>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: 560, padding: 36 }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '1.8rem', color: '#06223C', marginBottom: 6 }}>
              Order #{selectedOrder.orderNumber}
            </h3>
            <p style={{ fontSize: 13, color: '#496174', marginBottom: 20 }}>
              Destination: {selectedOrder.shippingAddress.fullName}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} ({selectedOrder.shippingAddress.phone})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
              {selectedOrder.items.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(6,34,60,0.06)' }}>
                  <div>
                    <strong style={{ fontSize: 14, color: '#06223C' }}>{item.productName}</strong>
                    <p style={{ fontSize: 12, color: '#496174' }}>
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#06223C', paddingTop: 10, borderTop: '1px solid rgba(6,34,60,0.1)' }}>
              <span>Total Amount</span>
              <span>{formatPrice(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
