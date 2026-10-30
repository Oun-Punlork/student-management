import { useState } from 'react';
import Header from '../components/ui/Header';
import AlertMessage from '../components/ui/AlertMessage';
import FormInput from '../components/ui/FormInput';
import { loginUser } from '../service/authService';
import { Link, useLocation } from 'react-router-dom';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(
    () => localStorage.getItem('sv30_remembered_email') || location.state?.email || '',
  );
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('sv30_remembered_email')));
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorCode('');

    if (rememberMe) {
      localStorage.setItem('sv30_remembered_email', email);
    } else {
      localStorage.removeItem('sv30_remembered_email');
    }

    setIsLoading(true);

    try {
      const result = await loginUser({ email, password, rememberMe });
      const token = result?.token || result?.data?.token;

      if (!token) {
        throw new Error('Login response did not include a token');
      }

      localStorage.setItem('token', token);
      window.location.assign(result.redirect || '/dashboard');
    } catch (err) {
      console.error('Error logging in:', err);
      setErrorMessage(err.message || 'An error occurred during sign in.');
      setErrorCode(err.code || '');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-100 via-slate-50 to-indigo-50/40 antialiased text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Decorative background glow */}
      <div className="absolute w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -top-12 -left-12 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-sky-200/20 rounded-full blur-3xl -bottom-12 -right-12 pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden relative z-10 transition-all duration-300">
        <Header />

        {/* Form Section */}
        <div className="p-8 sm:p-10">
          <div className="mb-7 text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">Please enter your details to sign in</p>
          </div>

          <AlertMessage message={errorMessage} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <FormInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="student@gmail.com"
                iconClass="fa-regular fa-envelope"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <FormInput
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                iconClass="fa-solid fa-lock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                toggleVisibility={() => setShowPassword(!showPassword)}
                isVisible={showPassword}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0 accent-slate-900 cursor-pointer transition"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium text-xs py-3.5 px-4 rounded-xl shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="fa-solid fa-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5"></i>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 backdrop-blur-md px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}