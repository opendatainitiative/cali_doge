'use client';

import { useState } from 'react';

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          message: `
Name: ${formData.name}
Organization: ${formData.organization}
Role: ${formData.role}
Message: ${formData.message}
          `.trim()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ details: 'Network error' }));
        throw new Error(errorData.details || `Server error: ${response.status}`);
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        organization: '',
        role: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      
      // Handle different error types
      if (error instanceof DOMException && error.name === 'AbortError') {
        setErrorMessage('Request timed out. Please try again later.');
      } else if (error instanceof Error) {
        setErrorMessage(error.message || 'An error occurred while submitting the form.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display-l mb-8">Join Our Mission</h1>
        
        <p className="text-body-l text-odi-gray-600 mb-8">
          Help us build a more efficient California government. Join our team of dedicated professionals 
          working to streamline processes and improve public services.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-body-m font-medium text-odi-black mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-odi-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-odi-blue"
              disabled={status === 'submitting'}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-body-m font-medium text-odi-black mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-odi-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-odi-blue"
              disabled={status === 'submitting'}
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-body-m font-medium text-odi-black mb-2">
              We need help with strategy, research, engineering, and marketing. What can you help with?
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              required
              value={formData.organization}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-odi-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-odi-blue"
              disabled={status === 'submitting'}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-body-m font-medium text-odi-black mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-odi-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-odi-blue"
              disabled={status === 'submitting'}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Sending...' : 'Submit'}
            </button>
          </div>

          {status === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Thank you for your interest! We&apos;ll be in touch soon.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                {errorMessage || 'An error occurred. Please try again later.'}
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-2 text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
} 