import { useState, useEffect } from 'react';
import api from '../api/axios';
import { History, Activity, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/disease/predictions/history/')
      .then(res => setPredictions(res.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Prediction History</h1>
        <p className="text-gray-600 mt-1">View all your past disease predictions</p>
      </div>

      {predictions.length === 0 ? (
        <div className="card text-center py-12">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No prediction history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map(p => (
            <div key={p.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{p.predicted_disease}</p>
                <p className="text-sm text-gray-500 truncate">
                  Symptoms: {p.symptoms?.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${p.confidence >= 0.7 ? 'bg-green-100 text-green-700' : p.confidence >= 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {(p.confidence * 100).toFixed(1)}%
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
