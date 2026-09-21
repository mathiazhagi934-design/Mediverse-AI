import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { Calendar, Activity, FileText, Scan, Heart, Shield, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDistanceToNow, format } from 'date-fns';

const eventIcons = {
  prediction: Activity,
  report: FileText,
  skin: Scan,
  health_score: Heart,
  profile: Shield,
  login: TrendingUp,
};

const eventColors = {
  prediction: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  report: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  skin: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  health_score: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  profile: 'bg-slate-100 dark:bg-slateink-900 text-slate-600 dark:text-slate-300',
  login: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

const dotColors = {
  prediction: 'bg-sky-500',
  report: 'bg-teal-500',
  skin: 'bg-primary-500',
  health_score: 'bg-rose-500',
  profile: 'bg-slate-400',
  login: 'bg-amber-500',
};

const eventLabels = {
  prediction: 'Disease Prediction',
  report: 'Medical Report',
  skin: 'Skin Analysis',
  health_score: 'Health Score Update',
  profile: 'Profile Updated',
  login: 'Login',
};

export default function HealthTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState(new Set());

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const [predictions, reports, skin, healthScores] = await Promise.all([
          api.get('/disease/predictions/history/').catch(() => ({ data: [] })),
          api.get('/reports/').catch(() => ({ data: [] })),
          api.get('/skin/history/').catch(() => ({ data: [] })),
          api.get('/dashboard/health-score-history/').catch(() => ({ data: [] })),
        ]);

        const allEvents = [
          ...(predictions.data || []).map(p => ({
            id: `pred-${p.id}`,
            type: 'prediction',
            title: p.predicted_disease,
            description: `Symptoms: ${p.symptoms?.join(', ') || 'N/A'}`,
            confidence: p.confidence,
            date: p.created_at,
            data: p,
          })),
          ...(reports.data || []).map(r => ({
            id: `report-${r.id}`,
            type: 'report',
            title: r.original_filename,
            description: r.analysis?.recommendation || 'Report uploaded and analyzed',
            date: r.created_at,
            data: r,
          })),
          ...(skin.data || []).map(s => ({
            id: `skin-${s.id}`,
            type: 'skin',
            title: s.prediction || 'Skin Analysis',
            description: s.is_model_available ? `Confidence: ${(s.confidence * 100).toFixed(1)}%` : 'Model not available',
            confidence: s.confidence,
            date: s.created_at,
            data: s,
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setEvents(allEvents);
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);

  const groupEventsByDate = (events) => {
    const groups = {};
    events.forEach(event => {
      const date = new Date(event.date).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  const toggleExpand = (eventId) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-eyebrow">Timeline</p>
            <h1 className="text-2xl font-bold text-slateink-900 dark:text-white">Health Timeline</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Your chronological health journey</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 skeleton rounded-xl flex items-center">
              <div className="w-0.5 h-full bg-slateink-100 dark:bg-slateink-800 ml-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="section-eyebrow">Timeline</p>
          <h1 className="text-2xl font-bold text-slateink-900 dark:text-white">Health Timeline</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your chronological health journey</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field py-2 w-auto"
          >
            <option value="all">All Events</option>
            <option value="prediction">Predictions</option>
            <option value="report">Reports</option>
            <option value="skin">Skin Analysis</option>
            <option value="health_score">Health Score</option>
            <option value="profile">Profile</option>
          </select>
        </div>
      </motion.div>

      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/15 border border-primary-100 dark:border-primary-500/15 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-primary-500" />
          </div>
          <p className="font-medium text-slateink-900 dark:text-white">No timeline events yet</p>
          <p className="text-sm text-slate-500 mt-1">
            {filter === 'all'
              ? 'Start by making a prediction or uploading a report'
              : `No ${eventLabels[filter]?.toLowerCase() || 'events'} found`}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {Object.entries(groupedEvents).map(([dateStr, dayEvents], dateIndex) => (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.05 }}
                className="relative"
              >
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-primary-500/30 to-teal-500/20" />

                  {/* Date header */}
                  <div className="relative z-10 flex items-center mb-4">
                    <div className="w-12 h-12 bg-slateink-900 dark:bg-slateink-950 rounded-full flex items-center justify-center border-2 border-primary-500/40 shadow-soft">
                      <Calendar className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-slateink-900 dark:text-white">
                        {dateStr === new Date().toDateString() ? 'Today' : format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-slate-500">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="ml-14 space-y-3">
                    {dayEvents.map((event, eventIndex) => {
                      const Icon = eventIcons[event.type] || Activity;
                      const isExpanded = expandedEvents.has(event.id);

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: dateIndex * 0.05 + eventIndex * 0.03 }}
                          className="relative"
                        >
                          <div className="relative">
                            {/* Timeline dot */}
                            <div
                              className={cn('absolute left-[-18px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slateink-950 z-10 shadow-sm', dotColors[event.type] || 'bg-slate-400')}
                            />

                            {/* Event card */}
                            <motion.div
                              whileHover={{ x: 4 }}
                              className={cn(
                                'card !p-4 hover:shadow-card transition-all duration-200 cursor-pointer border-slate-200 dark:border-slateink-800',
                                'relative pl-2'
                              )}
                              onClick={() => handleEventClick(event)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', eventColors[event.type])}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Badge variant="outline" className="text-xs">{eventLabels[event.type]}</Badge>
                                      <time className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                                      </time>
                                    </div>
                                  </div>
                                  <p className="font-medium text-slateink-900 dark:text-white mt-1 truncate">{event.title}</p>
                                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{event.description}</p>
                                  {typeof event.confidence === 'number' && (
                                    <Badge variant="primary" className="mt-2" dot dotColor="bg-teal-500">
                                      Confidence: {(event.confidence * 100).toFixed(1)}%
                                    </Badge>
                                  )}
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-1" />
                              </div>

                              {/* Expanded details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 pt-4 border-t border-slate-100 dark:border-slateink-800 space-y-3"
                                  >
                                    {event.type === 'prediction' && event.data && (
                                      <>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                          <div className="bg-slate-50 dark:bg-slateink-950/60 rounded-lg p-3">
                                            <p className="text-xs text-slate-500">Symptoms</p>
                                            <p className="text-sm font-medium text-slateink-900 dark:text-white">{event.data.symptoms?.join(', ') || 'N/A'}</p>
                                          </div>
                                          <div className="bg-slate-50 dark:bg-slateink-950/60 rounded-lg p-3">
                                            <p className="text-xs text-slate-500">Confidence</p>
                                            <p className="text-sm font-medium text-slateink-900 dark:text-white">{(event.data.confidence * 100).toFixed(1)}%</p>
                                          </div>
                                        </div>
                                        {event.data.top_predictions && event.data.top_predictions.length > 1 && (
                                          <div>
                                            <p className="text-xs text-slate-500 mb-2">Top Predictions</p>
                                            <div className="space-y-2">
                                              {event.data.top_predictions.slice(1).map((p, i) => (
                                                <div key={i} className="bg-slate-50 dark:bg-slateink-950/60 rounded-lg p-3">
                                                  <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slateink-900 dark:text-white">{p.disease}</span>
                                                    <span className="font-medium text-slateink-900 dark:text-white">{(p.confidence * 100).toFixed(1)}%</span>
                                                  </div>
                                                  <div className="w-full bg-slate-200 dark:bg-slateink-800 rounded-full h-1.5">
                                                    <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${p.confidence * 100}%` }} />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {event.type === 'report' && event.data && (
                                      <>
                                        <div className="bg-slate-50 dark:bg-slateink-950/60 rounded-lg p-3">
                                          <p className="text-xs text-slate-500">Uploaded</p>
                                          <p className="text-sm font-medium text-slateink-900 dark:text-white">{format(new Date(event.data.created_at), 'MMM d, yyyy h:mm a')}</p>
                                        </div>
                                        {event.data.analysis?.interpretations && event.data.analysis.interpretations.length > 0 && (
                                          <div>
                                            <p className="text-xs text-slate-500 mb-2">Analysis Results</p>
                                            <div className="space-y-2">
                                              {event.data.analysis.interpretations.slice(0, 3).map((interp, i) => (
                                                <Badge key={i} variant={interp.status === 'normal' ? 'success' : interp.status === 'high' ? 'error' : 'warning'} dot>
                                                  {interp.test}: {interp.value} ({interp.status})
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {event.type === 'skin' && event.data && (
                                      <div className="bg-slate-50 dark:bg-slateink-950/60 rounded-lg p-3">
                                        <p className="text-xs text-slate-500">Model Available</p>
                                        <p className="text-sm font-medium text-slateink-900 dark:text-white">{event.data.is_model_available ? 'Yes' : 'No'}</p>
                                      </div>
                                    )}
                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toggleExpand(event.id); }}>
                                      Show Less
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-950/30 dark:to-teal-950/20 rounded-xl border border-primary-100 dark:border-slateink-800">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', eventColors[selectedEvent.type])}>
                {(() => {
                  const Icon = eventIcons[selectedEvent.type];
                  return Icon ? <Icon className="w-6 h-6" /> : null;
                })()}
              </div>
              <div>
                <p className="font-medium text-slateink-900 dark:text-white">{selectedEvent.title}</p>
                <p className="text-sm text-slate-500">{eventLabels[selectedEvent.type]}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(selectedEvent.date), 'PPpp')}</p>
              </div>
            </div>

            {selectedEvent.type === 'prediction' && selectedEvent.data && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slateink-900 dark:text-white mb-2">Symptoms Analyzed</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.data.symptoms?.map(s => (
                      <Badge key={s} variant="primary">{s.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </div>
                {selectedEvent.data.top_predictions && selectedEvent.data.top_predictions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slateink-900 dark:text-white mb-2">All Predictions</h4>
                    <div className="space-y-3">
                      {selectedEvent.data.top_predictions.map((p, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slateink-950/60 rounded-lg p-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={cn('text-slateink-900 dark:text-white', i === 0 && 'font-semibold')}>{p.disease}</span>
                            <span className="font-medium text-slateink-900 dark:text-white">{(p.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slateink-800 rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary-500" style={{ width: `${p.confidence * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedEvent.type === 'report' && selectedEvent.data && (
              <div className="space-y-4">
                {selectedEvent.data.analysis?.interpretations && selectedEvent.data.analysis.interpretations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slateink-900 dark:text-white mb-2">Lab Results</h4>
                    <div className="space-y-2">
                      {selectedEvent.data.analysis.interpretations.map((interp, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slateink-950/60 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={interp.status === 'normal' ? 'success' : interp.status === 'high' ? 'error' : 'warning'} dot>
                              {interp.status}
                            </Badge>
                            <div>
                              <p className="font-medium capitalize text-slateink-900 dark:text-white">{interp.test.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-slate-500">{interp.message}</p>
                            </div>
                          </div>
                          <span className="font-medium text-slateink-900 dark:text-white">{interp.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvent.data.analysis?.recommendation && (
                  <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                    <h4 className="font-medium text-primary-700 dark:text-primary-300 mb-1">Recommendation</h4>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{selectedEvent.data.analysis.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}