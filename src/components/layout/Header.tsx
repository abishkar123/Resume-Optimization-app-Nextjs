'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { loginWithGoogle, logoutUser, firebaseAuth } from '@/lib/firebase-client';
import { useAuthModal } from '@/context/AuthModalContext';

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

export default function Header() {
  const router = useRouter();
  const { showSignupModal, openSignupModal, closeSignupModal } = useAuthModal();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUser(JSON.parse(stored));

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { user: firebaseUser, token } = await loginWithGoogle();
      const userInfo: UserInfo = {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        uid: firebaseUser.uid,
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('authToken', token);
      // Firebase ID tokens expire after 1 hour — match cookie expiry to that.
      document.cookie = `authToken=${token}; path=/; max-age=3600; SameSite=Lax`;
      setUser(userInfo);
      toast.success(`Welcome, ${firebaseUser.displayName || 'User'}!`);
      closeSignupModal();
      router.push('/dashboard');
    } catch {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      if (firebaseAuth) await logoutUser();
      localStorage.removeItem('userInfo');
      localStorage.removeItem('authToken');
      document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
      setUser(null);
      toast.info('You have been logged out.');
      router.push('/');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How It Works</a>
            </nav>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-3 mr-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border-2 border-blue-500" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-gray-700 font-medium text-sm">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm hover:shadow-lg transition-all">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Logout">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={openSignupModal} className="px-4 py-2 text-gray-700 font-semibold text-sm hover:text-blue-600 transition-colors hidden sm:block">
                    Log in
                  </button>
                  <button onClick={openSignupModal} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSignupModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 z-10">
            <button onClick={closeSignupModal} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to ResumeAI</h2>
              <p className="text-gray-500 mt-2">Sign in to optimize your resume with AI</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span className="text-gray-700">Continue with Google</span>
            </button>

            <p className="text-center text-xs text-gray-400 mt-5">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
