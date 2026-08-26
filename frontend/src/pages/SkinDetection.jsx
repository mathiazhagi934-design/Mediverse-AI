import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Scan, Upload, AlertTriangle, Loader2, Info, Image as ImageIcon, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
      <div>
        <h1 className="text-2xl font-bold">Skin Disease Detection</h1>
        <p className="text-gray-600 mt-1">Upload a skin image for AI-powered analysis</p>
      </div>

      {/* Upload & Preview */}
      <div className="card">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
            <label className={`block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors ${preview ? '' : 'min-h-[200px]'}`}>
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Click to select an image</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, or WebP (max 5MB)</p>
                </div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
          <div className="flex flex-col justify-center">
            <button onClick={handlePredict} disabled={loading || !file} className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>

            {result && (
              <div className="mt-4 space-y-3">
                {result.is_model_available ? (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                      <p className="text-sm font-medium text-primary-600">Detection Result</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-primary-500 font-medium">Prediction</p>
                        <p className="text-xl font-bold text-primary-800 mt-1">{result.prediction}</p>
                      </div>
                      {result.confidence > 0 && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Confidence</p>
                          <p className="text-xl font-bold text-primary-800 mt-1">{(result.confidence * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-primary-600 mt-3">
                      The model estimates this condition based on the uploaded image. 
                      This is not a medical diagnosis.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-800 mb-1">Model Not Configured</h3>
                        <p className="text-sm text-blue-700 mb-2">{result.message}</p>
                        <div className="bg-blue-100 rounded-lg p-3 text-xs text-blue-800">
                          <p className="font-medium mb-1">To enable skin disease detection:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Obtain a trained skin disease classification model (e.g., HAM10000 dataset)</li>
                            <li>Save as <code className="bg-blue-200 px-1 rounded">skin_model.h5</code> in <code className="bg-blue-200 px-1 rounded">backend/trained_models/</code></li>
                            <li>Ensure class mapping matches the 8 skin disease categories</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {result.disclaimer && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">{result.disclaimer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {!historyLoading && history.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3">Scan History</h2>
          <div className="space-y-2">
            {history.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{p.prediction || 'No prediction (model unavailable)'}</p>
                  <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
                </div>
                {p.confidence > 0 && (
                  <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    {(p.confidence * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!historyLoading && history.length === 0 && !result) && (
        <div className="card text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No scans yet. Upload an image to get started.</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          MediVerse AI provides AI-generated health information for educational purposes only and 
          is not a substitute for professional medical advice. Always consult a dermatologist for 
          proper diagnosis of skin conditions.
        </p>
      </div>
    </div>
  );
}
