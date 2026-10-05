'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdminNav from '@/components/admin/AdminNav'
import { BagCountManager, Toast } from '@/components/ProductGrid'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/admin'
import { Category } from '@/lib/categories'
import { useAuth } from '@/context/AuthContext'

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getAdminCategories()
      setCategories(res.categories || [])
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Failed to load categories' })
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login?redirect=/admin/categories')
        return
      }
      loadCategories()
    }
  }, [user, authLoading, router, loadCategories])

  const openAddModal = () => {
    setEditingId(null)
    setName('')
    setSlug('')
    setDescription('')
    setImage('')
    setIsActive(true)
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingId(cat._id)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
    setImage(cat.image || '')
    setIsActive(cat.isActive)
    setFormError('')
    setShowModal(true)
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this category? Associated products will be hidden.')) return
    try {
      await deleteCategory(id)
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: 'Category deactivated' })
      )
      loadCategories()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Action failed' })
      )
    }
  }

  const handleReactivate = async (cat: Category) => {
    try {
      await updateCategory(cat._id, { isActive: true })
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: 'Category reactivated' })
      )
      loadCategories()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Action failed' })
      )
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const generatedSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')

    try {
      setSubmitting(true)
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim(),
          image: image.trim(),
          isActive,
        })
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', { detail: 'Category updated successfully' })
        )
      } else {
        await createCategory({
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim(),
          image: image.trim(),
        })
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', { detail: 'Category created successfully' })
        )
      }

      setShowModal(false)
      loadCategories()
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <BagCountManager />
      <Toast />

      <main style={{ minHeight: '80vh', padding: '48px 24px 100px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C99A3D', fontWeight: 600 }}>
              TAXONOMY &amp; EDITS
            </span>
            <h1 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '2.8rem', color: '#06223C', fontWeight: 500, marginTop: 4 }}>
              Manage Categories
            </h1>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary"
            style={{ display: 'inline-flex' }}
          >
            + ADD CATEGORY
          </button>
        </div>

        <AdminNav />

        {/* Categories Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#496174' }}>
                Loading categories...
              </p>
            </div>
          ) : categories.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(6,34,60,0.1)', color: '#496174' }}>
                    <th style={{ padding: '12px 14px' }}>Category Name</th>
                    <th style={{ padding: '12px 14px' }}>Slug</th>
                    <th style={{ padding: '12px 14px' }}>Description</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} style={{ borderBottom: '1px solid rgba(6,34,60,0.05)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#06223C' }}>
                        {cat.name}
                      </td>
                      <td style={{ padding: '14px', color: '#496174' }}>
                        /{cat.slug}
                      </td>
                      <td style={{ padding: '14px', color: '#2b2b2b', maxWidth: 320 }}>
                        {cat.description || '—'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            padding: '2px 8px',
                            background: cat.isActive ? 'rgba(46,125,50,0.1)' : 'rgba(180,40,40,0.1)',
                            color: cat.isActive ? '#2E7D32' : '#C33',
                          }}
                        >
                          {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            style={{ color: '#06223C', fontWeight: 600, textDecoration: 'underline' }}
                          >
                            Edit
                          </button>
                          {cat.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(cat._id)}
                              style={{ color: '#C33', textDecoration: 'underline' }}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivate(cat)}
                              style={{ color: '#2E7D32', textDecoration: 'underline' }}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '30px 0', textAlign: 'center', color: '#496174' }}>No categories found.</p>
          )}
        </div>
      </main>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: 500, padding: 36 }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '1.8rem', color: '#06223C', marginBottom: 4 }}>
              {editingId ? 'Edit Category' : 'Create Category'}
            </h3>

            {formError && (
              <div style={{ background: 'rgba(180,40,40,0.08)', border: '1px solid rgba(180,40,40,0.2)', color: '#900', padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kurtas, Silk Essentials"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kurtas"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for collection header"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)', fontFamily: 'inherit', fontSize: 13 }}
                />
              </div>

              {editingId && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#06223C', marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Category is active and visible to customers
                </label>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 12 }}
              >
                {submitting ? 'SAVING CATEGORY...' : 'SAVE CATEGORY'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
