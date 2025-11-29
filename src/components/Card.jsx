import React from "react";

export default function Card({ children, className = "", padding = "p-4", shadow = "shadow-md", rounded = "rounded-xl", ...props }) {
  const classes = `${padding} ${rounded} ${shadow} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
