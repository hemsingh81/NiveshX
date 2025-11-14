import toast from 'react-hot-toast';

export const validatePassword = (
  passwords: { current: string; new: string; confirm: string },
  setErrorField: (field: string | null) => void,
  setErrorMessage: (msg: string) => void
): boolean => {
  const { current, new: newPass, confirm } = passwords;

  if (!current.trim() || !newPass.trim() || !confirm.trim()) {
    const missing = !current.trim()
      ? 'current'
      : !newPass.trim()
      ? 'new'
      : 'confirm';

    setErrorField(missing);
    setErrorMessage('Please fill in all password fields.');
    toast.error('Missing password field.');
    return false;
  }

  if (newPass !== confirm) {
    setErrorField('confirm');
    setErrorMessage('New password and confirmation do not match.');
    toast.error('Password mismatch.');
    return false;
  }

  return true;
};
