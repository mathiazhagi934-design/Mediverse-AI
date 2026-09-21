import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Scan, Loader2, Info, Image as ImageIcon, CheckCircle, ShieldCheck, FileImage } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { ConfidenceBadge } from '../components/ui/Badge';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function SkinDetection() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    api.get('/skin/history/')
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum 5MB');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handlePredict = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/skin/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      if (res.data.prediction) {
        setHistory([{ ...res.data, id: res.data.id || Date.now() }, ...history]);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Prediction failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Upload & Preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card !p-5 sm:!p-6"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slateink-900 dark:text-white mb-2">Dermatology Image</label>
            <label
              className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all overflow-hidden ${
                preview
                  ? 'border-primary-300 dark:border-primary-700 bg-primary-50/40 dark:bg-primary-900/10'
                  : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 bg-slate-50 dark:bg-slateink-900/50'
              }`}
            >
              {preview ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={preview}
                  alt="Preview"
                  className="max-h-72 mx-auto rounded-lg shadow-soft"
                />
              ) : (
                <div className="space-y-3 py-8">
                  <span className="w-14 h-14 rounded-2xl bg-white dark:bg-slateink-900 border border-slate-200 dark:border-slateink-950 mx-auto flex items-center justify-center shadow-soft">
                    <FileImage className="w-7 h-7 text-primary-500" />
                  </span>
                  <p className="text-sm font-medium text-slateink-900 dark:text-white">Click to select an image</p>
                  <p className="text-xs text-slate-400">JPEG, PNG, or WebP (max 5MB)</p>
                </div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
            </label>
            {preview && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5" /> Review the selected image, then run the analysis.
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <Button
              onClick={handlePredict}
              disabled={loading || !file}
              loading={loading}
              size="lg"
              leftIcon={!loading ? <Scan className="w-4 h-4" /> : undefined}
              className="w-full sm:w-auto"
            >
              {loading ? 'Analyzing Image…' : 'Run Skin Analysis'}
            </Button>

            <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-teal-500" />
              <p>Images are processed securely. Detection is educational and not a diagnosis.</p>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-5 space-y-3"
                >
                  {result.is_model_available ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl2 border border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-slateink-900 p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-soft">
                          <CheckCircle className="w-5 h-5" />
                        </span>
                        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">Detection Result</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Prediction</p>
                          <p className="text-2xl font-bold text-primary-800 dark:text-primary-200 mt-1 capitalize">{result.prediction.replace(/_/g, ' ')}</p>
                        </div>
                        {result.confidence > 0 && (
                          <div>
                            <p className="text-xs text-primary-500 font-medium mb-1.5">Confidence</p>
                            <ConfidenceBadge confidence={result.confidence} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-primary-600/80 dark:text-primary-400/80 mt-4">
                        The model estimates this condition based on the uploaded image. This is not a medical diagnosis.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-5">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-soft">
                          <Info className="w-5 h-5" />
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-sky-800 dark:text-sky-300 mb-1">Model Not Configured</h3>
                          <p className="text-sm text-sky-700 dark:text-sky-400 mb-2">{result.message}</p>
                          <div className="bg-white/70 dark:bg-slateink-900/40 rounded-lg p-3 text-xs text-sky-800 dark:text-sky-300 border border-sky-100 dark:border-sky-900">
                            <p className="font-medium mb-1">To enable skin disease detection:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Obtain a trained skin disease classification model (e.g., HAM10000 dataset)</li>
                              <li>Save as <code className="bg-sky-100 dark:bg-sky-900 px-1 rounded">skin_model.h5</code> in <code className="bg-sky-100 dark:bg-sky-900 px-1 rounded">backend/trained_models/</code></li>
                              <li>Ensure class mapping matches the 8 skin disease categories</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {result.disclaimer && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">{result.disclaimer}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* History */}
      {!historyLoading && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card !p-5 sm:!p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </span>
            <div>
              <h3 className="section-title">Scan History</h3>
              <p className="text-xs text-slate-400">Recent skin analyses</p>
            </div>
          </div>
          <div className="space-y-2">
            {history.slice(0, 10).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slateink-950 bg-slate-50/60 dark:bg-slateink-800/50 p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-white dark:bg-slateink-800 border border-slate-200 dark:border-slateink-950 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slateink-900 dark:text-white capitalize truncate">
                      {p.prediction?.replace(/_/g, ' ') || 'No prediction (model unavailable)'}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {p.confidence > 0 && <ConfidenceBadge confidence={p.confidence} />}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {(!historyLoading && history.length === 0 && !result) && (
        <div className="card">
          <EmptyState
            icon={ImageIcon}
            title="No scans yet"
            description="Upload a skin image to receive an AI-assisted dermatology screening."
          />
        </div>
      )}

      <MedicalDisclaimer>
        MediVerse AI provides AI-generated health information for educational purposes only and is not a substitute for professional medical advice. Always consult a dermatologist for proper diagnosis of skin conditions.
      </MedicalDisclaimer>
    </div>
  );
}