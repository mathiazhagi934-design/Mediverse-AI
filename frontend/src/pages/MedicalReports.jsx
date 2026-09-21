import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { FileText, Upload, Trash2, AlertTriangle, AlertCircle, Info, Loader2, ShieldCheck, Sparkles, UserRound, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { HealthStatusBadge, Badge } from '../components/ui/Badge';
import EmptyState from '../components/EmptyState';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

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

const getStatusColor = (status) => {
  switch (status) {
    case 'normal': return 'bg-green-50 border-green-200 dark:bg-green-500/15 dark:border-green-500/30';
    case 'low': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-500/15 dark:border-yellow-500/30';
    case 'high': return 'bg-red-50 border-red-200 dark:bg-red-500/15 dark:border-red-500/30';
    default: return 'bg-blue-50 border-blue-200 dark:bg-blue-500/15 dark:border-blue-500/30';
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

  const hasPatientInfo = selectedReport?.extracted_data?.patient_name || selectedReport?.extracted_data?.age;
  const labKeys = selectedReport?.extracted_data
    ? Object.entries(selectedReport.extracted_data).filter(([key]) => !['patient_name', 'age'].includes(key))
    : [];

  return (
    <div className="space-y-6">
      {/* Upload panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl2 border border-dashed border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50/60 to-teal-50/40 dark:from-primary-900/10 dark:to-teal-900/10 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-soft shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slateink-900 dark:text-white">Secure Report Upload</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Upload a PDF lab report — AI extracts values, flags abnormal results and summarizes insights.
            </p>
          </div>
          <div className="shrink-0">
            <label className="cursor-pointer inline-flex">
              <Button loading={uploading} leftIcon={!uploading ? <Upload className="w-4 h-4" /> : undefined}>
                {uploading ? 'Analyzing Report…' : 'Upload PDF Report'}
              </Button>
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-slate-400 mt-1.5 text-center sm:text-right">PDF up to 10MB</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Report list */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reports ({reports.length})</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={FileText}
                title="No reports yet"
                description="Upload a PDF report to begin AI-powered extraction and analysis."
              />
            </div>
          ) : (
            reports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedReport(r)}
                className={`group card cursor-pointer transition-all hover:shadow-card p-4 flex items-center gap-3 ${
                  selectedReport?.id === r.id ? 'ring-2 ring-primary-500 border-primary-200 dark:border-primary-500/50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slateink-900 dark:text-white truncate">{r.original_filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    {r.has_analysis ? (
                      <Badge variant="success" size="sm" dot dotColor="bg-green-500">Analyzed</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Pending</Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                  className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors shrink-0"
                  aria-label={`Delete ${r.original_filename}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Report detail */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card space-y-5 !p-5 sm:!p-6"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slateink-950 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slateink-900 dark:text-white truncate">{selectedReport.original_filename}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Uploaded {new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              {hasPatientInfo && (
                <div className="rounded-lg border border-slate-100 dark:border-slateink-950 bg-slate-50/60 dark:bg-slateink-800/50 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-primary-500" /> Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReport.extracted_data?.patient_name && (
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="font-medium text-slateink-900 dark:text-white capitalize">{selectedReport.extracted_data.patient_name}</p>
                      </div>
                    )}
                    {selectedReport.extracted_data?.age && (
                      <div>
                        <p className="text-xs text-slate-500">Age</p>
                        <p className="font-medium text-slateink-900 dark:text-white">{selectedReport.extracted_data.age}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Laboratory Results */}
              {labKeys.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary-500" /> Laboratory Results
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {labKeys.map(([key, val]) => (
                      <div key={key} className="rounded-lg border border-slate-100 dark:border-slateink-950 bg-slate-50/60 dark:bg-slateink-800/50 p-3.5">
                        <p className="text-xs text-slate-500 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                        <p className="font-medium text-slateink-900 dark:text-white text-[15px] tabular-nums">{formatValue(key, val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis */}
              {selectedReport.analysis?.interpretations?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-500" /> Clinical Interpretation
                  </h3>
                  <div className="space-y-2.5">
                    {selectedReport.analysis.interpretations.map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3.5 rounded-lg border ${getStatusColor(item.status)}`}>
                        <div className="pt-0.5">
                          <HealthStatusBadge status={item.status} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slateink-900 dark:text-white capitalize">
                            {item.test.replace(/_/g, ' ')}
                            <span className="font-normal text-slate-600 dark:text-slate-300">: {item.message}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {selectedReport.analysis?.warnings?.length > 0 && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Warnings</h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 list-disc list-inside space-y-1">
                      {selectedReport.analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {selectedReport.analysis?.recommendation && (
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-sky-800 dark:text-sky-300 mb-1">Recommendation</h4>
                    <p className="text-sm text-sky-700 dark:text-sky-400">{selectedReport.analysis.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Extracted text preview */}
              {selectedReport.extracted_text && (
                <details className="group">
                  <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Extracted Text (Preview)
                    <span className="ml-auto text-xs text-slate-400">Click to expand</span>
                  </summary>
                  <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slateink-900/60 p-3 rounded-lg max-h-64 overflow-y-auto whitespace-pre-wrap mt-2 font-mono">
                    {selectedReport.extracted_text.substring(0, 3000)}
                  </pre>
                </details>
              )}

              <MedicalDisclaimer />
            </motion.div>
          ) : (
            <div className="card h-full min-h-[320px]">
              <EmptyState
                icon={FileText}
                title="Select a report"
                description="Choose a report from the list to view its patient details, lab values and AI analysis."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}