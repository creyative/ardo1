'use client'
import { useEffect, useState, useRef } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function SettingsPage() {
  const [form, setForm] = useState({
    company_name: '',
    tagline: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    favicon_url: '',
    primary_color: 'blue',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')
  const logoFileRef = useRef<HTMLInputElement>(null)
  const faviconFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d && d.company_name !== undefined) {
          setForm(prev => ({ ...prev, ...d }))
          if (d.logo_url) setLogoPreview(d.logo_url)
          if (d.favicon_url) setFaviconPreview(d.favicon_url)
        }
        setLoading(false)
      })
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      setForm(prev => ({ ...prev, logo_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFaviconPreview(base64)
      setForm(prev => ({ ...prev, favicon_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setForm(prev => ({ ...prev, ...data }))
      if (data.logo_url) setLogoPreview(data.logo_url)
      if (data.favicon_url) setFaviconPreview(data.favicon_url)
      setMessage('Pengaturan berhasil disimpan')
    } else {
      setMessage(`Gagal menyimpan pengaturan: ${data.error || 'Unknown error'}`)
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <AdminLayout><div className="p-8 text-gray-500">Memuat...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Perusahaan</h1>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold mb-4">Logo Perusahaan</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">Belum ada logo</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => logoFileRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm hover:bg-blue-100">
                  Upload Logo
                </button>
                <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <p className="text-xs text-gray-400 mt-2">Format: PNG, JPG, SVG. Maks 2MB.</p>
                {logoPreview && (
                  <button type="button" onClick={() => { setLogoPreview(''); setForm(prev => ({ ...prev, logo_url: '' })) }}
                    className="text-xs text-red-500 mt-1 hover:underline block">
                    Hapus Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Favicon */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold mb-4">Favicon Perusahaan</h2>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {faviconPreview ? (
                  <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">Belum ada favicon</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => faviconFileRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm hover:bg-blue-100">
                  Upload Favicon
                </button>
                <input ref={faviconFileRef} type="file" accept=".ico,.png,.svg" className="hidden" onChange={handleFaviconChange} />
                <p className="text-xs text-gray-400 mt-2">Format: ICO, PNG, SVG. Maks 512KB.</p>
                {faviconPreview && (
                  <button type="button" onClick={() => { setFaviconPreview(''); setForm(prev => ({ ...prev, favicon_url: '' })) }}
                    className="text-xs text-red-500 mt-1 hover:underline block">
                    Hapus Favicon
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Warna Sidebar */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold mb-4">Warna Sidebar Admin</h2>
            <p className="text-sm text-gray-500 mb-3">Pilih warna yang sesuai dengan logo perusahaan Anda:</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'blue', label: 'Biru', bg: 'bg-blue-600' },
                { name: 'purple', label: 'Ungu', bg: 'bg-purple-600' },
                { name: 'green', label: 'Hijau', bg: 'bg-green-600' },
                { name: 'red', label: 'Merah', bg: 'bg-red-600' },
                { name: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
              ].map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setForm({ ...form, primary_color: color.name as any })}
                  className={`p-4 rounded-lg flex items-center gap-3 border-2 transition-all ${
                    form.primary_color === color.name ? 'border-gray-900 shadow-lg' : 'border-transparent hover:shadow'
                  }`}
                >
                  <div className={`w-6 h-6 rounded ${color.bg}`}></div>
                  <span className="text-sm font-medium text-gray-700">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Perusahaan */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold mb-2">Informasi Perusahaan</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan / Instansi <span className="text-red-500">*</span></label>
              <input type="text" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Slogan</label>
              <input type="text" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {message && (
            <div className={`rounded-lg p-3 text-sm ${message.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
