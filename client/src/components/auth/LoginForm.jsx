import React from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../common/FormInput';

const LoginForm = ({ formData, loading, error, handleChange, handleSubmit }) => {
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

      <div className="flex items-center justify-between">
        <label className="label cursor-pointer">
          <input type="checkbox" className="checkbox checkbox-primary mr-2" />
          <span className="label-text">Remember me</span>
        </label>
        <Link to="/forgot-password" className="text-sm link link-primary">
          Forgot Password?
        </Link>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="link link-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;