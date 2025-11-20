import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type Props = TextFieldProps & {
  name: string;
  helper?: React.ReactNode;
  inputRefFn?: (el: HTMLInputElement | null) => void;
};

const FormField: React.FC<Props> = ({
  name,
  helper,
  inputRefFn,
  helperText,
  inputRef,
  required,
  ...rest
}) => {
  const mergedHelper = helper != null ? helper : helperText;

  return (
    <TextField
      {...rest}
      name={name}
      required={required}
      inputProps={{ "aria-required": required, ...(rest.inputProps || {}) }}
      helperText={mergedHelper}
      inputRef={(el: HTMLInputElement | null) => {
        if (typeof inputRef === "function") {
          (inputRef as (instance: HTMLInputElement | null) => void)(el);
        }
        if (inputRefFn) inputRefFn(el);
      }}
    />
  );
};

export default FormField;
