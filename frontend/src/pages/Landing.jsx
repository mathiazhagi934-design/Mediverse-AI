import { Link } from 'react-router-dom';
import { Heart, Activity, FileText, Scan, Shield, ArrowRight } from 'lucide-react';

const features = [
  { icon: Activity, title: 'Disease Prediction', desc: 'Enter symptoms and get AI-powered disease predictions with confidence scores.' },
  { icon: FileText, title: 'Medical Report Analysis', desc: 'Upload PDF medical reports and get structured extraction and interpretation.' },
  { icon: Scan, title: 'Skin Disease Detection', desc: 'Upload skin images for AI-powered lesion classification and analysis.' },
  { icon: Shield, title: 'Health Dashboard', desc: 'Track your health metrics, predictions, and get personalized recommendations.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">MediVerse AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 py-20 lg:py-32 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-block bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            AI-Powered Healthcare Platform
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your Personal <span className="text-primary-600">AI Health</span> Assistant
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            MediVerse AI provides intelligent symptom analysis, medical report processing, 
            and health tracking — all powered by machine learning. Monitor your health with 
            AI-generated insights designed for educational purposes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Powerful Health Features</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to monitor, analyze, and understand your health data.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 lg:px-12 py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-2">Medical Disclaimer</h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            MediVerse AI provides AI-generated health information for educational purposes only and 
            is not a substitute for professional medical advice, diagnosis, or treatment. Always seek 
            the advice of a qualified healthcare provider with any questions regarding a medical condition.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-600" />
            <span className="font-semibold">MediVerse AI</span>
          </div>
          <p className="text-sm text-gray-500">Built for educational purposes. Not a medical device.</p>
        </div>
      </footer>
    </div>
  );
}
