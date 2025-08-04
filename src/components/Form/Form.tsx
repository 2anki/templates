import React from "react";
import styles from "./Form.module.css";

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return (
    <div className={`${styles.formGroup} ${className || ""}`}>{children}</div>
  );
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label className={`${styles.label} ${className || ""}`} {...props}>
      {children}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={`${styles.input} ${className || ""}`} {...props} />;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={`${styles.input} ${styles.textarea} ${className || ""}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className, ...props }: SelectProps) {
  return (
    <select
      className={`${styles.input} ${styles.select} ${className || ""}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface HelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HelpText({ children, className }: HelpTextProps) {
  return <p className={`${styles.helpText} ${className || ""}`}>{children}</p>;
}
