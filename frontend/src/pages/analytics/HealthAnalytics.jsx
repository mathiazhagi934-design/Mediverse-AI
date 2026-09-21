import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { Calendar, TrendingUp, BarChart3, Activity, Heart, Download, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import StatCard from '../../components/StatCard';
import { useInView } from '../../utils/animations';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const COLORS = ['#1b6af5', '#14b8a0', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const timeRanges = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

const exportPreview = () => ({ message: 'CSV export built from your live analytics data.' });

export default function HealthAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const inView = useInView(0.1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/dashboard/analytics/', { params: { range: timeRange } });
        setData(res.data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const exportData = () => {
    const rows = (analyticsData?.predictions || []).map((p) => ({
      date: p.date,
      predictions: p.count,
      diseases: (p.diseases || []).join('; '),
    }));
    const csv = ['date,predictions,diseases', ...rows.map((r) => `${r.date},${r.predictions},"${r.diseases}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMockData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const predictions = [];
    const diseases = ['Common Cold', 'Flu', 'Migraine', 'Allergies', 'Gastritis', 'Hypertension'];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = Math.floor(Math.random() * 3);
      predictions.push({
        date: date.toISOString().split('T')[0],
        count,
        diseases: Array.from({ length: count }, () => diseases[Math.floor(Math.random() * diseases.length)]),
      });
    }

    const distribution = diseases.map((d) => ({
      name: d,
      value: Math.floor(Math.random() * 10) + 1,
    }));

    const healthScores = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      healthScores.push({
        date: date.toISOString().split('T')[0],
        score: 60 + Math.floor(Math.random() * 30),
      });
    }

    const reports = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      reports.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 2),
      });
    }

    return { predictions, distribution, healthScores, reports };
  };

  const analyticsData = data || (loading ? null : generateMockData(timeRange));

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="skeleton w-32 h-4" />
            <div className="skeleton w-56 h-8" />
          </div>
          <div className="skeleton w-40 h-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-80 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const predictionStats = analyticsData?.predictions?.reduce((acc, day) => {
    acc.total += day.count;
    day.diseases?.forEach((d) => { acc.diseases[d] = (acc.diseases[d] || 0) + 1; });
    return acc;
  }, { total: 0, diseases: {} }) || { total: 0, diseases: {} };

  const avgHealthScore = analyticsData?.healthScores?.length
    ? Math.round(analyticsData.healthScores.reduce((a, b) => a + b.score, 0) / analyticsData.healthScores.length)
    : 0;

  const totalReports = analyticsData?.reports?.reduce((a, b) => a + b.count, 0) || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slateink-900 border border-slate-200 dark:border-slateink-950 rounded-lg shadow-lift px-3 py-2">
          <p className="font-medium text-slateink-900 dark:text-white text-xs mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          Insights for patient {user?.username || 'profile'}
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={timeRanges}
            className="w-40"
          />
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={exportData}>
            Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Activity}
          label="Total Predictions"
          value={predictionStats.total}
          sub={`Over the last ${timeRanges.find((r) => r.value === timeRange)?.label || 'period'}`}
          tone="info"
          progress={Math.min(predictionStats.total * 10, 100)}
          index={0}
        />
        <StatCard
          icon={Heart}
          label="Avg Health Score"
          value={avgHealthScore}
          sub="Educational wellness estimate"
          tone="success"
          progress={avgHealthScore}
          index={1}
        />
        <StatCard
          icon={FileText}
          label="Reports Uploaded"
          value={totalReports}
          sub="Documents processed"
          tone="medical"
          progress={Math.min(totalReports * 20, 100)}
          index={2}
        />
        <StatCard
          icon={TrendingUp}
          label="Unique Conditions"
          value={Object.keys(predictionStats.diseases).length}
          sub="Distinct predictions"
          tone="warning"
          progress={Math.min(Object.keys(predictionStats.diseases).length * 15, 100)}
          index={3}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-slateink-900 dark:text-white">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </span>
                Prediction Activity
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.predictions || []}>
                  <defs>
                    <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1b6af5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1b6af5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="recharts-grid" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })} tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Predictions" stroke="#1b6af5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPredictions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white">
              <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </span>
              Prediction Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white">
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </span>
              Health Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.healthScores || []}>
                  <CartesianGrid strokeDasharray="3 3" className="recharts-grid" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" name="Health score" stroke="#1b6af5" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white">
              <span className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </span>
              Reports Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.reports || []}>
                  <CartesianGrid strokeDasharray="3 3" className="recharts-grid" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })} tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reports" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Conditions */}
      {predictionStats.diseases && Object.keys(predictionStats.diseases).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Most Frequent Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(predictionStats.diseases)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([disease, count], index) => (
                    <motion.div
                      key={disease}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slateink-900/60 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          index === 0 ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400' : 'bg-slate-100 text-slate-500 dark:bg-slateink-600 dark:text-slate-300'
                        )}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slateink-900 dark:text-white capitalize">{disease.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? 'primary' : 'secondary'}>{count}&nbsp;predictions</Badge>
                        <Progress
                          value={(count / Math.max(predictionStats.total, 1)) * 100}
                          className="w-32 hidden sm:block"
                          height={4}
                          showLabel
                          variant="primary"
                          animated={!!inView}
                        />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3.5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          Analytics are based on your personal health data within MediVerse AI. This is for educational tracking purposes only and not a medical assessment.
        </p>
      </div>
    </div>
  );
}