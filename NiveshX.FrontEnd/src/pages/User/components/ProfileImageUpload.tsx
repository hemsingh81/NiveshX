import React from 'react';
import { profileImg } from '../../../assets/images';

interface Props {
  imagePreview: string;
  isEditing: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const ProfileImageUpload: React.FC<Props> = ({ imagePreview, isEditing, onUpload, onSave }) => (
  <div className="flex flex-col items-center md:items-start">
    <img
      src={imagePreview || profileImg}
      alt="Profile"
      className="w-56 h-56 rounded-full border-4 border-white object-cover mb-4"
    />
    {isEditing && (
      <div className="flex flex-col items-center justify-center">
        <label className="block text-sm font-medium mb-2 text-center">Change Profile Image</label>
        <div className="relative w-fit">
          <input
            type="file"
            accept="image/*"
            id="profileImageUpload"
            onChange={onUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <label
            htmlFor="profileImageUpload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0 0l-3-3m3 3l3-3M12 3v9" />
            </svg>
            Upload Image
          </label>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
        >
          Save Image
        </button>
      </div>
    )}
  </div>
);

export default ProfileImageUpload;
