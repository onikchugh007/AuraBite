import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiSettings } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    // Update profile logic here
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-4xl font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user?.name}</h2>
              <p className="text-gray-400">Member since {new Date(user?.createdAt).getFullYear()}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-orange-500" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass outline-none"
                />
              ) : (
                <p className="px-4 py-3 text-gray-300">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-orange-500" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass outline-none"
                />
              ) : (
                <p className="px-4 py-3 text-gray-300">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-orange-500" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass outline-none"
                />
              ) : (
                <p className="px-4 py-3 text-gray-300">{user?.phone || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-orange-500" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass outline-none resize-none"
                  rows="3"
                />
              ) : (
                <p className="px-4 py-3 text-gray-300">{user?.address || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1 py-3 font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-semibold"
                >
                  <FiSettings className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 font-semibold flex items-center justify-center gap-2"
                >
                  <FiLogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
