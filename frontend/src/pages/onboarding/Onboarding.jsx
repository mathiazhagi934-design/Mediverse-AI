import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { ArrowRight, ArrowLeft, Check, X, Heart, User, Activity, Heart as HeartIcon, Settings } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { useReducedMotion } from '../../utils/animations';

const steps = [
  { id: 'welcome', title: 'Welcome to MediVerse AI', icon: Heart, description: 'Your personal AI health companion for educational insights and health tracking.' },
  { id: 'profile', title: 'Basic Profile', icon: User, description: 'Tell us a bit about yourself for personalized insights.' },
  { id: 'health', title: 'Health Information', icon: Activity, description: 'Share your health metrics for better analysis.' },
  { id: 'lifestyle', title: 'Lifestyle & Preferences', icon: HeartIcon, description: 'Help us understand your lifestyle for tailored recommendations.' },
  { id: 'complete', title: 'All Set!', icon: Check, description: 'Your profile is ready. Start exploring MediVerse AI.' },
];

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
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
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center relative"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 z-10',
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : step.icon && <step.icon className="w-5 h-5" />}
                </div>
                {!isLastStep && index < steps.length - 1 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: index < currentStep ? '100%' : 0 }}
                    className="absolute top-5 left-[50%] w-full h-1.5 bg-gray-200 dark:bg-gray-700 -ml-px"
                    style={{ width: 'calc(100% + 2px)' }}
                  />
                )}
                <span className={cn('text-xs mt-1.5 text-center w-24', index === currentStep ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>

          <Progress value={progress} height={4} showLabel variant="primary" />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
                  currentStep === 0 ? 'bg-primary-100 dark:bg-primary-900/30' :
                  currentStep === 1 ? 'bg-blue-100 dark:bg-blue-900/30' :
                  currentStep === 2 ? 'bg-green-100 dark:bg-green-900/30' :
                  currentStep === 3 ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-green-100 dark:bg-green-900/30'
                )}>
                  <currentStepData.icon className={cn('w-8 h-8',
                    currentStep === 0 ? 'text-primary-600' :
                    currentStep === 1 ? 'text-blue-600' :
                    currentStep === 2 ? 'text-green-600' :
                    currentStep === 3 ? 'text-purple-600' :
                    'text-green-600'
                  )} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStepData.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{currentStepData.description}</p>
              </div>

              {currentStep === 0 && (
                <div className="space-y-6">
                  <Card variant="gradient" className="text-center">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">What you can do with MediVerse AI</h3>
                      <div className="grid sm:grid-cols-2 gap-3 text-left">
                        {[
                          '🔍 AI Disease Prediction from symptoms',
                          '📄 Medical Report Analysis & Extraction',
                          '🖼️ Skin Condition Detection from images',
                          '📊 Health Score & Personalized Insights',
                          '📈 Health Analytics & Trends',
                          '💬 AI Health Assistant Chat',
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 text-sm text-primary-800 dark:text-primary-200"
                          >
                            <span className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                            {item}
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
                    <select className={cn('input-field', stepErrors.gender && 'border-red-500')} value={formData.gender} onChange={updateField('gender')}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
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
                    <select className="input-field" value={formData.blood_group} onChange={updateField('blood_group')}>
                      <option value="">Blood Group (Optional)</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    <Input label="Emergency Contact" value={formData.emergency_contact} onChange={updateField('emergency_contact')} placeholder="Name - Phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Known Allergies</label>
                    <textarea className="input-field" rows={2} value={formData.allergies} onChange={updateField('allergies')} placeholder="List any known allergies..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Existing Conditions</label>
                    <textarea className="input-field" rows={2} value={formData.existing_conditions} onChange={updateField('existing_conditions')} placeholder="List any existing medical conditions..." />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                        className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable health notifications and reminders</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['light', 'dark', 'system'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData(prev => ({ ...prev, theme_preference: t }))}
                          className={cn(
                            'p-3 rounded-xl border-2 text-center text-sm transition-all',
                            formData.theme_preference === t
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          {t === 'light' && '☀️ Light'}
                          {t === 'dark' && '🌙 Dark'}
                          {t === 'system' && '💻 System'}
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
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">You're all set!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Your profile has been configured. Start exploring your health insights.</p>
                  </div>
                  <Card variant="outlined">
                    <div className="space-y-3">
                      {[
                        { icon: Activity, label: 'Disease Prediction', desc: 'Analyze symptoms with AI' },
                        { icon: FileText, label: 'Medical Reports', desc: 'Upload and analyze PDF reports' },
                        { icon: HeartIcon, label: 'Health Score', desc: 'Track your wellness score' },
                        { icon: MessageCircle, label: 'AI Assistant', desc: 'Chat for health insights' },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {!isFirstStep && (
                <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
              )}
              <div className="flex items-center gap-3">
                {!isLastStep && !isFirstStep && (
                  <Button variant="ghost" onClick={handleSkip} className="text-sm">
                    Skip
                  </Button>
                )}
                {isLastStep ? (
                  <Button onClick={handleFinish} loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started
                  </Button>
                ) : (
                  <Button onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}