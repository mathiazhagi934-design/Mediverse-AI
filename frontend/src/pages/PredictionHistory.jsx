import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { History, Activity, Calendar, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useReducedMotion } from '../utils/animations';
import { Progress } from '../components/ui/Progress';
import { ConfidenceBadge } from '../components/ui/Badge';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    api.get('/disease/predictions/history/')
      .then(res => setPredictions(res.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {predictions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={History}
            title="No prediction history yet"
            description="Your completed AI disease assessments will appear here with confidence scores and details."
            action={
              <Link to="/app/predict" className="btn-primary text-sm inline-flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Start an assessment
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-sky-50 border border-primary-100 dark:from-primary-500/15 dark:to-sky-500/15 dark:border-primary-800 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slateink-900 dark:text-white capitalize">{p.predicted_disease.replace(/_/g, ' ')}</p>
                  <ConfidenceBadge confidence={p.confidence} />
                </div>
                <p className="text-sm text-slate-500 truncate mt-1">
                  Symptoms: {p.symptoms?.join(', ') || '—'}
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-44">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Confidence</span>
                  <span className="font-medium tabular-nums">{(p.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress
                  value={p.confidence * 100}
                  height={6}
                  variant={p.confidence >= 0.7 ? 'success' : p.confidence >= 0.4 ? 'warning' : 'error'}
                  animated={!reducedMotion}
                />
              </div>

              <div className="flex items-center gap-1.5 text-sm text-slate-500 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <MedicalDisclaimer />
    </div>
  );
}