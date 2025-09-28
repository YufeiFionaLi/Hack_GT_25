import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    insurance: '',
    symptoms: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        newErrors.birthdate = 'Please enter a valid date of birth';
      }
    }

    if (!formData.insurance.trim()) {
      newErrors.insurance = 'Insurance provider is required';
    }

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = 'Please describe your symptoms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format the data for the backend
      const userData = {
        name: formData.name.trim(),
        dateOfBirth: formData.birthdate,
        insurance: formData.insurance.trim(),
        symptoms: formData.symptoms.trim()
      };
      
      onLogin(userData);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏥 Medical Sensor Login</h1>
          <p>Please provide your information to access the sensor system</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="birthdate" className="form-label">
              Date of Birth *
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className={`form-input ${errors.birthdate ? 'error' : ''}`}
              disabled={isSubmitting}
            />
            {errors.birthdate && <span className="error-message">{errors.birthdate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="insurance" className="form-label">
              Insurance Provider *
            </label>
            <select
              id="insurance"
              name="insurance"
              value={formData.insurance}
              onChange={handleChange}
              className={`form-input ${errors.insurance ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Select your insurance provider</option>
              <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
              <option value="Aetna">Aetna</option>
              <option value="Cigna">Cigna</option>
              <option value="UnitedHealthcare">UnitedHealthcare</option>
              <option value="Humana">Humana</option>
              <option value="Kaiser Permanente">Kaiser Permanente</option>
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Other">Other</option>
            </select>
            {errors.insurance && <span className="error-message">{errors.insurance}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="symptoms" className="form-label">
              Current Symptoms *
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              className={`form-input ${errors.symptoms ? 'error' : ''}`}
              placeholder="Please describe your current symptoms, concerns, or reason for the test..."
              rows="4"
              disabled={isSubmitting}
            />
            {errors.symptoms && <span className="error-message">{errors.symptoms}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button
            type="submit"
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Access Sensor System'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="privacy-note">
            🔒 Your information is secure and will only be used for medical purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
