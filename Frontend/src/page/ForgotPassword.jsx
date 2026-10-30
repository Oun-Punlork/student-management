import { useState } from 'react';
import Header from '../components/ui/Header';
import AlertMessage from '../components/ui/AlertMessage';
import FormInput from '../components/ui/FormInput';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage('If an account exists with this email, instructions to reset your password will be sent.');
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 antialiased text-slate-800 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden relative">
        <Header />

        <div className="p-7 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Forgot Password</h2>
            <p className="text-slate-400 text-xs mt-0.5 font-normal">
              Enter your email address to receive reset instructions
            </p>
          </div>

          <AlertMessage message={errorMessage} />

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-xl">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="student@gmail.com"
              iconClass="fa-regular fa-envelope"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending request...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50/70 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Remember your password?{' '}
            <Link to="/login">
              <span className="text-indigo-600 font-semibold hover:underline">Back to Login</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
