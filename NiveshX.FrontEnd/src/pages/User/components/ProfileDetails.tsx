import React, { useState } from 'react';
import CustomButton from '../../../controls/CustomButton';
import { validateProfile  } from '../utils/validationUtils';

interface Props {
  profile: { name: string; email: string; phoneNumber: string; role: string };
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (payload: { name: string; phoneNumber: string }) => Promise<void>;
}

const editableFields = ['name', 'phoneNumber'];
const profileFields = ['name', 'phoneNumber', 'email', 'role'];

const ProfileDetails: React.FC<Props> = ({ profile, isEditing, onChange, onSave }) => {
  const [errorField, setErrorField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const isValid = validateProfile(profile, setErrorField, setErrorMessage);
    if (!isValid) return;

    setErrorField(null);
    setErrorMessage('');
    try {
      setLoading(true);
      await onSave({ name: profile.name, phoneNumber: profile.phoneNumber });
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    const { name, value } = e.target;
    if (errorField === name && value.trim() !== '') {
      setErrorField(null);
      setErrorMessage('');
    }
  };

  return (
    <div className="space-y-4">
      {profileFields.map((field) => {
        const isEditable = editableFields.includes(field) && isEditing;
        return (
          <div key={field}>
            <label className="block text-sm mb-1 capitalize">{field}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              value={(profile as any)[field]}
              onChange={handleChange}
              readOnly={!isEditable}
              className={`w-full px-4 py-2 rounded text-white border focus:outline-none ${errorField === field
                ? 'bg-red-900 border-red-500 focus:ring-2 focus:ring-red-500'
                : isEditable
                  ? 'primary-siteColor primary-siteBdColor focus:ring-2 focus:ring-purple-500'
                  : 'bg-gray-800 border-gray-700'
                }`}
            />
            {errorField === field && errorMessage && (
              <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
            )}
          </div>
        );
      })}
      {isEditing && (
        <div className="flex justify-end pt-2">
          <CustomButton
            loading={loading}
            label="Save Details"
            loadingLabel="Saving..."
            type="button"
            color="green"
            onClick={handleSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
