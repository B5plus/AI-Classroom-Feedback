import { useState } from 'react';
import axios from 'axios';
import './ContactForm.css';
import logo from '../Images/b5_logo.jpg';

// API URL from environment variable or fallback to proxy
const API_URL = import.meta.env.VITE_API_URL || '';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    department: '',
    category: '',
    message: ''
  });

  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert({ show: false, type: '', message: '' });

    console.log('Submitting form data:', formData);

    try {
      const response = await axios.post(`${API_URL}/api/contact`, formData);

      setAlert({
        show: true,
        type: 'success',
        message: response.data.message || 'Thank you! Your message has been sent successfully.'
      });

      // Reset form
      setFormData({
        name: '',
        lastName: '',
        email: '',
        department: '',
        category: '',
        message: ''
      });

      // Hide alert after 5 seconds
      setTimeout(() => {
        setAlert({ show: false, type: '', message: '' });
      }, 5000);

    } catch (error) {
      console.error('Form submission error:', error.response?.data);
      console.error('Form data that was sent:', formData);

      let errorMessage = 'Something went wrong. Please try again.';

      if (error.response?.data?.details) {
        // Show validation errors
        console.log('Validation errors:', error.response.data.details);
        const validationErrors = error.response.data.details.map(err => `${err.path || err.param}: ${err.msg}`).join('; ');
        errorMessage = `${validationErrors}`;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setAlert({
        show: true,
        type: 'error',
        message: errorMessage
      });

      // Hide alert after 5 seconds
      setTimeout(() => {
        setAlert({ show: false, type: '', message: '' });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <div className="contact-header">
          <div className="header-content">
            <img src={logo} alt="B5 Plus Group Logo" className="header-logo" />
            <h1 className="contact-title">Share Your Valuable Feedback</h1>
            <p className="contact-subtitle">Help us improve our AI Foundation Course with your feedback, suggestions, or report any problems you've encountered.</p>
          </div>
          <button className="close-button" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="contact-content">
          <form className="contact-form" onSubmit={handleSubmit}>
            {alert.show && (
              <div className={`alert alert-${alert.type}`}>
                <span>{alert.message}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="John"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Marketing, IT, Sales"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Type of Work <span className="required">*</span>
                <span className="label-hint">(Pick the areas you need help with)</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select a category</option>
                <option value="feedback">Feedback</option>
                <option value="suggestion">Suggestion</option>
                <option value="problem">Problem</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Tell us about your project <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Details, deadlines etc."
                rows="5"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            <div className="form-footer">
              <p className="footer-text">Not yet sure?</p>
              <div className="footer-contact">
                <div className="footer-item">
                  <span className="footer-label">Email</span>
                  <a href="mailto:feedback@b5plusgroup.com" className="footer-link">feedback@b5plusgroup.com</a>
                </div>
                <div className="footer-item">
                  <span className="footer-label">Phone</span>
                  <a href="tel:+233531029225" className="footer-link">+233 53 102 9225</a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
