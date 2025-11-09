import React from 'react';

interface Props {
  profile: { name: string; email: string; phone: string; role: string };
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const editableFields = ['name', 'phone'];
const profileFields = ['name', 'phone', 'email', 'role'];

const ProfileDetails: React.FC<Props> = ({ profile, isEditing, onChange, onSave }) => (
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
            onChange={onChange}
            readOnly={!isEditable}
            className={`w-full px-4 py-2 rounded text-white border focus:outline-none ${
              isEditable
                ? 'primary-siteColor primary-siteBdColor focus:ring-2 focus:ring-purple-500'
                : 'bg-gray-800 border-gray-700'
            }`}
          />
        </div>
      );
    })}
    {isEditing && (
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
        >
          Save Details
        </button>
      </div>
    )}
  </div>
);

export default ProfileDetails;
