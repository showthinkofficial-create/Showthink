import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  FileText, 
  UserCheck, 
  Sparkles,
  Gift
} from 'lucide-react';
import { schoolSettingsService, SchoolSettings, DEFAULT_SCHOOL_SETTINGS } from '../../services/schoolSettingsService';

interface SchoolSettingsManagerProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export default function SchoolSettingsManager({ currentPath, onNavigate }: SchoolSettingsManagerProps) {
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await schoolSettingsService.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setErrorMessage('Failed to load school settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SchoolSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOfferChange = (field: keyof SchoolSettings['admissionOffers'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      admissionOffers: {
        ...prev.admissionOffers,
        [field]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    // Validations
    if (!settings.name.trim()) {
      setErrorMessage('School Name cannot be empty.');
      setSaving(false);
      return;
    }
    if (!settings.phone.trim()) {
      setErrorMessage('Primary phone number cannot be empty.');
      setSaving(false);
      return;
    }
    if (!settings.address.trim()) {
      setErrorMessage('Address cannot be empty.');
      setSaving(false);
      return;
    }

    try {
      await schoolSettingsService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setErrorMessage(err.message || 'Unable to save settings. Please verify admin privileges.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 font-sans">
        <RefreshCw className="w-8 h-8 text-[#001c46] animate-spin" />
        <p className="text-sm font-bold text-gray-500">Loading School Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-[#001c46] text-[#FFC907] rounded-2xl shadow-xs shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#001c46] tracking-tight">
                School Information & Website Settings
              </h2>
              <span className="px-2.5 py-0.5 bg-blue-50 text-[#001c46] text-[10px] font-mono font-bold rounded-full uppercase border border-blue-200">
                Live Sync
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-xl">
              Configure centralized school information, address, operating hours, admissions offers, and institutional messages shown across the public website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset / Reload</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 rounded-r-2xl flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">
            School settings successfully updated in Firestore and synchronized across the public website.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-900 rounded-r-2xl flex items-center gap-3 animate-fadeIn shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs font-bold">{errorMessage}</div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Brand & Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sparkles className="w-4 h-4 text-[#FFC907]" />
            <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
              School Brand & Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                School Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="e.g. GP Academy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Institutional Tagline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="e.g. Knowledge Is the biggest money"
              />
            </div>
          </div>
        </div>

        {/* Contact Information & Hours */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-4 h-4 text-[#001c46]" />
            <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
              Location, Contact & Operating Hours
            </h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Complete School Campus Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="e.g. Bhangel, Goyal Colony, Salarpur Khadar, Noida, Uttar Pradesh — 201304"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#001c46]">
                  Primary Contact Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                    placeholder="9818776563"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#001c46]">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                    placeholder="admissions@gpacademy.edu.in"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#001c46]">
                  School Hours (Monday – Saturday)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.hoursWeekday}
                    onChange={(e) => handleChange('hoursWeekday', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                    placeholder="Monday–Saturday: 8:00 AM – 3:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#001c46]">
                  School Hours (Sunday)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={settings.hoursWeekend}
                    onChange={(e) => handleChange('hoursWeekend', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                    placeholder="Sunday: 9:00 AM – 2:00 PM"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admission Details & Offers */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Gift className="w-4 h-4 text-[#FFC907]" />
            <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
              Admission Policies & Special Benefits
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Admission Fee Policy Label
              </label>
              <input
                type="text"
                value={settings.admissionOffers.admission}
                onChange={(e) => handleOfferChange('admission', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="Admission Free"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Complimentary Kit Offer
              </label>
              <input
                type="text"
                value={settings.admissionOffers.extras}
                onChange={(e) => handleOfferChange('extras', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="Tie & Belt Free"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Admission Period Window
              </label>
              <input
                type="text"
                value={settings.admissionOffers.duration}
                onChange={(e) => handleOfferChange('duration', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="June to August"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Special Group Referral Benefit (3 Students)
              </label>
              <input
                type="text"
                value={settings.admissionOffers.referral}
                onChange={(e) => handleOfferChange('referral', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="If 3 students are admitted together during June to August: Fee Free for 3 months."
              />
            </div>
          </div>
        </div>

        {/* Institutional Content */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-4 h-4 text-[#001c46]" />
            <h3 className="text-sm font-black text-[#001c46] uppercase tracking-wider">
              Institutional Messages
            </h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                About School Description (Public Website)
              </label>
              <textarea
                rows={4}
                value={settings.aboutSchool}
                onChange={(e) => handleChange('aboutSchool', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="Describe GP Academy's mission, pedagogy, and community impact..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#001c46]">
                Principal's Message
              </label>
              <textarea
                rows={4}
                value={settings.principalMessage}
                onChange={(e) => handleChange('principalMessage', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#001c46] focus:border-transparent outline-none transition-all"
                placeholder="Message from the school principal to students and parents..."
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-lg flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Changes saved here update in Firestore and immediately reflect on the public website.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save School Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
