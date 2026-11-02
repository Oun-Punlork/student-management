import { useState } from 'react';
import Header from '../components/ui/Header';
import AlertMessage from '../components/ui/AlertMessage';
import FormInput from '../components/ui/FormInput';
import { registerUser } from '../service/authService';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setErrorMessage('Enter a name with at least 2 characters.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        username: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      if (err.code === 'EMAIL_DELIVERY_FAILED') {
        navigate('/login', { state: { email: formData.email.trim() } });
        return;
      }
      setErrorMessage(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };
  // fixed
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 antialiased text-slate-800 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden relative">
        <Header />

        <div className="p-7 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-xs mt-0.5 font-normal">Register to access your portal</p>
          </div>

          <AlertMessage message={errorMessage} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              iconClass="fa-regular fa-user"
              value={formData.name}
              onChange={handleChange}
            />

            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="student@gmail.com"
              iconClass="fa-regular fa-envelope"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                iconClass="fa-solid fa-lock"
                value={formData.password}
                onChange={handleChange}
                toggleVisibility={() => setShowPassword(!showPassword)}
                isVisible={showPassword}
                isCompact
              />

              <FormInput
                id="confirmPassword"
                label="Confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                iconClass="fa-solid fa-shield-halved"
                value={formData.confirmPassword}
                onChange={handleChange}
                toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                isVisible={showConfirmPassword}
                isCompact
              />
            </div>

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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50/70 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login">
              <span className="text-indigo-600 font-semibold hover:underline">Login</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
