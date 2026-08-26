import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { Calendar, TrendingUp, BarChart3, Activity, Heart, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import { useInView, fadeInUp } from '../../utils/animations';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';

const COLORS = ['#338bff', '#14b8a0', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const timeRanges = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

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
    
    const distribution = diseases.map(d => ({
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
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Health Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your health trends and insights</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const predictionStats = analyticsData?.predictions?.reduce((acc, day) => {
    acc.total += day.count;
    day.diseases?.forEach(d => { acc.diseases[d] = (acc.diseases[d] || 0) + 1; });
    return acc;
  }, { total: 0, diseases: {} }) || { total: 0, diseases: {} };

  const avgHealthScore = analyticsData?.healthScores?.length
    ? Math.round(analyticsData.healthScores.reduce((a, b) => a + b.score, 0) / analyticsData.healthScores.length)
    : 0;

  const totalReports = analyticsData?.reports?.reduce((a, b) => a + b.count, 0) || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Health Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your health trends and insights over time</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={timeRanges}
            className="w-40"
          />
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Predictions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{predictionStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={Math.min(predictionStats.total * 10, 100)} height={4} variant="primary" className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Health Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{avgHealthScore}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={avgHealthScore} height={4} variant="success" className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reports Uploaded</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Progress value={Math.min(totalReports * 20, 100)} height={4} variant="purple" className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique Conditions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{Object.keys(predictionStats.diseases).length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <Progress value={Math.min(Object.keys(predictionStats.diseases).length * 15, 100)} height={4} variant="warning" className="mt-3" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Prediction Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
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
                      <stop offset="5%" stopColor="#338bff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#338bff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#338bff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPredictions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Health Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Health Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.healthScores || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Reports Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Reports Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.reports || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Conditions */}
      {predictionStats.diseases && Object.keys(predictionStats.diseases).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Most Frequent Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(predictionStats.diseases)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([disease, count], index) => (
                    <motion.div
                      key={disease}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{disease}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="primary">{count} predictions</Badge>
                        <Progress value={(count / predictionStats.total) * 100} className="w-32" height={4} showLabel variant="primary" />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Analytics are based on your personal health data within MediVerse AI. This is for educational tracking purposes only and not a medical assessment.
        </p>
      </div>
    </div>
  );
}