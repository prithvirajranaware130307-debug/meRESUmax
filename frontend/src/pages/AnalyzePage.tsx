import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  FileUp, FileText, CheckCircle2, AlertCircle, X, 
  Sparkles, ArrowRight, Loader2, Target, AlignLeft, ShieldCheck
} from 'lucide-react';

const TARGET_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Python Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'Data Scientist',
  'Web Developer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'UI/UX Designer',
  'Custom Role'
];

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [customRoleText, setCustomRoleText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Please select a valid .pdf or .docx document.');
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      setError('File size exceeds the 16 MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select or drop a resume file first.');
      return;
    }

    const effectiveRole = targetRole === 'Custom Role' && customRoleText.trim() 
      ? customRoleText.trim() 
      : targetRole;

    setIsProcessing(true);
    setError('');

    try {
      setProcessingStage('1/4: Ingesting document and verifying file integrity...');
      const uploadRes = await api.uploadResume(selectedFile);
      const resumeId = uploadRes.resume.id;

      setProcessingStage('2/4: Extracting sections and cross-referencing technical skills taxonomy...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage(`3/4: Calculating transparent heuristic quality scores against ${effectiveRole}...`);
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage('4/4: Generating AI career intelligence and personalized roadmap...');
      const analysisRes = await api.createAnalysis({
        resume_id: resumeId,
        target_role: effectiveRole,
        job_description: jobDescription
      });

      // Navigate directly to the results page
      navigate(`/results/${analysisRes.analysis.id}`);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check the document and try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold uppercase tracking-wider text-brand-cyan mb-3">
          <Sparkles size={13} />
          <span>Intelligent Resume Audit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Analyze Your Resume
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Upload your resume in PDF or DOCX format to receive transparent heuristic quality scores, skill gap intelligence, and role fit matching.
        </p>
      </div>

      <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20 shadow-glass-lg">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isProcessing ? (
          /* Processing State Visualizer */
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-brand-blue animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Analyzing Document Potential</h3>
              <p className="text-xs text-brand-cyan font-mono">{processingStage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                1. Upload Resume Document (PDF or DOCX)
              </label>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-brand-cyan bg-brand-cyan/10 shadow-glow-cyan'
                      : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/25'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/20 text-brand-cyan flex items-center justify-center mx-auto mb-3 border border-brand-blue/30 shadow-glass-sm">
                    <FileUp size={22} />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    Click to browse or drag and drop your file here
                  </div>
                  <div className="text-xs text-text-muted">
                    Supports PDF and DOCX files up to 16 MB.
                  </div>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="p-4 rounded-xl bg-white/[0.05] border border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-xs uppercase border border-brand-cyan/30">
                      {selectedFile.name.split('.').pop()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Target Role Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target size={14} className="text-brand-blue" />
                  <span>2. Target Role Archetype</span>
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all cursor-pointer"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role} className="bg-[#0B1020]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {targetRole === 'Custom Role' && (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Specify Custom Title
                  </label>
                  <input
                    type="text"
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    placeholder="e.g. Solutions Architect"
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue"
                  />
                </div>
              )}
            </div>

            {/* Optional Custom Job Description */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlignLeft size={14} className="text-brand-cyan" />
                  <span>3. Paste Target Job Description (Optional)</span>
                </span>
                <span className="text-[11px] text-text-muted">For tailored match scoring</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description or key responsibilities here to calculate precise keyword alignment..."
                rows={4}
                className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <GlassButton
                onClick={handleStartAnalysis}
                variant="primary"
                size="lg"
                disabled={!selectedFile}
                className="w-full"
                icon={<Sparkles size={18} />}
              >
                Run Resume Intelligence Audit
              </GlassButton>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-1">
              <ShieldCheck size={14} className="text-brand-mint" />
              <span>Uploaded documents are processed in isolated private storage.</span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
