import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { ArrowRight, ArrowLeft, Check, X, Heart, User, Activity, Heart as HeartIcon, Sun, Moon, Monitor, Stethoscope, FileText, BarChart3, MessageCircle, Image as ImageIcon, ShieldCheck, HeartPulse } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { Alert } from '../../components/ui/Alert';
import { useReducedMotion } from '../../utils/animations';

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Heart, description: 'Your personal AI health companion for educational insights and health tracking.' },
  { id: 'profile', title: 'Basic Profile', icon: User, description: 'Tell us a bit about yourself for personalized insights.' },
  { id: 'health', title: 'Health Information', icon: Activity, description: 'Share your health metrics for better analysis.' },
  { id: 'lifestyle', title: 'Preferences', icon: HeartIcon, description: 'Help us understand your preferences for tailored recommendations.' },
  { id: 'complete', title: 'All Set!', icon: Check, description: 'Your profile is ready. Start exploring MediVerse AI.' },
];

const features = [
  { icon: Stethoscope, label: 'AI Disease Prediction', desc: 'Estimate conditions from symptoms' },
  { icon: FileText, label: 'Report Analysis', desc: 'Extract lab values from PDFs' },
  { icon: ImageIcon, label: 'Skin Detection', desc: 'Screening from images' },
  { icon: HeartIcon, label: 'Health Score', desc: 'Personalized wellness insights' },
  { icon: BarChart3, label: 'Health Analytics', desc: 'Trends and insights over time' },
  { icon: MessageCircle, label: 'AI Assistant', desc: 'Educational health chat' },
];

