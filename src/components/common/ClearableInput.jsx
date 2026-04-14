import React, { forwardRef } from "react";
import { X } from "lucide-react";

/**
 * ClearableInput Component
 * Enhances a standard HTML input with a clear (cancel) button.
 * Uses forwardRef to allow parent components to access the input element.
 */
const ClearableInput = forwardRef(({
  value,
  onChange,
  onClear,
  id,
  type = "text",
  placeholder,
  className = "",
  required = false,
  autoComplete = "off",
  ...props
}, ref) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "", name: props.name } });
    }
    
    if (ref && ref.current) {
      ref.current.focus();
    } else if (id) {
       document.getElementById(id)?.focus();
    }
  };

  // 1) Extract layout/width classes for the container
  // This matches Tailwind width classes (w-*, sm:w-*, md:w-*, etc.)
  const widthClasses = className.match(/\b(?:[a-z]+:)?w-\S+\b/g) || [];
  const flexClasses = className.match(/\b(?:[a-z]+:)?flex-\S+\b/g) || [];
  const marginClasses = className.match(/\b(?:[a-z]+:)?m[lrtbxy]?-\S+\b/g) || [];
  
  const containerClasses = [...widthClasses, ...flexClasses, ...marginClasses].join(" ");
  
  // 2) Remove those classes from the input to avoid duplication
  const inputFinalClasses = className
    .split(" ")
    .filter(cls => !containerClasses.includes(cls))
    .join(" ");

  return (
    <div className={`relative ${containerClasses || 'w-full'} group`}>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`${inputFinalClasses} w-full pr-10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300`}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-slate-100 flex items-center justify-center"
          title="Clear field"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});

ClearableInput.displayName = "ClearableInput";

export default ClearableInput;
