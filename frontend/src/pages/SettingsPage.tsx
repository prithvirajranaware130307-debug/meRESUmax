import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  Settings, ShieldAlert, Cpu, Briefcase, Database, 
  Trash2, Lock, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [healthData, setHealthData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await api.getHealth();
        setHealthData(data);
      } catch (err) {
        console.error('Failed to query system health:', err);
      }
    }
    loadHealth();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Type "DELETE" to confirm permanent deletion of your account and all private resume records:'
    );
    if (confirmation === 'DELETE') {
      setIsDeleting(true);
      try {
        await api.deleteAccount();
        logout();
        navigate('/');
      } catch (err: any) {
        alert(err.message || 'Failed to delete account.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          <Settings size={13} />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Settings</h1>
        <p className="text-xs text-text-secondary mt-1">
          Inspect backend integrations, telemetry privacy, and manage your account credentials.
        </p>
      </div>

      <div className="space-y-6">
        {/* Backend & AI Integration Health */}
        <GlassCard variant="standard" className="p-6">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-brand-blue" />
            <span>Service Integration Status</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="text-xs font-semibold text-white flex items-center justify-between">
                <span>AI Intelligence Engine</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${healthData?.ai_service?.configured ? 'bg-mint-500/10 text-brand-mint' : 'bg-amber-500/10 text-brand-amber'}`}>
                  {healthData?.ai_service?.configured ? 'Live OpenAI' : 'Deterministic Heuristic'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Model: <span className="font-mono text-white">{healthData?.ai_service?.model || 'gpt-4o-mini'}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="text-xs font-semibold text-white flex items-center justify-between">
                <span>Job Recommendation Stream</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${healthData?.job_service?.configured ? 'bg-mint-500/10 text-brand-mint' : 'bg-amber-500/10 text-brand-amber'}`}>
                  {healthData?.job_service?.configured ? 'Live Adzuna' : 'Curated Demo Engine'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Region: <span className="font-mono text-white">{healthData?.job_service?.country?.toUpperCase() || 'IN'}</span>
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Privacy & Document Security */}
        <GlassCard variant="standard" className="p-6">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Lock size={16} className="text-brand-mint" />
            <span>Privacy & Storage Compliance</span>
          </h2>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-brand-mint" />
              <span>Resumes are stored with random UUID hashes in isolated private storage.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-brand-mint" />
              <span>Password hashes use modern cryptographic PBKDF2 / SHA-256 salts.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-brand-mint" />
              <span>Zero third-party advertisement trackers or tracking pixels enabled.</span>
            </li>
          </ul>
        </GlassCard>

        {/* Danger Zone: Account Deletion */}
        <GlassCard variant="standard" className="p-6 border border-rose-500/20 bg-rose-500/[0.02]">
          <h2 className="text-sm font-bold text-rose-300 mb-2 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Permanently delete your user account, uploaded resume documents, calculated analyses, roadmap milestones, and saved bookmarks. This action cannot be reversed.
          </p>
          <GlassButton
            onClick={handleDeleteAccount}
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            icon={<Trash2 size={14} />}
          >
            Permanently Delete Account
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  );
};
