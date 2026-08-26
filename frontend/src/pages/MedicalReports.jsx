import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Upload, Trash2, AlertTriangle, CheckCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const formatValue = (key, value) => {
  const units = {
    hemoglobin: 'g/dL',
    glucose: 'mg/dL',
    cholesterol: 'mg/dL',
    white_blood_cells: '/µL',
    red_blood_cells: '/µL',
    platelets: '/µL',
    creatinine: 'mg/dL',
    urea: 'mg/dL',
    bilirubin: 'mg/dL',
  };
  const unit = units[key] || '';
  return `${value} ${unit}`.trim();
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'normal': return <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />;
    case 'low': return <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />;
    case 'high': return <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
    default: return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'normal': return 'bg-green-50 border-green-200';
    case 'low': return 'bg-yellow-50 border-yellow-200';
    case 'high': return 'bg-red-50 border-red-200';
    default: return 'bg-blue-50 border-blue-200';
  }
};

export default function MedicalReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = () => {
    api.get('/reports/')
      .then(res => setReports(res.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are accepted');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/reports/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report uploaded and analyzed');
      setReports([res.data, ...reports]);
      setSelectedReport(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report? This action cannot be undone.')) return;
    try {
      await api.delete(`/reports/${id}/`);
      setReports(reports.filter(r => r.id !== id));
      if (selectedReport?.id === id) setSelectedReport(null);
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Medical Reports</h1>
        <p className="text-gray-600 mt-1">Upload and analyze PDF medical reports</p>
      </div>

      {/* Upload */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className={`btn-primary inline-flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload PDF Report'}
            <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <span className="text-sm text-gray-500">PDF files up to 10MB</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Report list */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Reports ({reports.length})</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="card text-center py-8">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No reports uploaded yet</p>
            </div>
          ) : (
            reports.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`card cursor-pointer transition-all hover:shadow-md p-4 ${selectedReport?.id === r.id ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.original_filename}</p>
                      <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="text-gray-400 hover:text-red-500 p-1" aria-label="Delete report">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report detail */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <div className="card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold truncate">{selectedReport.original_filename}</h2>
                <span className="text-xs text-gray-500">{new Date(selectedReport.created_at).toLocaleString()}</span>
              </div>

              {/* Patient Information */}
              {selectedReport.extracted_data?.patient_name || selectedReport.extracted_data?.age && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.extracted_data?.patient_name && (
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium capitalize">{selectedReport.extracted_data.patient_name}</p>
                      </div>
                    )}
                    {selectedReport.extracted_data?.age && (
                      <div>
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="font-medium">{selectedReport.extracted_data.age}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Laboratory Results */}
              {selectedReport.extracted_data && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Laboratory Results
                  </h3>
                  {Object.entries(selectedReport.extracted_data)
                    .filter(([key]) => !['patient_name', 'age'].includes(key))
                    .map(([key, val]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="font-medium text-gray-900">{formatValue(key, val)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Analysis */}
              {selectedReport.analysis?.interpretations?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Analysis
                  </h3>
                  <div className="space-y-3">
                    {selectedReport.analysis.interpretations.map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <p className="font-medium capitalize">{item.test.replace(/_/g, ' ')}: <span className="font-normal">{item.message}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">Status: <span className="capitalize font-medium">{item.status}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.analysis?.warnings?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Warnings
                  </h4>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {selectedReport.analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {selectedReport.analysis?.recommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Recommendation
                  </h4>
                  <p className="text-sm text-blue-700">{selectedReport.analysis.recommendation}</p>
                </div>
              )}

              {/* Extracted text preview */}
              {selectedReport.extracted_text && (
                <details className="group">
                  <summary className="cursor-pointer font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Extracted Text (Preview)
                    <span className="ml-auto text-xs text-gray-500">Click to expand</span>
                  </summary>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto whitespace-pre-wrap mt-2">{selectedReport.extracted_text.substring(0, 3000)}</pre>
                </details>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 mb-1">Medical Disclaimer</p>
                  <p className="text-sm text-amber-700">
                    This analysis is automated and for educational purposes only. 
                    Always consult a healthcare professional for medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
