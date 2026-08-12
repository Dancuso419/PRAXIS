import { useState } from 'react';
import Icon from './Icon';

/* Password input with a show/hide toggle.
   Accepts all standard input props (value, onChange, placeholder, required, etc.). */
export default function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-field">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={className}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        tabIndex={-1}
      >
        <Icon name={show ? 'eyeOff' : 'eye'} size={17} />
      </button>
    </div>
  );
}
