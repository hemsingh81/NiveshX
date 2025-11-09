import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { profileImg } from '../../assets/images';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Hem Singh',
    email: 'hem@example.com',
    phone: '+91 9876543210',
    role: 'Trader',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [imagePreview, setImagePreview] = useState(profileImg);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    console.log('Updated profile:', profile);
    console.log('Password change:', passwords);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10 p-6 rounded-lg shadow-xl border primary-siteColor">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Profile</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Panel: Profile Image */}
            <div className="flex flex-col items-center md:items-start">
              <img
                src={imagePreview}
                alt="Profile"
                className="w-56 h-56 rounded-full border-4 border-white object-cover mb-4"
              />
              {isEditing && (
                <div>
                  <label className="block text-sm mb-1">Change Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm text-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Right Panel: Info and Password */}
            <div className="md:col-span-2 space-y-4">
              {/* Profile Fields */}
              {['name', 'email', 'phone', 'role'].map((field) => {
                const isEditable = field === 'name' && isEditing;
                return (
                  <div key={field}>
                    <label className="block text-sm mb-1 capitalize">{field}</label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={(profile as any)[field]}
                      onChange={handleChange}
                      readOnly={!isEditable}
                      className={`w-full px-4 py-2 rounded text-white border focus:outline-none ${
                        isEditable
                          ? 'bg-purple-900 border-purple-500 focus:ring-2 focus:ring-purple-500'
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    />
                  </div>
                );
              })}

              {/* Password Section */}
              {isEditing && (
                <>
                  <hr className="border-gray-700 my-4" />
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>

                  {[
                    { label: 'Current Password', name: 'current' },
                    { label: 'New Password', name: 'new' },
                    { label: 'Confirm Password', name: 'confirm' },
                  ].map(({ label, name }) => (
                    <div key={name}>
                      <label className="block text-sm mb-1">{label}</label>
                      <input
                        type="password"
                        name={name}
                        value={(passwords as any)[name]}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 rounded bg-purple-900 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </>
              )}

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
