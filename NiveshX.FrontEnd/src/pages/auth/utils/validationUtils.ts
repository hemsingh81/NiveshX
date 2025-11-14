import toast from 'react-hot-toast';

export const validateProfile = (
  profile: { name: string; phoneNumber: string },
  setErrorField: (field: string | null) => void,
  setErrorMessage: (msg: string) => void
): boolean => {
  const { name, phoneNumber } = profile;

  if (!name.trim() || !phoneNumber.trim()) {
    const missing = !name.trim() ? 'name' : 'phoneNumber';
    setErrorField(missing);
    setErrorMessage('Please fill in all required fields.');
    toast.error('Missing profile field.');
    return false;
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    setErrorField('phoneNumber');
    setErrorMessage('Phone number must be a valid 10-digit number.');
    toast.error('Invalid phone number format.');
    return false;
  }

  return true;
};
