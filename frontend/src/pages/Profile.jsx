import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { User, Save, Loader2, Ruler, Stethoscope, PhoneCall, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';

const defaultProfile = {
  full_name: '', age: '', gender: '', phone: '', height: '', weight: '',
  blood_group: '', allergies: '', existing_conditions: '', emergency_contact: '',
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function Profile() {
  const [form, setForm] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/accounts/profile/')
      .then(res => {
        const data = res.data;
        setForm({
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || '',
          phone: data.phone || '',
          height: data.height || '',
          weight: data.weight || '',
          blood_group: data.blood_group || '',
          allergies: data.allergies || '',
          existing_conditions: data.existing_conditions || '',
          emergency_contact: data.emergency_contact || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age) || null : null,
        height: form.height ? parseFloat(form.height) || null : null,
        weight: form.weight ? parseFloat(form.weight) || null : null,
      };
      await api.patch('/accounts/profile/', payload);
      toast.success('Profile updated');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.values(data).flat()[0];
        toast.error(typeof msg === 'string' ? msg : 'Update failed');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton w-40 h-5" />
            <div className="skeleton w-56 h-4" />
          </div>
        </div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}
      </div>
    );
  }

  const ProfileSection = ({ icon: Icon, title, sub, children, actions }) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="card !p-5 sm:!p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/15 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-slateink-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        </div>
        {actions}
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl2 overflow-hidden border border-slate-200 dark:border-slateink-700 bg-white dark:bg-slateink-900 shadow-soft"
      >
        <div className="h-20 bg-gradient-to-r from-primary-600 via-primary-700 to-teal-600 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,white,transparent_45%)]" />
        </div>
        <div className="px-5 sm:px-6 pb-5">
          <div className="flex items-end justify-between gap-4 -mt-8">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slateink-800 border-4 border-white dark:border-slateink-800 shadow-card flex items-center justify-center">
                <Avatar name={form.full_name || 'Patient'} size="lg" />
              </div>
              <div className="pb-1">
                <p className="text-xl font-bold text-slateink-900 dark:text-white">{form.full_name || 'Your Name'}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                  Patient Health Record
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} loading={saving} leftIcon={!saving ? <Save className="w-4 h-4" /> : undefined}>
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Personal */}
      <ProfileSection icon={User} title="Personal Information" sub="Basic identity and ethnicity details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.full_name} onChange={update('full_name')} placeholder="John Doe" />
          <Select label="Gender" value={form.gender} onChange={update('gender')} options={genders.map(g => ({ value: g, label: g }))} placeholder="Select gender" />
          <Input label="Phone" type="tel" leftIcon={<PhoneCall className="w-4 h-4" />} value={form.phone} onChange={update('phone')} placeholder="+1 234 567 890" />
          <Select label="Blood Group" value={form.blood_group} onChange={update('blood_group')} options={bloodGroups.map(bg => ({ value: bg, label: bg }))} placeholder="Select blood group" />
        </div>
      </ProfileSection>

      {/* Body metrics */}
      <ProfileSection icon={Ruler} title="Body Metrics" sub="Used to refine educational health insights">
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Age" type="number" min="1" max="120" value={form.age} onChange={update('age')} placeholder="30" />
          <Input label="Height (cm)" type="number" step="0.1" value={form.height} onChange={update('height')} placeholder="170" />
          <Input label="Weight (kg)" type="number" step="0.1" value={form.weight} onChange={update('weight')} placeholder="70" />
        </div>
      </ProfileSection>

      {/* Health context */}
      <ProfileSection icon={Stethoscope} title="Health Context" sub="Allergies and pre-existing conditions">
        <div className="space-y-4">
          <Textarea label="Known Allergies" rows={2} value={form.allergies} onChange={update('allergies')} placeholder="List any known allergies…" />
          <Textarea label="Existing Conditions" rows={2} value={form.existing_conditions} onChange={update('existing_conditions')} placeholder="List any existing medical conditions…" />
        </div>
      </ProfileSection>

      {/* Emergency */}
      <ProfileSection icon={PhoneCall} title="Emergency Contact" sub="For care coordination">
        <Input label="Contact (Name – Phone)" value={form.emergency_contact} onChange={update('emergency_contact')} placeholder="Jane Doe - +1 234 567 890" />
      </ProfileSection>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        Your health data is stored securely and is only used for generating insights within the application.
      </div>
    </div>
  );
}