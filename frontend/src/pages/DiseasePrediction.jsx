import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Search, X, Activity, AlertTriangle, Loader2, Clock, Info, Stethoscope, Check, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReducedMotion } from '../utils/animations';
import { cn } from '../utils/cn';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { ConfidenceBadge } from '../components/ui/Badge';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

const analysisSteps = [
  { id: 'analyzing', label: 'Analyzing symptoms...' },
  { id: 'matching', label: 'Matching clinical patterns...' },
  { id: 'running', label: 'Running ML model...' },
  { id: 'generating', label: 'Generating result...' },
];

export default function DiseasePrediction() {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [symptomsLoading, setSymptomsLoading] = useState(true);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    api.get('/disease/symptoms/')
      .then(res => setAllSymptoms(res.data.symptoms || []))
      .catch(() => toast.error('Failed to load symptoms'))
      .finally(() => setSymptomsLoading(false));
  }, []);

  const filtered = allSymptoms
    .filter(s => !selected.includes(s))
    .filter(s => s.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase()));

  const addSymptom = useCallback((symptom) => {
    if (!selected.includes(symptom)) {
      setSelected([...selected, symptom]);
      setSearch('');
    }
  }, [selected]);

  const removeSymptom = useCallback((symptom) => {
    setSelected(selected.filter(s => s !== symptom));
  }, [selected]);

  const runAnalysisAnimation = () => {
    if (reducedMotion) {
      setAnalysisPhase(analysisSteps.length - 1);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let phase = 0;
      setAnalysisPhase(0);
      const interval = setInterval(() => {
        phase++;
        setAnalysisPhase(phase);
        if (phase >= analysisSteps.length - 1) {
          clearInterval(interval);
          setTimeout(resolve, 300);
        }
      }, 700);
    });
  };

  const handlePredict = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }
    setLoading(true);
    setResult(null);
    setAnalysisPhase(0);

    try {
      await runAnalysisAnimation();
      const res = await api.post('/disease/predict/', { symptoms: selected });
      setResult({ ...res.data, timestamp: new Date().toISOString() });
    } catch (err) {
      const msg = err.response?.data?.error || 'Prediction failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Clinical intake card */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slateink-950 bg-gradient-to-r from-primary-50/80 to-slate-50 dark:from-primary-900/20 dark:to-slateink-800/60 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-soft">
              <Stethoscope className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slateink-900 dark:text-white text-[15px]">Symptom Checker</h3>
              <p className="text-xs text-slate-500">Enter your symptoms for an AI-assisted clinical assessment</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search symptoms (e.g., fever, headache, cough)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={symptomsLoading}
            />
            {symptomsLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Loading…</span>
            )}
          </div>

          {/* Search results dropdown */}
          {search && filtered.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-slate-200 dark:border-slateink-950 rounded-lg max-h-48 overflow-y-auto mb-4 bg-white dark:bg-slateink-900 shadow-lift"
              >
                {filtered.slice(0, 20).map(s => (
                  <motion.button
                    key={s}
                    onClick={() => addSymptom(s)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 ml-auto">+ Add</span>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Selected symptoms */}
          <AnimatePresence>
            {selected.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {selected.map((s, index) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="inline-flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                    <motion.button
                      onClick={() => removeSymptom(s)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      className="hover:text-primary-900 dark:hover:text-primary-100"
                      aria-label={`Remove ${s.replace(/_/g, ' ')}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-500 dark:text-slate-400 mb-4"
              >
                No symptoms selected. Search and click to add at least one symptom.
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            onClick={handlePredict}
            disabled={loading || selected.length === 0}
            loading={loading}
            leftIcon={!loading ? <Activity className="w-4 h-4" /> : undefined}
            className="w-full sm:w-auto"
            size="lg"
          >
            {loading ? 'Analyzing Symptoms…' : 'Run AI Prediction'}
          </Button>

          <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-teal-500 dark:text-teal-400" />
            <p>Educational estimate only. Always consult a qualified healthcare professional.</p>
          </div>
        </div>
      </Card>

      {/* Analysis Animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 border-primary-200 dark:border-primary-800"
          >
            <h3 className="font-semibold text-primary-800 dark:text-primary-200 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
              AI Analysis in Progress
            </h3>
            <div className="space-y-3">
              {analysisSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-300',
                    index < analysisPhase
                      ? 'bg-white/80 dark:bg-slateink-900/40'
                      : index === analysisPhase
                        ? 'bg-primary-100 dark:bg-primary-900/30 animate-pulse'
                        : 'bg-slate-100/60 dark:bg-slateink-900/40'
                  )}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: index <= analysisPhase ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.1 }}
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                      index < analysisPhase
                        ? 'bg-green-500 text-white'
                        : index === analysisPhase
                          ? 'bg-primary-500 text-white animate-spin'
                          : 'bg-slate-300 dark:bg-slate-600 text-slate-500'
                    )}
                  >
                    {index < analysisPhase ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index <= analysisPhase ? 1 : 0.5 }}
                    className={cn(
                      'text-sm font-medium',
                      index <= analysisPhase ? 'text-slateink-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {step.label}
                  </motion.span>
                  <motion.div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: index < analysisPhase ? '100%' : index === analysisPhase ? '50%' : 0 }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: index * 0.1 }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            <div className="card space-y-5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slateink-950 pb-4">
                <h3 className="font-semibold text-slateink-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </span>
                  Prediction Result
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs">{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 sm:p-8"
              >
                <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
                  <div>
                    <p className="text-sm text-primary-100 font-medium mb-1">Predicted Condition</p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-bold capitalize leading-tight"
                    >
                      {result.disease.replace(/_/g, ' ')}
                    </motion.p>
                    <p className="text-sm text-primary-200 mt-3 max-w-md leading-relaxed">
                      The model estimates this condition from the symptoms you provided. This is not a medical diagnosis.
                    </p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur rounded-xl px-6 py-5 border border-white/10">
                    <ConfidenceBadge confidence={result.confidence} />
                    <p className="text-[11px] text-primary-200 mt-2">Model confidence</p>
                  </div>
                </div>
              </motion.div>

              {/* Matched Symptoms */}
              <AnimatePresence>
                {result.matched_symptoms?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slateink-900/60 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-slateink-900 dark:text-white mb-2.5 flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-primary-500" />
                      Matched Symptoms ({result.matched_symptoms.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_symptoms.map((s, index) => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                          className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium capitalize"
                        >
                          {s.replace(/_/g, ' ')}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Predictions */}
              <AnimatePresence>
                {result.top_predictions?.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h4 className="font-medium text-slateink-900 dark:text-white mb-3">Top Predictions</h4>
                    <div className="space-y-3">
                      {result.top_predictions.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-slate-50 dark:bg-slateink-900/60 rounded-lg p-3"
                        >
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className={cn('font-medium capitalize', i === 0 && 'text-primary-600 dark:text-primary-400')}>
                              {p.disease.replace(/_/g, ' ')}
                            </span>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-slate-500 dark:text-slate-400 font-medium tabular-nums"
                            >
                              {(p.confidence * 100).toFixed(1)}%
                            </motion.span>
                          </div>
                          <Progress
                            value={p.confidence * 100}
                            height={6}
                            variant="default"
                            animated={!reducedMotion}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Important Disclaimer</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{result.disclaimer}</p>
                </div>
              </motion.div>

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-4 flex items-start gap-3"
              >
                <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sky-800 dark:text-sky-300 mb-1">Recommended Next Steps</p>
                  <ul className="text-sm text-sky-700 dark:text-sky-400 space-y-1 list-disc list-inside">
                    <li>Consult a qualified healthcare professional for proper evaluation</li>
                    <li>Do not start or stop any medication based on this prediction</li>
                    <li>Use this as a starting point for discussion with your doctor</li>
                    <li>If symptoms worsen, seek immediate medical attention</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <MedicalDisclaimer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}