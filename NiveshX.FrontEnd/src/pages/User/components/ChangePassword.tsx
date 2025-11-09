import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  passwords: { current: string; new: string; confirm: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  resetPasswords: () => void;
}

const passwordFields = [
  { label: 'Current Password', name: 'current' },
  { label: 'New Password', name: 'new' },
  { label: 'Confirm Password', name: 'confirm' },
];

const getStrength = (password: string): 'Weak' | 'Medium' | 'Strong' => {
  if (password.length < 6) return 'Weak';
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Strong';
  return 'Medium';
};

const ChangePassword: React.FC<Props> = ({ passwords, onChange, onSave, resetPasswords }) => {
  const [errorField, setErrorField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = getStrength(passwords.new);

  const handleSubmit = async () => {
    const { current, new: newPass, confirm } = passwords;

    if (!current || !newPass || !confirm) {
      const missing = !current ? 'current' : !newPass ? 'new' : 'confirm';
      setErrorField(missing);
      setErrorMessage('Please fill in all password fields.');
      toast.error('Missing password field.');
      return;
    }

    if (newPass !== confirm) {
      setErrorField('confirm');
      setErrorMessage('New password and confirmation do not match.');
      toast.error('Password mismatch.');
      return;
    }

    setErrorField(null);
    setErrorMessage('');
    try {
      setLoading(true);
      await onSave({ currentPassword: current, newPassword: newPass });
      toast.success('Password updated successfully!');
      resetPasswords(); // ✅ Clear all fields
    } catch {
      toast.error('Failed to update password.');
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
      <hr className="border-gray-700 mt-6 mb-4" />
      <h3 className="text-lg font-medium mb-2">Change Password</h3>

      {passwordFields.map(({ label, name }) => (
        <div key={name}>
          <label className="block text-sm mb-1">{label}</label>
          <input
            type="password"
            name={name}
            value={(passwords as any)[name]}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded text-white border focus:outline-none ${
              errorField === name
                ? 'bg-red-900 border-red-500 focus:ring-2 focus:ring-red-500'
                : 'primary-siteColor primary-siteBdColor focus:ring-2 focus:ring-purple-500'
            }`}
          />
          {errorField === name && errorMessage && (
            <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
          )}
        </div>
      ))}

      {/* Password Strength Meter */}
      <div>
        <label className="block text-sm mb-1">Password Strength</label>
        <div
          className={`w-full h-2 rounded ${
            strength === 'Weak'
              ? 'bg-red-500'
              : strength === 'Medium'
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
        />
        <p className="text-xs mt-1 text-gray-300">{strength}</p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 btn-sitePrimary rounded shadow ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Password'}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
