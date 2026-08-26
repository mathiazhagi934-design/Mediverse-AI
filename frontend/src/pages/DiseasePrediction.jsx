import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Search, X, Activity, AlertTriangle, Loader2, Clock, Info, Stethoscope, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReducedMotion } from '../utils/animations';
import { cn } from '../utils/cn';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';

const analysisSteps = [
  { id: 'analyzing', label: 'Analyzing symptoms...' },
  { id: 'matching', label: 'Matching patterns...' },
  { id: 'running', label: 'Running ML model...' },
  { id: 'generating', label: 'Generating result...' },
  { id: 'complete', label: 'Analysis complete' },
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
      <div>
        <h1 className="text-2xl font-bold">Disease Prediction</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Select your symptoms to get an AI-powered prediction</p>
      </div>

      {/* Symptom selector */}
      <Card>
        <h2 className="font-semibold mb-3">Select Symptoms</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search symptoms (e.g., fever, headache, cough)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={symptomsLoading}
          />
        </div>

        {/* Search results dropdown */}
        {search && filtered.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto mb-4"
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
                  <span className="text-xs text-primary-600 ml-auto">+ Add</span>
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
                  className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm font-medium"
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
              className="text-sm text-gray-500 dark:text-gray-400 mb-4"
            >
              No symptoms selected. Search and click to add symptoms.
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handlePredict}
          disabled={loading || selected.length === 0}
          whileHover={{ scale: loading || selected.length === 0 ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'btn-primary inline-flex items-center gap-2 w-full sm:w-auto',
            loading && 'opacity-75'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Predict Disease
            </>
          )}
        </motion.button>
      </Card>

      {/* Analysis Animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800"
          >
            <h3 className="font-semibold text-primary-800 dark:text-primary-200 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse" />
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
                      ? 'bg-white/80 dark:bg-gray-800/50'
                      : index === analysisPhase
                      ? 'bg-primary-100 dark:bg-primary-900/30 animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-800/50'
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
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                    )}
                  >
                    {index <= analysisPhase && <Check className="w-4 h-4" />}
                    {index === analysisPhase && <Loader2 className="w-4 h-4" />}
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index <= analysisPhase ? 1 : 0.5 }}
                    className={cn(
                      'text-sm font-medium',
                      index <= analysisPhase ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {step.label}
                  </motion.span>
                  <motion.div
                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  >
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
            className="card space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Prediction Result</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-5"
            >
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Predicted Disease</p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-primary-800 dark:text-primary-200 mt-1"
                  >
                    {result.disease}
                  </motion.p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Prediction Confidence</p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                    className="text-3xl font-bold text-primary-800 dark:text-primary-200 mt-1"
                  >
                    {(result.confidence * 100).toFixed(1)}%
                  </motion.div>
                  <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
                    The model estimates this condition based on the selected symptoms. 
                    This is not a medical diagnosis.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Matched Symptoms */}
            <AnimatePresence>
              {result.matched_symptoms?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Matched Symptoms ({result.matched_symptoms.length})
                  </h3>
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
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Top Predictions</h3>
                  <div className="space-y-3">
                    {result.top_predictions.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className={cn('font-medium', i === 0 && 'text-primary-600 dark:text-primary-400')}>{p.disease}</span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 dark:text-gray-400 font-medium"
                          >
                            {(p.confidence * 100).toFixed(1)}%
                          </motion.span>
                        </div>
                        <Progress
                          value={p.confidence * 100}
                          height={4}
                          variant={i === 0 ? 'primary' : 'default'}
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
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Important Disclaimer</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">{result.disclaimer}</p>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Recommended Next Steps</p>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>Consult a qualified healthcare professional for proper evaluation</li>
                  <li>Do not start or stop any medication based on this prediction</li>
                  <li>Use this as a starting point for discussion with your doctor</li>
                  <li>If symptoms worsen, seek immediate medical attention</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}