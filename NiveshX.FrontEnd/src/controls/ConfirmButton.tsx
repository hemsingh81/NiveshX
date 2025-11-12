import React, { useState } from 'react';
import {
     Button,
     Dialog,
     DialogTitle,
     DialogContent,
     DialogContentText,
     DialogActions,
} from '@mui/material';

interface ConfirmButtonProps {
     onConfirm: () => void;
     label?: string;
     size?: 'small' | 'medium' | 'large';
     variant?: 'text' | 'outlined' | 'contained';
     color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
     confirmText?: string;
     cancelText?: string;
     dialogTitle?: string;
     dialogMessage?: string;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({
     onConfirm,
     label = 'Confirm',
     size = 'small',
     variant = 'outlined',
     color = 'primary',
     confirmText = 'Confirm',
     cancelText = 'Cancel',
     dialogTitle = 'Are you sure?',
     dialogMessage = 'This action cannot be undone.',
}) => {
     const [open, setOpen] = useState(false);

     const handleClick = () => setOpen(true);
     const handleClose = () => setOpen(false);
     const handleConfirm = () => {
          onConfirm();
          setOpen(false);
     };

     return (
          <>
               <Button variant={variant} color={color} size={size} onClick={handleClick}>
                    {label}
               </Button>
               <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogContent>
                         <DialogContentText>{dialogMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handleClose} color="primary">
                              {cancelText}
                         </Button>
                         <Button onClick={handleConfirm} color={color} variant="contained">
                              {confirmText}
                         </Button>
                    </DialogActions>
               </Dialog>
          </>
     );
};

export default ConfirmButton;
