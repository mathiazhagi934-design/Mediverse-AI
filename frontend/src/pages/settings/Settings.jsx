import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { Sun, Moon, Monitor, Bell, Shield, User, Trash2, Download, LogOut, Palette, Lock, Database, Heart, Settings as SettingsIcon, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Switch } from '../../components/ui/Switch';
import { useReducedMotion } from '../../utils/animations';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const sections = [
  { id: 'appearance', icon: Palette, label: 'Appearance', description: 'Customize how MediVerse looks' },
  { id: 'notifications', icon: MessageSquare, label: 'Notifications', description: 'Manage notification preferences' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Data', description: 'Control your data and privacy' },
  { id: 'account', icon: User, label: 'Account', description: 'Manage your account settings' },
];

export default function Settings() {
  const { theme, setThemeMode } = useTheme();
  const { notify, types } = useNotifications();
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('appearance');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [healthReminders, setHealthReminders] = useState(true);
  const [predictionAlerts, setPredictionAlerts] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const stored = localStorage.getItem('settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setNotificationsEnabled(settings.notificationsEnabled ?? true);
        setEmailNotifications(settings.emailNotifications ?? false);
        setPushNotifications(settings.pushNotifications ?? true);
        setHealthReminders(settings.healthReminders ?? true);
        setPredictionAlerts(settings.predictionAlerts ?? true);
        setReportAlerts(settings.reportAlerts ?? true);
        setAnimationsEnabled(settings.animationsEnabled ?? true);
        setCompactMode(settings.compactMode ?? false);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const settings = {
      notificationsEnabled,
      emailNotifications,
      pushNotifications,
      healthReminders,
      predictionAlerts,
      reportAlerts,
      animationsEnabled,
      compactMode,
    };
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [notificationsEnabled, emailNotifications, pushNotifications, healthReminders, predictionAlerts, reportAlerts, animationsEnabled, compactMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--animations-enabled', animationsEnabled ? '1' : '0');
  }, [animationsEnabled]);

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await api.patch('/accounts/preferences/', {
        notifications_enabled: notificationsEnabled,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        health_reminders: healthReminders,
        prediction_alerts: predictionAlerts,
        report_alerts: reportAlerts,
        animations_enabled: animationsEnabled,
        compact_mode: compactMode,
        theme_preference: theme,
      });
      toast.success('Preferences saved');
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/accounts/export-data/');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mediverse-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify(types.INFO, 'Data Exported', 'Your data has been downloaded');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      await api.delete('/accounts/delete/');
      logout();
      navigate('/login');
      toast.success('Account deleted');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toolbar: tabs + save */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <div className="card !p-1.5 flex-1 overflow-x-auto">
          <nav className="flex min-w-max gap-1" aria-label="Settings sections">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                    active
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'text-slate-500 hover:text-slateink-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slateink-950'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
        <Button onClick={handleSavePreferences} loading={loading} rightIcon={!loading ? <SettingsIcon className="w-4 h-4" /> : undefined} className="shrink-0">
          {loading ? 'Saving…' : 'Save All'}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><Palette className="w-5 h-5 text-primary-500" /> Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'light', icon: Sun, label: 'Light', desc: 'Always light mode', preview: 'from-slate-50 to-white' },
                      { value: 'dark', icon: Moon, label: 'Dark', desc: 'Always dark mode', preview: 'from-slateink-900 to-slateink-950' },
                      { value: 'system', icon: Monitor, label: 'System', desc: 'Match system setting', preview: 'from-slate-50 to-slateink-900' },
                    ].map((t, i) => (
                      <motion.button
                        key={t.value}
                        onClick={() => setThemeMode(t.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden',
                          theme === t.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slateink-950 hover:border-slate-300 dark:hover:border-slate-800'
                        )}
                      >
                        <div className={cn('h-12 rounded-lg bg-gradient-to-br mb-3 border border-white/40', t.preview)} />
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            theme === t.value ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slateink-950 text-slate-500'
                          )}>
                            <t.icon className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="font-medium text-slateink-900 dark:text-white text-sm">{t.label}</p>
                            <p className="text-xs text-slate-400">{t.desc}</p>
                          </div>
                        </div>
                        {theme === t.value && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 text-primary-600 dark:text-primary-400 text-xs font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Active
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><SettingsIcon className="w-5 h-5 text-primary-500" /> Interface</CardTitle>
                  <CardDescription>Adjust interface preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Reduced Motion</p>
                      <p className="text-sm text-slate-500">Disable animations for accessibility</p>
                    </div>
                    <Switch
                      checked={reducedMotion || !animationsEnabled}
                      onChange={(checked) => setAnimationsEnabled(!checked)}
                      disabled={reducedMotion}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Compact Mode</p>
                      <p className="text-sm text-slate-500">Reduce spacing for more content</p>
                    </div>
                    <Switch checked={compactMode} onChange={setCompactMode} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><Bell className="w-5 h-5 text-primary-500" /> General</CardTitle>
                  <CardDescription>Master notification controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Enable Notifications</p>
                      <p className="text-sm text-slate-500">Receive in-app notifications</p>
                    </div>
                    <Switch checked={notificationsEnabled} onChange={setNotificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-slate-500">Browser push notifications</p>
                    </div>
                    <Switch checked={pushNotifications} onChange={setPushNotifications} disabled={!notificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-slate-500">Receive email updates</p>
                    </div>
                    <Switch checked={emailNotifications} onChange={setEmailNotifications} disabled={!notificationsEnabled} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><Heart className="w-5 h-5 text-primary-500" /> Health Alerts</CardTitle>
                  <CardDescription>Health-related notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Health Reminders</p>
                      <p className="text-sm text-slate-500">Daily wellness reminders</p>
                    </div>
                    <Switch checked={healthReminders} onChange={setHealthReminders} disabled={!notificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Prediction Alerts</p>
                      <p className="text-sm text-slate-500">High confidence predictions</p>
                    </div>
                    <Switch checked={predictionAlerts} onChange={setPredictionAlerts} disabled={!notificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Report Alerts</p>
                      <p className="text-sm text-slate-500">Report processing complete</p>
                    </div>
                    <Switch checked={reportAlerts} onChange={setReportAlerts} disabled={!notificationsEnabled} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center py-4">
                  <Button variant="outline" onClick={() => notify(types.INFO, 'Test Notification', 'This is a test notification')}>
                    Send Test Notification
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><Database className="w-5 h-5 text-primary-500" /> Your Data</CardTitle>
                  <CardDescription>Manage your personal data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportData}>
                    Export My Data
                  </Button>
                  <p className="text-sm text-slate-500">
                    Download a copy of all your data including predictions, reports, and profile information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><Lock className="w-5 h-5 text-primary-500" /> Data Retention</CardTitle>
                  <CardDescription>How long we keep your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="rounded-lg bg-slate-50 dark:bg-slateink-900/60 border border-slate-100 dark:border-slateink-950 p-4">
                    <p className="font-medium text-slateink-900 dark:text-white mb-2">Data Retention Policy</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Prediction history: Kept indefinitely unless deleted</li>
                      <li>Medical reports: Kept until manually deleted</li>
                      <li>Skin analysis images: Kept until manually deleted</li>
                      <li>Profile data: Kept while account is active</li>
                      <li>Chat history: Not persisted (session only)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card variant="outlined" className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 className="w-5 h-5" /> Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="w-full">
                    Delete Account
                  </Button>
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Permanently delete your account and all data. This cannot be undone.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><User className="w-5 h-5 text-primary-500" /> Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar name={user?.username} size="xl" />
                    <div>
                      <p className="text-lg font-semibold text-slateink-900 dark:text-white">{user?.username}</p>
                      <p className="text-slate-500">{user?.email}</p>
                      <p className="text-xs text-slate-400 mt-1">Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => navigate('/app/profile')}>
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slateink-900 dark:text-white"><Shield className="w-5 h-5 text-primary-500" /> Security</CardTitle>
                  <CardDescription>Account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slateink-900/60 border border-slate-100 dark:border-slateink-950">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Password</p>
                      <p className="text-sm text-slate-500">Last changed: Recently</p>
                    </div>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slateink-900/60 border border-slate-100 dark:border-slateink-950">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <Badge variant="outline">Not Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slateink-900/60 border border-slate-100 dark:border-slateink-950">
                    <div>
                      <p className="font-medium text-slateink-900 dark:text-white">Active Sessions</p>
                      <p className="text-sm text-slate-500">1 active session</p>
                    </div>
                    <Button variant="outline" size="sm">View Sessions</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="text-center py-4">
                  <Button variant="danger" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
        title="Delete Account"
        description="This action is irreversible. All your data will be permanently deleted."
        size="sm"
      >
        <div className="space-y-4">
          <Alert variant="error" title="Warning" className="text-sm">
            This will permanently delete your account, all predictions, reports, skin analyses, and profile data. This cannot be undone.
          </Alert>
          <Input
            label="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}