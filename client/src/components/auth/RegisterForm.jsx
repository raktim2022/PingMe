import React from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../common/FormInput';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = ({ formData, loading, error, handleChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <FormInput
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <FormInput
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <FormInput
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <FormInput
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />

      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span>
            Creating Account...
          </>
        ) : (
          'Register'
        )}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm">
          Already have an account?{' '}
          <Link to="/login" className="link link-primary">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;