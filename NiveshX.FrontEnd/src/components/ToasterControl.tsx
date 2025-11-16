// src/components/ToasterControl.tsx
import React from "react";
import { Toaster } from "react-hot-toast";

export type ToasterControlProps = {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  maxWidth?: string | number;
  duration?: number;
  reverseOrder?: boolean;
};

const ToasterControl: React.FC<ToasterControlProps> = ({
  position = "bottom-right",
  maxWidth = "480px",
  duration = 6000,
  reverseOrder = false,
}) => {
  return (
    <Toaster
      position={position}
      reverseOrder={reverseOrder}
      toastOptions={{
        duration,
        style: {
          padding: "12px 16px",
          borderRadius: 8,
          maxWidth,
          whiteSpace: "pre-line",
        },
        success: {
          duration: 4000,
          style: { background: "#ECFDF5", color: "#065F46" },
        },
        error: {
          style: { background: "#FEF2F2", color: "#7F1D1D" },
        },
      }}
    />
  );
};

export default ToasterControl;
