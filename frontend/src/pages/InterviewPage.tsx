import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { InterviewQuestion, InterviewEvaluation } from '../types';
import { 
  Mic, MicOff, Sparkles, ArrowRight, RotateCcw, 
  Award, CheckCircle2, AlertCircle, ChevronRight, Download, 
  Copy, Check, BrainCircuit, MessageSquare, Volume2, ShieldCheck, Compass
} from 'lucide-react';

const TARGET_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Python Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Full Stack Engineer',
  'Software Developer',
  'Cloud / DevOps Engineer',
  'Cybersecurity Analyst'
];

const DIFFICULTY_LEVELS = ['Junior', 'Mid-Level', 'Senior', 'Lead'];

interface AnswerRecord {
  question: InterviewQuestion;
  answer: string;
  evaluation: InterviewEvaluation;
}

export const InterviewPage: React.FC = () => {
  const { user } = useAuth();
  
  // Setup State
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Developer');
  const [difficulty, setDifficulty] = useState('Mid-Level');
  const [isStarting, setIsStarting] = useState(false);
  
  // Active Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(null);
  const [sessionRecords, setSessionRecords] = useState<AnswerRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCurrentAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleStartSession = async () => {
    setIsStarting(true);
    setError('');
    try {
      const res = await api.getInterviewQuestions({
        target_role: targetRole,
        difficulty: difficulty
      });
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setCurrentIndex(0);
        setCurrentAnswer('');
        setCurrentEvaluation(null);
        setSessionRecords([]);
        setSessionActive(true);
        setSessionCompleted(false);
      } else {
        setError('Failed to generate interview questions. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to interview AI service.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before submitting for evaluation.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsEvaluating(true);
    setError('');
    try {
      const activeQ = questions[currentIndex];
      const evaluation = await api.evaluateInterviewAnswer({
        question: activeQ.question,
        category: activeQ.category,
        candidate_answer: currentAnswer,
        target_role: targetRole,
        difficulty: difficulty
      });

      setCurrentEvaluation(evaluation);
      setSessionRecords(prev => [
        ...prev,
        {
          question: activeQ,
          answer: currentAnswer,
          evaluation
        }
      ]);
    } catch (err: any) {
      setError(err.message || 'Error evaluating interview response.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer('');
      setCurrentEvaluation(null);
      setError('');
    } else {
      setSessionCompleted(true);
      setSessionActive(false);
    }
  };

  const handleRestart = () => {
    setSessionActive(false);
    setSessionCompleted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setCurrentEvaluation(null);
    setSessionRecords([]);
    setError('');
  };

  // Calculate session summary metrics
  const avgOverallScore = sessionRecords.length > 0
    ? Math.round(sessionRecords.reduce((acc, r) => acc + r.evaluation.overall_score, 0) / sessionRecords.length)
    : 0;

  const avgStarScore = sessionRecords.length > 0
    ? Math.round(sessionRecords.reduce((acc, r) => acc + r.evaluation.star_score, 0) / sessionRecords.length)
    : 0;

  const avgTechScore = sessionRecords.length > 0
    ? Math.round(sessionRecords.reduce((acc, r) => acc + r.evaluation.technical_depth, 0) / sessionRecords.length)
    : 0;

  const getVerdict = (score: number) => {
    if (score >= 85) return { label: 'Strong Hire Ready', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 70) return { label: 'Competitive Candidate', color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30' };
    if (score >= 55) return { label: 'Moderate Fit – Needs Polish', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Requires Active Practice', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const copyDebrief = () => {
    const text = sessionRecords.map((r, i) => (
      `Q${i + 1} (${r.question.category}): ${r.question.question}\n` +
      `Your Answer: ${r.answer}\n` +
      `Score: ${r.evaluation.overall_score}/100 (STAR: ${r.evaluation.star_score}/100)\n` +
      `Feedback: ${r.evaluation.feedback_summary}\n\n`
    )).join('');

    const fullSummary = `meRESUmax Mock Interview Debrief\nRole: ${targetRole} (${difficulty})\nAverage Score: ${avgOverallScore}/100\nVerdict: ${getVerdict(avgOverallScore).label}\n\n${text}`;
    navigator.clipboard.writeText(fullSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadTranscript = () => {
    const text = sessionRecords.map((r, i) => (
      `============================================================\n` +
      `QUESTION ${i + 1} [${r.question.category.toUpperCase()}]\n` +
      `============================================================\n` +
      `${r.question.question}\n\n` +
      `CANDIDATE RESPONSE:\n${r.answer}\n\n` +
      `EVALUATION BREAKDOWN:\n` +
      `- Overall Score: ${r.evaluation.overall_score}/100\n` +
      `- STAR Methodology: ${r.evaluation.star_score}/100\n` +
      `- Technical Depth: ${r.evaluation.technical_depth}/100\n` +
      `- Clarity & Communication: ${r.evaluation.clarity_score}/100\n\n` +
      `KEY STRENGTHS:\n${r.evaluation.strengths.map(s => `• ${s}`).join('\n')}\n\n` +
      `AREAS FOR IMPROVEMENT:\n${r.evaluation.areas_for_improvement.map(a => `• ${a}`).join('\n')}\n\n` +
      `EXEMPLAR STAR MODEL RESPONSE:\n${r.evaluation.suggested_exemplar_answer}\n\n`
    )).join('\n');

    const fullDoc = `meRESUmax AI Mock Interview Debrief Transcript\nTarget Role: ${targetRole}\nDifficulty: ${difficulty}\nOverall Readiness Index: ${avgOverallScore}/100\nDate: ${new Date().toLocaleDateString()}\n\n${text}`;

    const blob = new Blob([fullDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meRESUmax_Interview_${targetRole.replace(/\s+/g, '_')}_Debrief.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-medium">
          <BrainCircuit size={14} className="animate-pulse" />
          <span>Google Gemini Interactive Interview Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          AI Technical & Behavioral <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-purple-400 bg-clip-text text-transparent">Mock Interview</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto">
          Practice role-tailored technical, architecture, and STAR questions. Receive immediate recruiter-grade scoring, depth metrics, and model answers.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SETUP VIEW */}
      {!sessionActive && !sessionCompleted && (
        <GlassCard className="p-6 sm:p-8 space-y-6 max-w-2xl mx-auto border-white/10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass size={20} className="text-brand-cyan" />
              <span>Configure Your Interview Simulation</span>
            </h2>
            <p className="text-text-muted text-xs sm:text-sm">
              Select your targeted career archetype and experience caliber. Gemini will synthesize a rigorous 5-question interview loop.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-surface-elevated/80 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-cyan/50 transition-colors"
              >
                {TARGET_ROLES.map(role => (
                  <option key={role} value={role} className="bg-surface-elevated text-white">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Difficulty Caliber
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTY_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      difficulty === level
                        ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-glow-sm'
                        : 'bg-white/5 border-white/10 text-text-secondary hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-white/5 space-y-2 text-xs text-text-muted">
            <div className="flex items-center gap-2 text-brand-cyan font-medium">
              <Sparkles size={14} />
              <span>What to Expect in This Loop:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>2 Technical & Framework In-Depth Questions</li>
              <li>1 System Architecture or Scalability Challenge</li>
              <li>1 Behavioral Scenario Evaluated with STAR Metrics</li>
              <li>1 Production Debugging or Trade-off Dilemma</li>
            </ul>
          </div>

          <GlassButton
            onClick={handleStartSession}
            disabled={isStarting}
            className="w-full justify-center py-3 text-sm font-semibold shadow-glow-sm"
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="animate-spin" size={16} />
                Synthesizing Custom Interview Loop...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Begin Mock Interview
                <ArrowRight size={16} />
              </span>
            )}
          </GlassButton>
        </GlassCard>
      )}

      {/* 2. ACTIVE INTERVIEW VIEW */}
      {sessionActive && questions.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Progress Bar & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-wider text-brand-cyan font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{targetRole}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-muted font-normal">
                  {difficulty}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
                {questions[currentIndex].category}
              </span>
              <button
                onClick={handleRestart}
                className="text-xs text-text-muted hover:text-white px-3 py-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Exit
              </button>
            </div>
          </div>

          {/* Question Card */}
          <GlassCard className="p-6 sm:p-8 space-y-4 border-brand-cyan/20 bg-gradient-to-br from-brand-card/90 to-surface-elevated/70">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shrink-0 font-bold text-lg">
                {currentIndex + 1}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
                  {questions[currentIndex].question}
                </h3>
                {questions[currentIndex].tips && (
                  <div className="text-xs text-text-muted bg-white/5 p-3 rounded-xl border border-white/5 flex items-start gap-2">
                    <Volume2 size={15} className="text-brand-cyan shrink-0 mt-0.5" />
                    <span><strong className="text-text-secondary">Interviewer Context:</strong> {questions[currentIndex].tips}</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Answer Input or Feedback */}
          {!currentEvaluation ? (
            <GlassCard className="p-6 space-y-4 border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <MessageSquare size={14} className="text-brand-cyan" />
                  Your Answer
                </label>
                <div className="flex items-center gap-2">
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                        isListening
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                          : 'bg-white/5 border-white/10 text-text-secondary hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={14} className="text-rose-400" />
                          <span>Listening... (Click to stop)</span>
                        </>
                      ) : (
                        <>
                          <Mic size={14} />
                          <span>Voice Dictate</span>
                        </>
                      )}
                    </button>
                  )}
                  <span className="text-xs text-text-muted">
                    {currentAnswer.trim() ? `${currentAnswer.trim().split(/\s+/).length} words` : '0 words'}
                  </span>
                </div>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Structure your answer with clear context, specific actions taken, technical tooling used, and measurable results achieved (STAR method)..."
                rows={7}
                className="w-full bg-surface-elevated/70 border border-white/10 rounded-2xl p-4 text-white placeholder-text-muted/60 text-sm focus:outline-none focus:border-brand-cyan/50 transition-colors resize-y leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-muted hidden sm:inline">
                  Tip: Quantify metrics (e.g., latency, % improved, team size) for higher STAR scores.
                </span>
                <GlassButton
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !currentAnswer.trim()}
                  className="w-full sm:w-auto ml-auto px-6 py-2.5 text-xs sm:text-sm font-semibold"
                >
                  {isEvaluating ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="animate-spin" size={16} />
                      AI Evaluating Response...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit for Evaluation
                      <ArrowRight size={15} />
                    </span>
                  )}
                </GlassButton>
              </div>
            </GlassCard>
          ) : (
            /* EVALUATION CARD FOR CURRENT QUESTION */
            <div className="space-y-6 animate-fadeIn">
              <GlassCard className="p-6 sm:p-8 space-y-6 border-brand-cyan/30 bg-surface-elevated/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-brand-cyan font-bold">
                      Response Evaluation
                    </span>
                    <h4 className="text-lg font-bold text-white mt-1">
                      {currentEvaluation.feedback_summary}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10 min-w-[90px]">
                      <div className="text-2xl font-black text-brand-cyan">
                        {currentEvaluation.overall_score}
                      </div>
                      <div className="text-[10px] uppercase text-text-muted tracking-wider">
                        Overall
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric Dials / Badges */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-lg font-bold text-purple-300">
                      {currentEvaluation.star_score}/100
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">STAR Structure</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {currentEvaluation.technical_depth}/100
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">Technical Depth</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {currentEvaluation.clarity_score}/100
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">Clarity</div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      Key Strengths
                    </h5>
                    <ul className="space-y-1.5">
                      {currentEvaluation.strengths.map((s, idx) => (
                        <li key={idx} className="text-xs text-text-secondary bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Actionable Improvements
                    </h5>
                    <ul className="space-y-1.5">
                      {currentEvaluation.areas_for_improvement.map((a, idx) => (
                        <li key={idx} className="text-xs text-text-secondary bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Model Answer Disclosure */}
                <div className="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Senior Exemplar STAR Answer</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    "{currentEvaluation.suggested_exemplar_answer}"
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <GlassButton
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 text-xs sm:text-sm font-semibold"
                  >
                    <span>
                      {currentIndex + 1 < questions.length ? 'Next Interview Question' : 'Complete Interview & View Scorecard'}
                    </span>
                    <ChevronRight size={15} />
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {/* 3. FINAL SESSION SCORECARD */}
      {sessionCompleted && (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
          <GlassCard className="p-8 text-center space-y-6 border-brand-cyan/30 bg-gradient-to-b from-brand-card/90 via-surface-elevated/80 to-surface-card/90">
            <div className="w-16 h-16 rounded-3xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mx-auto">
              <Award size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
                Simulation Debrief Report
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Interview Performance Scorecard
              </h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                {targetRole} • {difficulty} Loop • {sessionRecords.length} Questions Completed
              </p>
            </div>

            {/* Scorecard Hero Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl font-black text-brand-cyan">
                  {avgOverallScore}
                </div>
                <div className="text-xs uppercase text-text-muted mt-1 font-semibold">
                  Readiness Index
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl font-black text-purple-400">
                  {avgStarScore}
                </div>
                <div className="text-xs uppercase text-text-muted mt-1 font-semibold">
                  STAR Technique
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-4xl font-black text-blue-400">
                  {avgTechScore}
                </div>
                <div className="text-xs uppercase text-text-muted mt-1 font-semibold">
                  Technical Depth
                </div>
              </div>
            </div>

            {/* Verdict Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold mx-auto">
              <ShieldCheck size={18} className="text-brand-cyan" />
              <span>Hiring Panel Assessment: </span>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${getVerdict(avgOverallScore).color}`}>
                {getVerdict(avgOverallScore).label}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={copyDebrief}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={downloadTranscript}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Download size={14} />
                <span>Download Transcript (.txt)</span>
              </button>

              <GlassButton
                onClick={handleRestart}
                className="px-5 py-2 text-xs font-semibold"
              >
                <RotateCcw size={14} />
                <span>Start New Mock Loop</span>
              </GlassButton>
            </div>
          </GlassCard>

          {/* Question-by-Question Detailed Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Question-by-Question Breakdown</h3>
            <div className="space-y-4">
              {sessionRecords.map((r, i) => (
                <GlassCard key={i} className="p-6 space-y-4 border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                        {r.question.category}
                      </span>
                      <h4 className="text-base font-semibold text-white mt-1">
                        Q{i + 1}: {r.question.question}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-brand-cyan">
                        {r.evaluation.overall_score}/100
                      </div>
                      <div className="text-[10px] text-text-muted">Score</div>
                    </div>
                  </div>

                  <div className="bg-surface-elevated/60 p-3 rounded-xl border border-white/5 text-xs text-text-muted leading-relaxed">
                    <strong className="text-text-secondary">Your Response: </strong>
                    {r.answer}
                  </div>

                  <div className="text-xs text-text-secondary flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-cyan shrink-0" />
                    <span>{r.evaluation.feedback_summary}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
