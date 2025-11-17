import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type Props = TextFieldProps & {
  name: string;
  helper?: React.ReactNode;
  inputRefFn?: (el: HTMLInputElement | null) => void;
};

const FormField: React.FC<Props> = ({ name, helper, inputRefFn, inputRef, ...rest }) => {
  return (
    <TextField
      {...rest}
      name={name}
      helperText={helper}
      inputRef={(el: any) => {
        if (typeof inputRef === "function") (inputRef as any)(el);
        if (inputRefFn) inputRefFn(el);
      }}
    />
  );
};

export default FormField;
