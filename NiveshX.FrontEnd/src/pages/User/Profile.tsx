import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { profileImg } from '../../assets/images';
import { getUserProfile, changePassword } from '../../services/authService';
import { ProfileDetails, ProfileImageUpload, ChangePassword } from './components';
import axios from 'axios';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [imagePreview, setImagePreview] = useState(profileImg);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        if (data.profileImageUrl) setImagePreview(data.profileImageUrl);
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

  const saveProfileDetails = () => {
    console.log('Saved profile details:', profile);
    // TODO: Call updateProfile API
  };

  const saveProfileImage = () => {
    console.log('Saved profile image');
    // TODO: Upload image to server
  };

  const savePassword = async (
    payload: { currentPassword: string; newPassword: string }
  ): Promise<void> => {
    try {
      console.log('Saving password with payload:', payload);
      await changePassword(payload);
      console.log('Password updated successfully');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        switch (status) {
          case 400:
            console.error('Bad Request: Invalid password or missing fields.');
            throw new Error('Invalid input. Please check your password.');
          case 401:
            console.error('Unauthorized: Invalid credentials or session expired.');
            throw new Error('Unauthorized. Please log in again.');
          case 500:
            console.error('Server Error: Something went wrong on the server.');
            throw new Error('Server error. Please try again later.');
          default:
            console.error('Unexpected error:', error.message);
            throw new Error('Failed to update password. Please try again.');
        }
      } else {
        console.error('Unknown error:', error);
        throw new Error('Unexpected error occurred. Please try again.');
      }
    }
  };

  const resetPasswords = () => {
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
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
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 btn-siteCancel rounded shadow"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfileImageUpload
            imagePreview={imagePreview}
            isEditing={isEditing}
            onUpload={handleImageUpload}
            onSave={saveProfileImage}
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
