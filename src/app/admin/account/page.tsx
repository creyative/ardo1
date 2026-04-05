'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminAccountPage() {
  const { data: session } = useSession()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('password')

  // Change password form
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Change username form
  const [usernameForm, setUsernameForm] = useState({ currentPassword: '', newUsername: '' })
  const [usernameLoading, setUsernameLoading] = useState(false)

  // Email form
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [devCode, setDevCode] = useState('')

  useEffect(() => {
    fetch('/api/admin/account')
      .then(r => r.json())
      .then(data => {
        setAdmin(data)
        setUsernameForm({ ...usernameForm, newUsername: data.username })
        setEmailForm({ ...emailForm, newEmail: data.email || '' })
        setLoading(false)
      })
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Password baru tidak cocok')
      return
    }

    setPasswordLoading(true)
    const res = await fetch('/api/admin/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage('Password berhasil diubah')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      setMessage(`Error: ${data.error}`)
    }
    setPasswordLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameLoading(true)
    const res = await fetch('/api/admin/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: usernameForm.currentPassword,
        newUsername: usernameForm.newUsername,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setAdmin(data)
      setMessage('Username berhasil diubah')
      setUsernameForm({ ...usernameForm, currentPassword: '' })
    } else {
      setMessage(`Error: ${data.error}`)
    }
    setUsernameLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    const res = await fetch('/api/admin/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setAdmin(data)
      setMessage('Email berhasil diubah. Silakan verifikasi email Anda.')
      setShowVerificationForm(true)
      
      // Request verification code
      const verifyRes = await fetch('/api/admin/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email_verification' }),
      })
      
      const verifyData = await verifyRes.json()
      if (verifyData.devCode) {
        setDevCode(verifyData.devCode)
      }
      
      setEmailForm({ ...emailForm, currentPassword: '' })
    } else {
      setMessage(`Error: ${data.error}`)
    }
    setEmailLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyLoading(true)
    const res = await fetch('/api/admin/verify-code', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verificationCode, type: 'email_verification' }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage('Email berhasil diverifikasi')
      setAdmin({ ...admin, email_verified: true })
      setShowVerificationForm(false)
      setVerificationCode('')
    } else {
      setMessage(`Error: ${data.error}`)
    }
    setVerifyLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <AdminLayout><div className="p-8 text-gray-500">Memuat...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Akun Admin</h1>

        {message && (
          <div className={`rounded-lg p-3 text-sm mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Ganti Password
          </button>
          <button
            onClick={() => setActiveTab('username')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'username'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Ganti Username
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Email {admin?.email_verified && <span className="text-green-600 ml-1">✓</span>}
          </button>
        </div>

        {/* Change Password */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <form onSubmit={handlePasswordChange}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {passwordLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          </div>
        )}

        {/* Change Username */}
        {activeTab === 'username' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <form onSubmit={handleUsernameChange}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={usernameForm.currentPassword}
                  onChange={e => setUsernameForm({ ...usernameForm, currentPassword: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username Baru</label>
                <input
                  type="text"
                  value={usernameForm.newUsername}
                  onChange={e => setUsernameForm({ ...usernameForm, newUsername: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={usernameLoading}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {usernameLoading ? 'Menyimpan...' : 'Simpan Username Baru'}
              </button>
            </form>
          </div>
        )}

        {/* Email Management */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            {!showVerificationForm ? (
              <form onSubmit={handleEmailChange}>
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    Email saat ini: <strong>{admin?.email || 'Belum terdaftar'}</strong>
                    {admin?.email_verified && <span className="text-green-600 ml-2">✓ Terverifikasi</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    value={emailForm.currentPassword}
                    onChange={e => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Baru</label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {emailLoading ? 'Menyimpan...' : 'Simpan Email Baru'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode}>
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    Email baru <strong>{emailForm.newEmail}</strong> memerlukan verifikasi. Cek email Anda untuk kode verifikasi.
                  </p>
                </div>
                {devCode && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Mode Development:</strong> Kode verifikasi Anda adalah: <strong className="text-lg font-mono">{devCode}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(devCode)
                        setMessage('Kode disalin ke clipboard')
                        setTimeout(() => setMessage(''), 2000)
                      }}
                      className="text-xs text-yellow-600 hover:underline mt-1"
                    >
                      Salin Kode
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Verifikasi (6 digit)</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    placeholder="000000"
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-2xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {verifyLoading ? 'Memverifikasi...' : 'Verifikasi Email'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
