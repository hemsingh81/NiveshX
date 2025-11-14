import React, { useEffect, useState } from 'react';
import { profileImg } from '../../../assets/images';

interface Props {
  imageUrl: string;
  isEditing: boolean;
  onSave: (file: File) => void;
}

const ProfileImageUpload: React.FC<Props> = ({ imageUrl, isEditing, onSave }) => {

  const [preview, setPreview] = useState(imageUrl);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSave = () => {
    if (file) {
      onSave(file);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col items-center md:items-start">
      <img
        src={preview || profileImg}
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
              onChange={handleUpload}
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
            onClick={handleSave}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Save Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
