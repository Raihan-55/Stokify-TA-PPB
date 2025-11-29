import React from "react";

export default function Label({ children, className = "", ...props }) {
  const classes = `block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`;

  return (
    <label className={classes} {...props}>
      {children}
    </label>
  );
}
