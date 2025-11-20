// src/controls/FormField.tsx
import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type Props = TextFieldProps & {
  name: string;
  helper?: React.ReactNode;
  inputRefFn?: (el: HTMLInputElement | null) => void;
  // custom visual prop — forwarded to MUI ownerState for theming
  highlightLeft?: boolean;
};

const FormField: React.FC<Props> = ({
  name,
  helper,
  inputRefFn,
  helperText,
  inputRef,
  highlightLeft,
  required,
  ...rest
}) => {
  const mergedHelper = helper != null ? helper : helperText;

  return (
    <TextField
      {...rest}
      name={name}
      // we forward required only if caller explicitly set it
      required={required}
      // forward custom prop so it becomes part of ownerState for theme
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: allow forwarding custom prop to MUI component ownerState
      highlightLeft={highlightLeft}
      inputProps={{ "aria-required": required, ...(rest.inputProps || {}) }}
      helperText={mergedHelper}
      inputRef={(el: HTMLInputElement | null) => {
        if (typeof inputRef === "function") {
          (inputRef as (instance: HTMLInputElement | null) => void)(el);
        } else if ((inputRef as React.MutableRefObject<HTMLInputElement | null>)?.current !== undefined) {
          try {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
          } catch {
            // ignore readonly refs
          }
        }

        if (inputRefFn) inputRefFn(el);
      }}
    />
  );
};

export default FormField;
