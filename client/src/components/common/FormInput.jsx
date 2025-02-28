import React from 'react';

const FormInput = ({ label, type = 'text', name, value, onChange, required }) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="input input-bordered w-full focus:input-primary"
        required={required}
      />
    </div>
  );
};

export default FormInput;