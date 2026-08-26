import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { Sun, Moon, Monitor, Bell, Shield, User, Trash2, Download, LogOut, Palette, Lock, Database, Heart, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
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
  const { theme, resolvedTheme, setThemeMode } = useTheme();
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your preferences and account</p>
        </div>
        <Button onClick={handleSavePreferences} loading={loading} rightIcon={<SettingsIcon className="w-4 h-4" />}>
          Save All
        </Button>
      </motion.div>

      {/* Section Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card overflow-hidden"
      >
        <nav className="flex border-b border-gray-200 dark:border-gray-700" aria-label="Settings sections">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className={cn(
                'flex-1 flex flex-col items-center gap-2 py-4 px-3 text-left transition-colors',
                activeSection === section.id
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
              <span className="text-xs text-gray-400 hidden sm:block">{section.description}</span>
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Appearance Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', icon: Sun, label: 'Light', desc: 'Always light mode' },
                      { value: 'dark', icon: Moon, label: 'Dark', desc: 'Always dark mode' },
                      { value: 'system', icon: Monitor, label: 'System', desc: 'Match system setting' },
                    ].map((t) => (
                      <motion.button
                        key={t.value}
                        onClick={() => setThemeMode(t.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          theme === t.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                          style={{ backgroundColor: theme === t.value ? 'var(--primary-100)' : '#f3f4f6' }}>
                          <t.icon className="w-5 h-5" style={{ color: theme === t.value ? 'var(--primary-600)' : '#9ca3af' }} />
                        </div>
                        <p className="font-medium" style={{ color: theme === t.value ? 'var(--primary-700)' : 'inherit' }}>{t.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                        {theme === t.value && <div className="mt-2 text-primary-500 text-sm">✓ Active</div>}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> Interface</CardTitle>
                  <CardDescription>Adjust interface preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Reduced Motion</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Disable animations for accessibility</p>
                    </div>
                    <Switch
                      checked={reducedMotion || !animationsEnabled}
                      onChange={(checked) => setAnimationsEnabled(!checked)}
                      disabled={reducedMotion}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reduce spacing for more content</p>
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
                  <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> General</CardTitle>
                  <CardDescription>Master notification controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive in-app notifications</p>
                    </div>
                    <Switch checked={notificationsEnabled} onChange={setNotificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Browser push notifications</p>
                    </div>
                    <Switch checked={pushNotifications} onChange={setPushNotifications} disabled={!notificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
                    </div>
                    <Switch checked={emailNotifications} onChange={setEmailNotifications} disabled={!notificationsEnabled} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Health Alerts</CardTitle>
                  <CardDescription>Health-related notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Health Reminders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Daily wellness reminders</p>
                    </div>
                    <Switch checked={healthReminders} onChange={setHealthReminders} disabled={!notificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Prediction Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">High confidence predictions</p>
                    </div>
                    <Switch checked={predictionAlerts} onChange={setPredictionAlerts} disabled={!notificationsEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Report Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report processing complete</p>
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
                  <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Your Data</CardTitle>
                  <CardDescription>Manage your personal data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportData}>
                    Export My Data
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Download a copy of all your data including predictions, reports, and profile information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Data Retention</CardTitle>
                  <CardDescription>How long we keep your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Data Retention Policy</p>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
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
                  <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar name={user?.username} size="xl" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                      <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Member since {new Date(user?.date_joined).toLocaleDateString()}</p>
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
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security</CardTitle>
                  <CardDescription>Account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last changed: Recently</p>
                    </div>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                    <Badge variant="outline">Not Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Active Sessions</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">1 active session</p>
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