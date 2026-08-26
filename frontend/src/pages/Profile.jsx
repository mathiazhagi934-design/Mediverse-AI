import { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
      const payload = { ...form };
      if (payload.age) payload.age = parseInt(payload.age) || null;
      if (payload.height) payload.height = parseFloat(payload.height) || null;
      if (payload.weight) payload.weight = parseFloat(payload.weight) || null;
      else payload.weight = null;
      if (payload.height && !payload.height) payload.height = null;

      // Clean up empty strings to null for numeric fields
      if (!payload.age) payload.age = null;
      if (!payload.height) payload.height = null;
      if (!payload.weight) payload.weight = null;

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
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your health profile</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold">{form.full_name || 'Your Name'}</p>
            <p className="text-sm text-gray-500">Complete your profile for better health insights</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="input-field" value={form.full_name} onChange={update('full_name')} placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" className="input-field" value={form.age} onChange={update('age')} placeholder="30" min="1" max="120" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="input-field" value={form.gender} onChange={update('gender')}>
              <option value="">Select</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" className="input-field" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input type="number" className="input-field" value={form.height} onChange={update('height')} placeholder="170" step="0.1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" className="input-field" value={form.weight} onChange={update('weight')} placeholder="70" step="0.1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select className="input-field" value={form.blood_group} onChange={update('blood_group')}>
              <option value="">Select</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input type="text" className="input-field" value={form.emergency_contact} onChange={update('emergency_contact')} placeholder="Name - Phone" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Known Allergies</label>
          <textarea className="input-field" rows={2} value={form.allergies} onChange={update('allergies')} placeholder="List any known allergies..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Existing Conditions</label>
          <textarea className="input-field" rows={2} value={form.existing_conditions} onChange={update('existing_conditions')} placeholder="List any existing medical conditions..." />
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your health data is stored securely and is only used for generating insights within the application.
      </p>
    </div>
  );
}
