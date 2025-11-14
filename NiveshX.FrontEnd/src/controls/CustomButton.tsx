import React from "react";
import cn from "classnames";

type Color = "blue" | "green" | "red" | "gray";

interface CustomButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  color?: Color;
  fullWidth?: boolean;
}

const colorClasses: Record<Color, { base: string; loading: string }> = {
  blue: {
    base: "bg-blue-600 hover:bg-blue-700 text-white",
    loading: "bg-blue-300 cursor-not-allowed text-white",
  },
  green: {
    base: "bg-green-600 hover:bg-green-700 text-white",
    loading: "bg-green-300 cursor-not-allowed text-white",
  },
  red: {
    base: "bg-red-600 hover:bg-red-700 text-white",
    loading: "bg-red-300 cursor-not-allowed text-white",
  },
  gray: {
    base: "bg-gray-600 hover:bg-gray-700 text-white",
    loading: "bg-gray-300 cursor-not-allowed text-white",
  },
};

const CustomButton: React.FC<CustomButtonProps> = ({
  loading,
  label,
  loadingLabel = "Processing…",
  type = "submit",
  onClick,
  className = "",
  color = "blue",
  fullWidth = false,
}) => {
  const styles = colorClasses[color];

  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      className={cn(
        fullWidth ? "w-full" : "w-auto",
        "py-3 px-6 rounded transition duration-200 flex items-center justify-center",
        loading ? styles.loading : styles.base,
        className
      )}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
    >
      {loading ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <svg
            className="animate-spin h-5 w-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default React.memo(CustomButton);
