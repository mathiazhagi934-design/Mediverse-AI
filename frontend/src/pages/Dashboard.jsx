import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Activity, FileText, HeartPulse, Stethoscope, Scan, ArrowRight, Calendar,
  ShieldCheck, ClipboardPlus, TrendingUp, Clock, CircleCheck, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { CircularProgress } from '../components/ui/Progress';
import { HealthStatusBadge } from '../components/ui/Badge';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const scoreTone = (score) => {
  if (score >= 80) return { color: 'text-green-600 dark:text-green-400', bar: 'bg-green-500', ring: 'success' };
  if (score >= 60) return { color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', ring: 'warning' };
  return { color: 'text-red-600 dark:text-red-400', bar: 'bg-red-500', ring: 'error' };
};

const healthStatusFromScore = (score) => {
  if (score === null || score === undefined) return 'monitoring';
  if (score >= 80) return 'stable';
  if (score >= 60) return 'attention';
  return 'critical';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/dashboard/')
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="skeleton w-48 h-8" />
          <div className="skeleton w-32 h-8 ml-auto" />
        </div>
        <div className="card grid md:grid-cols-[1fr_220px] gap-6">
          <div className="space-y-3">
            <div className="skeleton w-24 h-4" />
            <div className="skeleton w-40 h-16" />
            <div className="skeleton w-64 h-4" />
          </div>
          <div className="skeleton w-40 h-40 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <EmptyState
          icon={Activity}
          title="Couldn't load your dashboard"
          description="We were unable to reach the health services. Please try again."
          action={
            <button onClick={load} className="btn-primary text-sm">Retry</button>
          }
        />
      </div>
    );
  }

  const stats = data?.stats || {};
  const health = data?.health_score || {};
  const score = health?.score ?? null;
  const tone = scoreTone(score);
  const status = healthStatusFromScore(score);

  const activityItems = [
    ...(data?.recent_predictions || []).map((p) => ({
      id: `pred-${p.id}`,
      type: 'prediction',
      icon: Stethoscope,
      tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
      title: `Prediction completed · ${p.disease}`,
      description: (p.symptoms || []).slice(0, 3).join(', '),
      meta: p.confidence ? `${(p.confidence * 100).toFixed(0)}% confidence` : null,
      date: p.created_at,
    })),
    ...(data?.recent_reports || []).map((r) => ({
      id: `report-${r.id}`,
      type: 'report',
      icon: FileText,
      tone: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
      title: r.has_analysis ? 'Report analyzed' : 'Report uploaded',
      description: r.original_filename,
      meta: r.has_analysis ? 'AI extraction complete' : 'Awaiting analysis',
      date: r.created_at,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const quickActions = [
    { to: '/app/predict', icon: Stethoscope, label: 'Check Symptoms', desc: 'Start a clinical assessment', tone: 'from-sky-500/10 to-sky-500/5 text-sky-600 border-sky-200 dark:text-sky-400 dark:border-sky-800/40' },
    { to: '/app/reports', icon: ClipboardPlus, label: 'Upload Report', desc: 'Add a medical PDF record', tone: 'from-teal-500/10 to-teal-500/5 text-teal-600 border-teal-200 dark:text-teal-400 dark:border-teal-800/40' },
    { to: '/app/predict', icon: Activity, label: 'Disease Prediction', desc: 'Analyze symptoms with AI', tone: 'from-primary-500/10 to-primary-500/5 text-primary-600 border-primary-200 dark:text-primary-400 dark:border-primary-800/40' },
    { to: '/app/analytics', icon: TrendingUp, label: 'Health Analytics', desc: 'Review trends and insights', tone: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="section-eyebrow mb-1">Patient Overview</p>
          <h2 className="text-2xl md:text-[1.75rem] font-bold text-slateink-900 dark:text-white">
            {getGreeting()}, {user?.username}
          </h2>
          <p className="text-[15px] text-slate-500 mt-1">Here's an overview of your health today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-soft text-sm text-slate-600 dark:bg-slateink-900 dark:border-slateink-700 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-primary-500" />
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Health Score — central card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="rounded-xl2 bg-white border border-slate-200 shadow-soft overflow-hidden dark:bg-slateink-900 dark:border-slateink-700"
      >
        <div className="grid md:grid-cols-[1fr_230px]">
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium dark:bg-primary-500/15 dark:text-primary-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Wellness Score
              </span>
              <HealthStatusBadge status={status} />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-5xl font-bold tabular-nums ${tone.color}`}>
                {score ?? '--'}
              </span>
              <span className="text-xl text-slate-400">/ 100</span>
            </div>
            <p className="text-sm text-slate-500 mt-2 max-w-lg">
              A combined educational indicator based on your recent predictions, reports and symptom activity.
              Not a medical assessment.
            </p>

            {health?.factors?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Contributing Factors
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {health.factors.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slateink-800 dark:bg-slateink-800/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{f.factor}</p>
                        <span className={`text-sm font-bold tabular-nums ${f.impact >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {f.impact >= 0 ? '+' : ''}{f.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{f.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-6 border-t md:border-t-0 md:border-l border-slate-100 bg-gradient-to-b from-slate-50/80 to-white dark:border-slateink-800 dark:from-slateink-800/40 dark:to-slateink-900">
            <CircularProgress
              value={score || 0}
              size={150}
              strokeWidth={11}
              variant={tone.ring}
              className="mb-3"
            />
            <div className="text-center">
              <p className="font-semibold text-slateink-900 dark:text-slate-100">
                {status === 'stable' ? 'Stable' : status === 'attention' ? 'Review' : status === 'critical' ? 'Caution' : 'No data'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {status === 'stable' ? 'Vitals appear stable' : status === 'attention' ? 'Some indicators need review' : status === 'critical' ? 'Seek professional guidance' : 'Awaiting data'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HeartPulse}
          label="Health Score"
          value={score ?? '--'}
          sub={stats.most_frequent_disease ? 'Condition: ' + stats.most_frequent_disease : 'Educational estimate'}
          tone={tone.ring}
          progress={score || 0}
          index={0}
        />
        <StatCard
          icon={Stethoscope}
          label="Total Predictions"
          value={stats.total_predictions || 0}
          sub="AI clinical assessments"
          tone="info"
          progress={Math.min((stats.total_predictions || 0) * 8, 100)}
          index={1}
        />
        <StatCard
          icon={FileText}
          label="Medical Reports"
          value={stats.total_reports || 0}
          sub="Documents on file"
          tone="medical"
          progress={Math.min((stats.total_reports || 0) * 16, 100)}
          index={2}
        />
        <StatCard
          icon={Scan}
          label="Skin Scans"
          value={stats.total_skin_predictions || 0}
          sub="AI image analyses"
          tone="neutral"
          progress={Math.min((stats.total_skin_predictions || 0) * 14, 100)}
          index={3}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card lg:col-span-1 !p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="section-title">Quick Actions</h3>
              <p className="text-xs text-slate-400">Common patient tasks</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {quickActions.map(({ to, icon: Icon, label, desc, tone }, i) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 hover:border-slate-200 p-3 transition-all hover:shadow-soft bg-white dark:bg-slateink-800 dark:border-slateink-700 dark:hover:border-slateink-600 dark:hover:bg-slateink-800"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slateink-900 dark:text-slate-100">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity timeline */}
        <div className="lg:col-span-2 card !p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h3 className="section-title">Recent Activity</h3>
                <p className="text-xs text-slate-400">Latest health events</p>
              </div>
            </div>
            <Link to="/app/timeline" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium inline-flex items-center gap-1">
              View timeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activityItems.length > 0 ? (
            <ol className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slateink-700">
              {activityItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex items-start gap-4 pl-10"
                >
                  <span className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slateink-900 ${item.tone}`}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-slateink-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    {item.meta && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/15 rounded-full px-2 py-0.5">
                        <CircleCheck className="w-3 h-3" /> {item.meta}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Predictions, report uploads and skin analyses will appear here."
              action={
                <Link to="/app/predict" className="btn-primary text-sm">Start a prediction</Link>
              }
            />
          )}
        </div>
      </div>

      {/* Recommendations + most common condition */}
      {(health?.recommendations?.length > 0 || stats.most_frequent_disease) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {health?.recommendations?.length > 0 && (
            <div className="card !p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="section-title">Personalized Recommendations</h3>
                  <p className="text-xs text-slate-400">Based on your recent activity</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {health.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slateink-800 dark:bg-slateink-800/50">
                    <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-primary-600 dark:bg-slateink-900 dark:border-slateink-700 dark:text-primary-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-0.5">{rec.category}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.most_frequent_disease && (
            <div className="card !p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="section-title">Most Frequent Prediction</h3>
                  <p className="text-xs text-slate-400">From your prediction history</p>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-5 dark:from-sky-500/15 dark:to-primary-500/10 dark:border-sky-800/40">
                <p className="text-2xl font-bold text-sky-900 dark:text-sky-300 capitalize">{stats.most_frequent_disease.replace(/_/g, ' ')}</p>
                <p className="text-sm text-sky-700 dark:text-sky-400 mt-1">
                  Appeared {stats.most_frequent_count} {stats.most_frequent_count === 1 ? 'time' : 'times'} in your history
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                This reflects your historical symptom assessments, not a diagnosis.
              </p>
            </div>
          )}
        </div>
      )}

      <MedicalDisclaimer />
    </div>
  );
}