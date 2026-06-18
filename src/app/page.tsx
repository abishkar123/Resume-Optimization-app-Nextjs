'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
    <button onClick={onClick} className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors">
      <span className="font-semibold text-gray-900">{question}</span>
      <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && <div className="px-6 pb-4 text-gray-600">{answer}</div>}
  </div>
);

const features = [
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, title: 'ATS Optimization', description: 'Beat Applicant Tracking Systems with our smart keyword analysis and formatting optimization.', color: 'from-blue-500 to-cyan-500' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, title: 'AI-Powered Analysis', description: 'Get instant, intelligent feedback on your resume content, structure, and impact statements.', color: 'from-purple-500 to-pink-500' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>, title: 'Job Matching', description: 'Tailor your resume to specific job descriptions for maximum relevance and impact.', color: 'from-emerald-500 to-teal-500' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>, title: 'Professional Templates', description: 'Choose from expertly designed templates optimized for your industry and experience level.', color: 'from-orange-500 to-red-500' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, title: 'Score & Insights', description: 'Get a comprehensive resume score with actionable insights to improve your chances.', color: 'from-indigo-500 to-purple-500' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, title: 'Privacy First', description: 'Your data is encrypted and secure. We never share your personal information with third parties.', color: 'from-gray-600 to-gray-800' },
];

const steps = [
  { number: '01', title: 'Upload Your Resume', description: 'Simply drag and drop your existing resume in PDF or DOCX format.' },
  { number: '02', title: 'AI Analysis', description: 'Our AI analyzes your resume against industry standards and ATS requirements.' },
  { number: '03', title: 'Get Recommendations', description: 'Receive detailed suggestions to improve content, formatting, and keywords.' },
  { number: '04', title: 'Download Optimized', description: 'Export your enhanced resume ready to land your dream job.' },
];

const faqs = [
  { question: 'How does ResumeAI optimize my resume?', answer: 'ResumeAI uses advanced machine learning algorithms to analyze your resume against industry standards, ATS requirements, and successful resume patterns. It evaluates content, formatting, keywords, and structure to provide actionable recommendations.' },
  { question: 'Is my data secure?', answer: 'Absolutely. We use bank-level encryption to protect your data. Your resume and personal information are never shared with third parties, and you can delete your data at any time.' },
  { question: 'What file formats are supported?', answer: 'We support PDF and DOCX file formats. For best results, we recommend uploading your resume as a PDF to preserve formatting.' },
  { question: 'Can I cancel my subscription anytime?', answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.' },
  { question: 'How is the ATS score calculated?', answer: 'Our ATS score is calculated based on 50+ factors including keyword optimization, formatting compatibility, section structure, file readability, and content relevance to your target job.' },
];

function AuthQueryParamHandler() {
  const { openSignupModal } = useAuthModal();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login' || authParam === 'signup') {
      openSignupModal();
      // Strip the query param so reloads / back-button don't keep reopening the modal.
      router.replace(pathname);
    }
  }, [searchParams, openSignupModal, router, pathname]);

  return null;
}

export default function Home() {
  const { openSignupModal } = useAuthModal();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!JSON.parse(localStorage.getItem('userInfo') || 'null')?.uid);
  }, []);

  return (
    <div className="overflow-hidden">
      <Suspense fallback={null}>
        <AuthQueryParamHandler />
      </Suspense>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Powered by Advanced AI
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Land Your Dream Job
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              With AI-Optimized Resumes
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Transform your resume in minutes. Our AI analyzes, optimizes, and tailors your resume to beat ATS systems and impress recruiters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {loggedIn ? (
              <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl transition-all hover:-translate-y-1">
                Go to Dashboard →
              </Link>
            ) : (
              <button onClick={openSignupModal} className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl transition-all hover:-translate-y-1">
                Optimize Your Resume Free →
              </button>
            )}
            <button className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all">
              Watch Demo ▶
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Everything You Need to Stand Out</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Powerful AI-driven tools to transform your resume and maximize your job search success.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Optimize Your Resume in 4 Simple Steps</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get your professionally optimized resume ready in just minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{s.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} isOpen={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Resume?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Start optimizing your resume today and land your dream job.</p>
          <button onClick={openSignupModal} className="px-10 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            Get Started Free — No Credit Card Required
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="font-bold text-xl text-white">ResumeAI</span>
              </div>
              <p className="text-gray-500 text-sm">AI-powered resume optimization to help you land your dream job.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2025 ResumeAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
