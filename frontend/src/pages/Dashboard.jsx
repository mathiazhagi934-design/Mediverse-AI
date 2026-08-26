import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Activity, FileText, TrendingUp, AlertTriangle, Heart, ArrowRight, Scan, Shield, Users, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const health = data?.health_score || {};

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.username}</h1>
          <p className="text-gray-600 mt-1">Here's your health overview</p>
        </div>
        <div className="hidden sm:block text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Health Score - Main Card */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-6 p-2 md:p-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary-100 text-sm font-medium px-3 py-1 rounded-full bg-white/10">
                Educational Wellness Score
              </span>
              <Shield className="w-4 h-4 text-primary-200" />
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className={`text-5xl md:text-6xl font-bold ${getScoreColor(health.score)}`}>{health.score ?? '--'}</span>
              <span className="text-primary-200 text-xl">/ 100</span>
            </div>
            <p className="text-primary-200 text-sm">Not a medical assessment • For educational purposes only</p>
          </div>
          <div className="flex items-center justify-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center ${getScoreBg(health.score)} border-4 border-white/20`}>
              <Heart className={`w-14 h-14 ${getScoreColor(health.score)}`} />
            </div>
          </div>
        </div>
        
        {/* Health Factors */}
        {health.factors?.length > 0 && (
          <div className="relative mt-4 pt-4 border-t border-white/20">
            <h4 className="text-primary-100 text-sm font-medium mb-3">Contributing Factors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {health.factors.map((f, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-primary-100 font-medium mb-1">{f.factor}</p>
                  <p className="text-sm font-medium">{f.impact >= 0 ? '+' : ''}{f.impact} pts</p>
                  <p className="text-xs text-primary-200 mt-1">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_predictions || 0}</p>
              <p className="text-sm text-gray-500">Total Predictions</p>
            </div>
          </div>
        </div>
        <div className="stat-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_reports || 0}</p>
              <p className="text-sm text-gray-500">Reports Uploaded</p>
            </div>
          </div>
        </div>
        <div className="stat-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Scan className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_skin_predictions || 0}</p>
              <p className="text-sm text-gray-500">Skin Scans</p>
            </div>
          </div>
        </div>
        <div className="stat-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.most_frequent_disease ? stats.most_frequent_count : 0}</p>
              <p className="text-sm text-gray-500">Most Common Condition</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-lg">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <Link to="/app/predict" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Disease Prediction</p>
                  <p className="text-xs text-gray-500">Enter symptoms, get AI analysis</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
            </Link>
            <Link to="/app/reports" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Upload Report</p>
                  <p className="text-xs text-gray-500">Analyze medical PDF reports</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
            </Link>
            <Link to="/app/skin" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Scan className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Skin Detection</p>
                  <p className="text-xs text-gray-500">Upload image for skin analysis</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
            </Link>
            <Link to="/app/profile" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Update Profile</p>
                  <p className="text-xs text-gray-500">Complete health information</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
            </Link>
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-lg">Recent Predictions</h2>
            </div>
            <Link to="/app/history" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {data.recent_predictions?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_predictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.disease}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {p.symptoms?.slice(0, 3).join(', ')}{p.symptoms?.length > 3 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${p.confidence >= 0.7 ? 'bg-green-100 text-green-700' : p.confidence >= 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {(p.confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm mb-2">No predictions yet</p>
              <Link to="/app/predict" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4" />
                Make Your First Prediction
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Health Insights & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Common Condition */}
        {stats.most_frequent_disease && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-lg">Most Frequent Prediction</h2>
            </div>
            <div className="bg-primary-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-primary-800">{stats.most_frequent_disease}</p>
              <p className="text-sm text-primary-600 mt-1">Appeared {stats.most_frequent_count} time(s) in your history</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {health.recommendations?.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-lg">Personalized Recommendations</h2>
            </div>
            <div className="space-y-3">
              {health.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-primary-600 mb-1">{rec.category}</p>
                    <p className="text-sm text-gray-700">{rec.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reports */}
        {data.recent_reports?.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-lg">Recent Reports</h2>
              </div>
              <Link to="/app/reports" className="text-sm text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {data.recent_reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm truncate">{r.original_filename}</p>
                      <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {r.has_analysis && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Analyzed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          MediVerse AI provides AI-generated health information for educational purposes only and 
          is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
