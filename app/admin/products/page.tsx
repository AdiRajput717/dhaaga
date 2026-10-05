'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdminNav from '@/components/admin/AdminNav'
import { BagCountManager, Toast } from '@/components/ProductGrid'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
} from '@/lib/admin'
import { Product as APIProduct } from '@/lib/products'
import { Category } from '@/lib/categories'
import { useAuth } from '@/context/AuthContext'
import { formatPrice } from '@/lib/data'

interface VariantForm {
  size: string
  color: string
  stock: number
}

interface ProductFormState {
  name: string
  slug: string
  description: string
  price: number
  category: string
  images: string
  isActive: boolean
  variants: VariantForm[]
}

const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  price: 1499,
  category: '',
  images: '',
  isActive: true,
  variants: [
    { size: 'S', color: 'Ivory', stock: 15 },
    { size: 'M', color: 'Ivory', stock: 20 },
    { size: 'L', color: 'Ivory', stock: 15 },
  ],
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [products, setProducts] = useState<APIProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | undefined>(undefined)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormState>(INITIAL_PRODUCT_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        getAdminProducts({ q: search || undefined, status: statusFilter }),
        getAdminCategories(),
      ])
      setProducts(prodRes.products || [])
      setCategories(catRes.categories || [])
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Failed to load products' })
      )
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login?redirect=/admin/products')
        return
      }
      loadData()
    }
  }, [user, authLoading, router, loadData])

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      ...INITIAL_PRODUCT_FORM,
      category: categories[0]?._id || '',
    })
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (prod: APIProduct) => {
    setEditingId(prod._id)
    setFormData({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      category: typeof prod.category === 'object' ? prod.category._id : prod.category,
      images: prod.images?.join('\n') || '',
      isActive: prod.isActive,
      variants: prod.variants?.map((v) => ({ size: v.size, color: v.color, stock: v.stock })) || [],
    })
    setFormError('')
    setShowModal(true)
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this product from the public catalog?')) return
    try {
      await deleteProduct(id)
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: 'Product deactivated' })
      )
      loadData()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Operation failed' })
      )
    }
  }

  const handleReactivate = async (prod: APIProduct) => {
    try {
      await updateProduct(prod._id, { isActive: true })
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: 'Product reactivated' })
      )
      loadData()
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent('dhaaga:toast', { detail: err?.message || 'Operation failed' })
      )
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const imagesArray = formData.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      setSubmitting(true)
      if (editingId) {
        await updateProduct(editingId, {
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          images: imagesArray,
          variants: formData.variants,
          isActive: formData.isActive,
        })
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', { detail: 'Product updated successfully' })
        )
      } else {
        await createProduct({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          images: imagesArray,
          variants: formData.variants,
          isActive: formData.isActive,
        })
        window.dispatchEvent(
          new CustomEvent('dhaaga:toast', { detail: 'Product created successfully' })
        )
      }

      setShowModal(false)
      loadData()
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: 'M', color: 'Ivory', stock: 10 }],
    }))
  }

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const updateVariantField = (index: number, field: keyof VariantForm, value: any) => {
    setFormData((prev) => {
      const next = [...prev.variants]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, variants: next }
    })
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
              INVENTORY &amp; CATALOG
            </span>
            <h1 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '2.8rem', color: '#06223C', fontWeight: 500, marginTop: 4 }}>
              Manage Products
            </h1>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary"
            style={{ display: 'inline-flex' }}
          >
            + ADD PRODUCT
          </button>
        </div>

        <AdminNav />

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid rgba(6,34,60,0.15)', background: '#FFF', fontSize: 13, minWidth: 260 }}
          />

          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter((e.target.value as any) || undefined)}
            style={{ padding: '10px 14px', border: '1px solid rgba(6,34,60,0.15)', background: '#FFF', fontSize: 13 }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Products Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(6,34,60,0.08)', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#496174' }}>
                Loading catalog...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(6,34,60,0.1)', color: '#496174' }}>
                    <th style={{ padding: '12px 14px' }}>Product</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Price</th>
                    <th style={{ padding: '12px 14px' }}>Variants (Stock)</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => {
                    const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0
                    return (
                      <tr key={prod._id} style={{ borderBottom: '1px solid rgba(6,34,60,0.05)' }}>
                        <td style={{ padding: '14px' }}>
                          <strong style={{ color: '#06223C', display: 'block' }}>{prod.name}</strong>
                          <span style={{ fontSize: 11, color: '#496174' }}>/{prod.slug}</span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {typeof prod.category === 'object' ? prod.category.name : '—'}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 600 }}>
                          {formatPrice(prod.price)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span>{prod.variants?.length || 0} variants ({totalStock} total in stock)</span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span
                            style={{
                              fontSize: 10,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              padding: '2px 8px',
                              background: prod.isActive ? 'rgba(46,125,50,0.1)' : 'rgba(180,40,40,0.1)',
                              color: prod.isActive ? '#2E7D32' : '#C33',
                            }}
                          >
                            {prod.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <button
                              type="button"
                              onClick={() => openEditModal(prod)}
                              style={{ color: '#06223C', fontWeight: 600, textDecoration: 'underline' }}
                            >
                              Edit
                            </button>
                            {prod.isActive ? (
                              <button
                                type="button"
                                onClick={() => handleDeactivate(prod._id)}
                                style={{ color: '#C33', textDecoration: 'underline' }}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReactivate(prod)}
                                style={{ color: '#2E7D32', textDecoration: 'underline' }}
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '30px 0', textAlign: 'center', color: '#496174' }}>No products found matching criteria.</p>
          )}
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 36 }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)", fontSize: '1.8rem', color: '#06223C', marginBottom: 4 }}>
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h3>

            {formError && (
              <div style={{ background: 'rgba(180,40,40,0.08)', border: '1px solid rgba(180,40,40,0.2)', color: '#900', padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                    Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-if-blank"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)', background: '#FFF' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)', fontFamily: 'inherit', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600, marginBottom: 4 }}>
                  Image URLs (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(6,34,60,0.2)', fontFamily: 'inherit', fontSize: 13 }}
                />
              </div>

              {/* Variants Builder */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06223C', fontWeight: 600 }}>
                    Variants &amp; Stock
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    style={{ fontSize: 11, color: '#C99A3D', fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    + Add Variant
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formData.variants.map((v, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Size (e.g. M)"
                        value={v.size}
                        onChange={(e) => updateVariantField(idx, 'size', e.target.value)}
                        required
                        style={{ padding: '6px 10px', border: '1px solid rgba(6,34,60,0.2)', fontSize: 12 }}
                      />
                      <input
                        type="text"
                        placeholder="Color (e.g. Navy)"
                        value={v.color}
                        onChange={(e) => updateVariantField(idx, 'color', e.target.value)}
                        required
                        style={{ padding: '6px 10px', border: '1px solid rgba(6,34,60,0.2)', fontSize: 12 }}
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Stock"
                        value={v.stock}
                        onChange={(e) => updateVariantField(idx, 'stock', Number(e.target.value))}
                        required
                        style={{ padding: '6px 10px', border: '1px solid rgba(6,34,60,0.2)', fontSize: 12 }}
                      />
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          style={{ color: '#C33', fontSize: 14, padding: '4px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#06223C', marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Product is active and visible in store
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 12 }}
              >
                {submitting ? 'SAVING PRODUCT...' : 'SAVE PRODUCT'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
