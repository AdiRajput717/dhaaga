'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdminNav from '@/components/admin/AdminNav'
import { BagCountManager, Toast } from '@/components/ProductGrid'
import {
  getAdminReviews,
  setReviewApproval,
  deleteAdminReview,
} from '@/lib/admin'
import { Review } from '@/lib/reviews'
import { useAuth } from '@/context/AuthContext'

export default function AdminReviewsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'hidden'>('all')

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      const approvedParam =
        approvalFilter === 'all'
          ? undefined
          : approvalFilter === 'approved'

      const res = await getAdminReviews({ approved: approvedParam })
      setReviews(res.reviews || [])
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Failed to load reviews' })
      )
    } finally {
      setLoading(false)
    }
  }, [approvalFilter])

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login?redirect=/admin/reviews')
        return
      }
      loadReviews()
    }
  }, [user, authLoading, router, loadReviews])

  const handleToggleApproval = async (review: Review) => {
    try {
      await setReviewApproval(review._id, !review.isApproved)
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', {
          detail: review.isApproved ? 'Review hidden from store' : 'Review approved for store',
        })
      )
      loadReviews()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Action failed' })
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this customer review?')) return
    try {
      await deleteAdminReview(id)
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: 'Review deleted' })
      )
      loadReviews()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Delete failed' })
      )
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
            COMMUNITY &amp; FEEDBACK
          </span>
          <h1 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '2.8rem', color: '#06223C', fontWeight: 500, marginTop: 4 }}>
            Review Moderation
          </h1>
        </div>

        <AdminNav />

        {/* Filter */}
        <div style={{ marginBottom: 24 }}>
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value as any)}
            style={{ padding: '10px 14px', border: '1px solid rgba(6,34,60,0.15)', background: '#FFF', fontSize: 13 }}
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved &amp; Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>

        {/* Reviews List */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#496174' }}>
                Loading customer reviews...
              </p>
            </div>
          ) : reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    border: '1px solid rgba(6,34,60,0.08)',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <strong style={{ fontSize: 15, color: '#06223C' }}>
                        {typeof rev.product === 'object' ? rev.product?.name : 'Product'}
                      </strong>
                      <span style={{ fontSize: 12, color: '#496174', marginLeft: 8 }}>
                        by {typeof rev.user === 'object' ? rev.user?.name || rev.user?.email : 'Customer'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ color: '#C99A3D', fontSize: 15 }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>

                      <span
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 8px',
                          background: rev.isApproved ? 'rgba(46,125,50,0.1)' : 'rgba(180,40,40,0.1)',
                          color: rev.isApproved ? '#2E7D32' : '#C33',
                        }}
                      >
                        {rev.isApproved ? 'APPROVED' : 'HIDDEN'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: '#2b2b2b', lineHeight: 1.6 }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(6,34,60,0.05)', paddingTop: 10, fontSize: 12 }}>
                    <span style={{ color: '#496174' }}>
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    <div style={{ display: 'flex', gap: 14 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(rev)}
                        style={{ color: rev.isApproved ? '#A33' : '#2E7D32', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        {rev.isApproved ? 'Hide Review' : 'Approve Review'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(rev._id)}
                        style={{ color: '#A33', textDecoration: 'underline' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ padding: '30px 0', textAlign: 'center', color: '#496174' }}>No reviews found for this filter.</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
