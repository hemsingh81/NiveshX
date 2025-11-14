import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { profileImg } from '../../assets/images';
import {
  getUserProfile,
  changePassword,
  updateProfile,
  uploadProfileImage,
} from '../../services/profileService';
import { ProfileDetails, ProfileImageUpload, ChangePassword } from './components';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    profilePictureUrl?: string;
  }>({ name: '', email: '', phoneNumber: '', role: '', profilePictureUrl: '' });

  const [defaultProfile, setDefaultProfile] = useState(profile);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setDefaultProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const updateField = (setter: React.Dispatch<React.SetStateAction<any>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setter((prev: any) => ({ ...prev, [name]: value }));
    };

  const saveProfileDetails = async (payload: { name: string; phoneNumber: string }) => {
    await updateProfile(payload);
    setIsEditing(false);
  };

  const savePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    await changePassword(payload);
  };

  const resetPasswords = () => {
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleImageSave = async (file: File) => {
    try {
      await uploadProfileImage(file);
      const updated = await getUserProfile();
      setProfile(updated);
      setDefaultProfile(updated); 
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10 p-6 rounded-lg shadow-xl border primary-siteBdColor">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Profile</h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 btn-sitePrimary rounded shadow"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setProfile(defaultProfile);
                  resetPasswords();
                }}
                className="px-4 py-2 btn-siteCancel rounded shadow"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfileImageUpload
            imageUrl={profile.profilePictureUrl || profileImg}
            isEditing={isEditing}
            onSave={handleImageSave}
          />

          <div className="md:col-span-2 space-y-4">
            <ProfileDetails
              profile={profile}
              isEditing={isEditing}
              onChange={updateField(setProfile)}
              onSave={saveProfileDetails}
            />

            {isEditing && (
              <ChangePassword
                passwords={passwords}
                onChange={updateField(setPasswords)}
                onSave={savePassword}
                resetPasswords={resetPasswords}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
