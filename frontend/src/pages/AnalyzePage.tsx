import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  FileUp, FileText, CheckCircle2, AlertCircle, X, 
  Sparkles, ArrowRight, Loader2, Target, AlignLeft, ShieldCheck, RotateCcw
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
      setError('File size exceeds the 16 MB limit. Please select a smaller document.');
      return;
    }
    if (file.size === 0) {
      setError('The selected file is empty (0 bytes). Please select a valid document.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (isProcessing) return; // Prevent duplicate concurrent requests
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
      setProcessingStage('Uploading secure document...');
      const uploadRes = await api.uploadResume(selectedFile);
      
      if (!uploadRes?.resume?.id) {
        throw new Error('Upload succeeded but resume record could not be established.');
      }
      const resumeId = uploadRes.resume.id;

      setProcessingStage('Extracting resume content & technical skills...');
      setProcessingStage(`Calculating quality score & matching ${effectiveRole} skills...`);
      
      const analysisRes = await api.createAnalysis({
        resume_id: resumeId,
        target_role: effectiveRole,
        job_description: jobDescription
      });

      setProcessingStage('Preparing recommendations & final audit report...');

      if (!analysisRes?.analysis?.id) {
        throw new Error('Analysis completed but did not return a valid audit record.');
      }

      // Navigate directly to the verified results page
      navigate(`/results/${analysisRes.analysis.id}`);
    } catch (err: any) {
      console.error('Resume audit error:', err);
      setError(err.message || 'Analysis could not be completed. Please check your document and try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10">
      <div className="max-w-xl mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-xs font-mono text-text-secondary mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>ATS AUDIT ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Analyze Your Resume
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Upload your resume in PDF or DOCX format for transparent heuristic scoring, skill gap identification, and STAR rewrites.
        </p>
      </div>

      <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/[0.12] shadow-elevated">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span className="leading-relaxed font-sans">{error}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={!selectedFile || isProcessing}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {isProcessing ? (
          /* Processing State Visualizer */
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white animate-spin" />
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-semibold text-white tracking-tight">Running Document Audit</h3>
              <p className="text-xs text-blue-400 font-mono">{processingStage}</p>
              <p className="text-[11px] text-text-muted mt-2">
                Running heuristic parser, role taxonomy benchmark, and intelligence feedback.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">
                01 // UPLOAD DOCUMENT (PDF OR DOCX)
              </label>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-white/15 bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/25'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    disabled={isProcessing}
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />
                  <div className="w-10 h-10 rounded-lg bg-[#161922] text-zinc-300 flex items-center justify-center mx-auto mb-3 border border-white/10">
                    <FileUp size={18} />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    Click to browse or drag and drop your file here
                  </div>
                  <div className="text-xs text-text-muted font-mono">
                    Supports PDF and DOCX files up to 16 MB.
                  </div>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="p-4 rounded-xl bg-[#161922] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0D0F14] text-zinc-200 flex items-center justify-center font-bold text-xs uppercase font-mono border border-white/10">
                      {selectedFile.name.split('.').pop()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-text-muted font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for audit
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => !isProcessing && setSelectedFile(null)}
                    disabled={isProcessing}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Target Role Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target size={13} className="text-zinc-400" />
                  <span>02 // TARGET ROLE ARCHETYPE</span>
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2.5 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role} className="bg-[#111318]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {targetRole === 'Custom Role' && (
                <div>
                  <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">
                    CUSTOM ROLE TITLE
                  </label>
                  <input
                    type="text"
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    disabled={isProcessing}
                    placeholder="e.g. Solutions Architect"
                    className="w-full px-3.5 py-2.5 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Optional Custom Job Description */}
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlignLeft size={13} className="text-zinc-400" />
                  <span>03 // JOB DESCRIPTION (OPTIONAL)</span>
                </span>
                <span className="text-[10px] text-text-muted">For tailored match scoring</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isProcessing}
                placeholder="Paste the target job description or core responsibilities here to evaluate precise skill overlap..."
                rows={4}
                className="w-full p-3 bg-[#0D0F14] border border-white/10 rounded-lg text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all disabled:opacity-50"
              />
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <GlassButton
                onClick={handleStartAnalysis}
                variant="primary"
                size="lg"
                disabled={!selectedFile || isProcessing}
                isLoading={isProcessing}
                className="w-full"
                icon={<ArrowRight size={16} />}
              >
                Run Resume Intelligence Audit
              </GlassButton>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-1 font-mono">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Isolated candidate environment. Zero retention leakage.</span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
