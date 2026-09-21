import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, FileText, Scan, Shield, ArrowRight, HeartPulse, Stethoscope, BarChart3, Sparkles, MessageCircle, CheckCircle } from 'lucide-react';

const features = [
  { icon: Activity, title: 'Disease Prediction', desc: 'Enter symptoms and get AI-powered disease predictions with confidence scores.', tone: 'from-sky-500/15 to-sky-500/5 border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400' },
  { icon: FileText, title: 'Medical Report Analysis', desc: 'Upload PDF medical reports and get structured extraction and interpretation.', tone: 'from-teal-500/15 to-teal-500/5 border-teal-200 dark:border-teal-500/20 text-teal-600 dark:text-teal-400' },
  { icon: Scan, title: 'Skin Disease Detection', desc: 'Upload skin images for AI-powered lesion classification and analysis.', tone: 'from-primary-500/15 to-primary-500/5 border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400' },
  { icon: Shield, title: 'Health Dashboard', desc: 'Track your health metrics, predictions, and get personalized recommendations.', tone: 'from-indigo-500/15 to-indigo-500/5 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
];

const stats = [
  { icon: Stethoscope, label: 'Symptom Analysis', value: '6+', desc: 'Clinical categories' },
  { icon: BarChart3, label: 'Health Insights', value: '24/7', desc: 'Always available' },
  { icon: Shield, label: 'Data Protection', value: '100%', desc: 'Secure & encrypted' },
];

const quickFeatures = [
  { icon: HeartPulse, title: 'Wellness Score', desc: 'A single educational indicator of your recent health activity.' },
  { icon: MessageCircle, title: 'AI Assistant', desc: 'Chat with an educational health companion about your data.' },
  { icon: Sparkles, title: 'Smart Recommendations', desc: 'Contextual wellness guidance derived from your records.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-slateink-950">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slateink-950/85 border-b border-slate-200 dark:border-slateink-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-soft flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[15px] text-slateink-900 dark:text-white leading-none">MediVerse <span className="text-primary-600 dark:text-primary-400">AI</span></span>
              <span className="block text-[10px] uppercase tracking-[0.14em] text-slate-400 mt-0.5">Hospital Health Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slateink-900 dark:hover:text-white font-medium text-sm px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-soft">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slateink-950 via-slateink-950 to-primary-900/50">
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-primary-600/25 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 w-[460px] h-[460px] rounded-full bg-teal-500/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-300 text-sm font-medium px-3.5 py-1.5 rounded-full border border-primary-500/20 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Healthcare Platform
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-[3.4rem] font-bold text-white leading-[1.15] mb-6"
              >
                Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">AI Health</span> Assistant
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed"
              >
                MediVerse AI provides intelligent symptom analysis, medical report processing, and health tracking — all powered by machine learning. Designed for educational purposes.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white text-base font-medium px-8 py-3.5 rounded-xl inline-flex items-center gap-2 transition-all shadow-glow">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur text-white text-base font-medium px-8 py-3.5 rounded-xl border border-white/15 transition-colors">
                  Sign In
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="grid grid-cols-3 gap-4 mt-12 max-w-lg"
              >
                {stats.map(({ icon: Icon, label, value, desc }) => (
                  <div key={label} className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Icon className="w-4 h-4 text-primary-400" />
                      <span className="text-xl font-bold tabular-nums">{value}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 mt-1.5">{label}</p>
                    <p className="text-[11px] text-slate-400">{desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Product preview mock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              <div className="rounded-2xl bg-white dark:bg-slateink-900 shadow-lift border border-slate-200 dark:border-slateink-950 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slateink-950 bg-slate-50 dark:bg-slateink-950/60">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs font-medium text-slate-400">app.mediverse.ai</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">Patient Overview</p>
                      <div className="w-40 h-5 rounded bg-slate-100 dark:bg-slateink-950 mt-1" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/15 border border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400 text-[11px] font-medium">
                      <span className="status-dot bg-green-500" /> Systems online
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slateink-950 bg-gradient-to-br from-primary-50/70 to-white dark:from-primary-900/10 dark:to-slateink-900 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="w-20 h-4 rounded bg-primary-200/60 dark:bg-primary-500/20 mt-2" />
                        <div className="w-28 h-2.5 rounded bg-slate-100 dark:bg-slateink-950 mt-2" />
                      </div>
                      <div className="w-16 h-16 rounded-full border-[6px] border-teal-400/70 dark:border-teal-500/70 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold">72</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {['Prediction Activity', 'Health Analytics', 'Report Analysis', 'Skin Screening'].map((f) => (
                        <div key={f} className="flex items-center gap-2 rounded-lg bg-white dark:bg-slateink-900 border border-slate-100 dark:border-slateink-950 px-3 py-2">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-xl bg-gradient-to-br from-teal-500 to-primary-600 text-white shadow-glow px-5 py-3.5 flex items-center gap-3 hidden sm:flex">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold leading-none">Privacy-first design</p>
                  <p className="text-[11px] text-white/80 mt-1">Your data stays secure</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-10 py-20 bg-slate-50 dark:bg-slateink-900/40 border-t border-slate-100 dark:border-slateink-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-eyebrow text-center">Platform Capabilities</p>
            <h2 className="text-3xl font-bold text-slateink-900 dark:text-white mb-3">Powerful Health Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to monitor, analyze, and understand your health data.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, tone }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group card hover:shadow-card transition-all hover:-translate-y-1 !p-6"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tone} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slateink-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick features */}
          <div className="grid md:grid-cols-3 gap-5 mt-5">
            {quickFeatures.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                className="flex items-start gap-4 rounded-xl bg-white dark:bg-slateink-900 border border-slate-200 dark:border-slateink-950 shadow-soft p-5"
              >
                <span className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-slateink-900 dark:text-white">{title}</p>
                  <p className="text-sm text-slate-500 mt-1">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slateink-900 dark:text-white mb-4">Start your health journey today</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">
            Create your free account and explore AI-powered health insights designed for education and awareness.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-8 py-3.5 rounded-xl inline-flex items-center gap-2 transition-all shadow-glow">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 lg:px-10 pb-12">
        <div className="max-w-4xl mx-auto rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 flex items-start gap-4">
          <Shield className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1.5">Medical Disclaimer</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              MediVerse AI provides AI-generated health information for educational purposes only and is not a substitute
              for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare
              provider with any questions regarding a medical condition.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-10 py-8 border-t border-slate-200 dark:border-slateink-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slateink-900 dark:text-white">MediVerse AI</span>
          </div>
          <p className="text-sm text-slate-500">Built for educational purposes. Not a medical device.</p>
        </div>
      </footer>
    </div>
  );
}