const getStepColor = (isDark, step) => {
  const colors = [
    { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400' },
    { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  ];
  return colors[step] || colors[0];
};

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    phone: '',
    height: '',
    weight: '',
    blood_group: '',
    allergies: '',
    existing_conditions: '',
    emergency_contact: '',
    notifications_enabled: true,
    theme_preference: 'system',
  });
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const reducedMotion = useReducedMotion();

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    api.get('/accounts/profile/')
      .then(res => {
        const data = res.data;
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || '',
          phone: data.phone || '',
          height: data.height || '',
          weight: data.weight || '',
          blood_group: data.blood_group || '',
          allergies: data.allergies || '',
          existing_conditions: data.existing_conditions || '',
          emergency_contact: data.emergency_contact || '',
        }));
      })
      .catch(() => {});
  }, []);

  const validateStep = () => {
    const errors = {};
    switch (currentStep) {
      case 1:
        if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
        if (!formData.age || formData.age < 1 || formData.age > 120) errors.age = 'Valid age is required';
        if (!formData.gender) errors.gender = 'Please select gender';
        break;
      case 2:
        if (formData.height && (formData.height < 50 || formData.height > 250)) errors.height = 'Height must be between 50-250 cm';
        if (formData.weight && (formData.weight < 20 || formData.weight > 300)) errors.weight = 'Weight must be between 20-300 kg';
        break;
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (isLastStep) {
      await handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 2) {
      setCurrentStep(steps.length - 2);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.age) payload.age = parseInt(payload.age) || null;
      if (payload.height) payload.height = parseFloat(payload.height) || null;
      if (payload.weight) payload.weight = parseFloat(payload.weight) || null;
      if (!payload.age) payload.age = null;
      if (!payload.height) payload.height = null;
      if (!payload.weight) payload.weight = null;

      await api.patch('/accounts/profile/', payload);

      const userRes = await api.get('/accounts/user/');
      setUser(userRes.data);

      navigate('/app');
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (stepErrors[field]) {
      setStepErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const stepColor = getStepColor(true, currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slateink-950 via-slateink-950 to-primary-900/40 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient grid */}
      <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-primary-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-teal-500/10 blur-3xl" />

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5"
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-soft">
          <HeartPulse className="w-4 h-4 text-white" />
        </span>
        <span className="font-bold text-white text-sm tracking-wide">
          MediVerse <span className="text-primary-400">AI</span>
          <span className="block text-[10px] font-medium text-slate-400 tracking-[0.14em] uppercase">Hospital Health Portal</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative"
      >
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col items-center relative flex-1"
              >
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 z-10',
                  index < currentStep
                    ? 'bg-teal-500 text-white'
                    : index === currentStep
                      ? 'bg-primary-500 text-white ring-4 ring-primary-500/25'
                      : 'bg-slate-800 text-slate-500'
                )}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: index < currentStep ? '100%' : 0 }}
                    className={cn('absolute top-[34px] h-0.5 left-[50%] w-full', index < currentStep ? 'bg-teal-500' : 'bg-slate-800')}
                    transition={{ duration: 0.4 }}
                  />
                )}
                <span className={cn(
                  'text-[10px] sm:text-xs mt-2 text-center px-1',
                  index === currentStep ? 'font-medium text-white' : 'text-slate-500'
                )}>
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="bg-white dark:bg-slateink-900 rounded-2xl shadow-lift border border-slate-200 dark:border-slateink-950 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="text-center mb-7">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4', stepColor.bg, stepColor.text)}>
                  <currentStepData.icon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slateink-900 dark:text-white">{currentStepData.title}</h2>
                <p className="text-slate-500 mt-1.5 text-[15px]">{currentStepData.description}</p>
              </div>

              {currentStep === 0 && (
                <div className="space-y-5">
                  <Card variant="gradient" className="text-center">
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-primary-900 dark:text-primary-100 flex items-center justify-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> What you can do with MediVerse AI
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2.5 text-left">
                        {features.map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-center gap-2.5 text-sm text-primary-800 dark:text-primary-200 bg-white/60 dark:bg-slateink-900/40 rounded-lg p-2.5 border border-primary-100 dark:border-primary-900"
                          >
                            <span className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center shrink-0">
                              <item.icon className="w-3.5 h-3.5" />
                            </span>
                            {item.label}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Alert variant="info" title="Medical Disclaimer" className="text-sm">
                    MediVerse AI provides AI-generated health information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                  </Alert>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Full Name" value={formData.full_name} onChange={updateField('full_name')} error={stepErrors.full_name} placeholder="John Doe" autoFocus />
                    <Input label="Age" type="number" value={formData.age} onChange={updateField('age')} error={stepErrors.age} placeholder="30" min="1" max="120" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                      <select className={cn('input-field', stepErrors.gender && '!border-red-500')} value={formData.gender} onChange={updateField('gender')}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                      {stepErrors.gender && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                          <X className="w-3.5 h-3.5" /> {stepErrors.gender}
                        </p>
                      )}
                    </div>
                    <Input label="Phone" type="tel" value={formData.phone} onChange={updateField('phone')} placeholder="+1 234 567 890" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Height (cm)" type="number" step="0.1" value={formData.height} onChange={updateField('height')} error={stepErrors.height} placeholder="170" />
                    <Input label="Weight (kg)" type="number" step="0.1" value={formData.weight} onChange={updateField('weight')} error={stepErrors.weight} placeholder="70" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Blood Group (Optional)</label>
                      <select className="input-field" value={formData.blood_group} onChange={updateField('blood_group')}>
                        <option value="">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <Input label="Emergency Contact" value={formData.emergency_contact} onChange={updateField('emergency_contact')} placeholder="Name - Phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Known Allergies</label>
                    <textarea className="input-field" rows={2} value={formData.allergies} onChange={updateField('allergies')} placeholder="List any known allergies..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Existing Conditions</label>
                    <textarea className="input-field" rows={2} value={formData.existing_conditions} onChange={updateField('existing_conditions')} placeholder="List any existing medical conditions..." />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 dark:border-slateink-950 bg-slate-50/60 dark:bg-slateink-900/60 p-4">
                      <input
                        type="checkbox"
                        checked={formData.notifications_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                        className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Enable health notifications and reminders</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">Preferred Theme</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' },
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setFormData(prev => ({ ...prev, theme_preference: t.value }))}
                          className={cn(
                            'p-4 rounded-xl border-2 text-center text-sm transition-all flex flex-col items-center gap-2',
                            formData.theme_preference === t.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                              : 'border-slate-200 dark:border-slateink-950 hover:border-slate-300 dark:hover:border-slate-800 text-slate-500'
                          )}
                        >
                          <t.icon className="w-5 h-5" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="w-20 h-20 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-glow"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-slateink-900 dark:text-white">You're all set!</h3>
                    <p className="text-slate-500 mt-2">Your profile has been configured. Start exploring your health insights.</p>
                  </div>
                  <Card variant="outlined" className="!border-slate-200 dark:!border-slateink-950">
                    <div className="space-y-2.5">
                      {[
                        { icon: Stethoscope, label: 'Disease Prediction', desc: 'Analyze symptoms with AI' },
                        { icon: FileText, label: 'Medical Reports', desc: 'Upload and analyze PDF reports' },
                        { icon: HeartIcon, label: 'Health Score', desc: 'Track your wellness score' },
                        { icon: MessageCircle, label: 'AI Assistant', desc: 'Chat for health insights' },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slateink-950 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slateink-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slateink-950 bg-slate-50/60 dark:bg-slateink-950/40 flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center justify-between gap-3">
                {!isFirstStep && (
                  <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back
                  </Button>
                )}
                <Progress value={progress} className="flex-1 max-w-xs hidden sm:block" height={6} variant="default" animated={!reducedMotion} />
                <div className="flex items-center gap-3">
                  {!isLastStep && !isFirstStep && (
                    <Button variant="ghost" onClick={handleSkip} className="text-sm text-slate-500">
                      Skip
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button onClick={handleFinish} loading={loading} rightIcon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}>
                      Get Started
                    </Button>
                  ) : (
                    <Button onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}