import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/ui/Header';
import { verifyEmail } from '../service/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState(
    token ? 'Verifying your email address...' : 'This verification link is invalid or has expired.',
  );
  const [isError, setIsError] = useState(!token);

  useEffect(() => {
    let isMounted = true;

    if (!token) return () => {
      isMounted = false;
    };

    verifyEmail(token)
      .then((result) => {
        if (isMounted) setMessage(result.message);
      })
      .catch((error) => {
        if (isMounted) {
          setMessage(error.message || 'Unable to verify your email address.');
          setIsError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-100 via-slate-50 to-indigo-50/40 text-slate-800">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
        <Header />
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Email verification</h1>
          <p className={`mt-3 text-sm ${isError ? 'text-red-600' : 'text-slate-600'}`} role="status">
            {message}
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Continue to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
