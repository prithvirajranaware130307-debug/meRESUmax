import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RoadmapTask } from '../types';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { 
  Compass, CheckCircle2, Circle, Plus, Trash2, 
  Sparkles, Layers, BookOpen, Laptop, HelpCircle
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.getRoadmap();
      setTasks(res.tasks);
    } catch (err) {
      console.error('Failed to load roadmap tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (task: RoadmapTask) => {
    const updatedStatus = !task.is_completed;
    // Optimistic UI update
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, is_completed: updatedStatus } : t)));
    try {
      await api.updateRoadmapTask(task.id, { is_completed: updatedStatus });
    } catch (err) {
      // Revert if error
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, is_completed: task.is_completed } : t)));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    await api.deleteRoadmapTask(taskId);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.addRoadmapTask({
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        category: 'skill'
      });
      setTasks([...tasks, res.task]);
      setNewTitle('');
      setNewDesc('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold uppercase tracking-wider text-brand-mint mb-2">
            <Compass size={13} />
            <span>Target Trajectory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Progressive learning milestones generated from your verified resume gaps.
          </p>
        </div>

        <GlassButton 
          onClick={() => setShowAddModal(!showAddModal)}
          variant="primary" 
          size="md" 
          icon={<Plus size={16} />}
        >
          Add Custom Goal
        </GlassButton>
      </div>

      {/* Progress Capsule */}
      <GlassCard variant="standard" className="p-5 mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-2">
          <span>Overall Milestone Completion: {completedCount} / {tasks.length} Completed</span>
          <span className="text-brand-mint text-sm font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-mint rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </GlassCard>

      {/* Add Modal */}
      {showAddModal && (
        <GlassCard variant="elevated" className="p-6 mb-8 border border-brand-cyan/30">
          <h3 className="text-sm font-bold text-white mb-3">Add Custom Career Milestone</h3>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Milestone title (e.g. Master Docker container networking)"
              className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Objective details, capstone requirements, or reference links..."
              rows={2}
              className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue"
            />
            <div className="flex items-center justify-between pt-1">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              >
                <option value="high" className="bg-[#0B1020]">High Priority</option>
                <option value="medium" className="bg-[#0B1020]">Medium Priority</option>
                <option value="low" className="bg-[#0B1020]">Low Priority</option>
              </select>

              <div className="flex items-center gap-2">
                <GlassButton type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary" size="sm">
                  Save Milestone
                </GlassButton>
              </div>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Timeline List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-mint/20 border-t-brand-mint animate-spin mx-auto mb-3" />
          <div className="text-xs text-text-secondary">Loading milestones...</div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-white/10">
          {tasks.map((task, index) => {
            const isDone = task.is_completed;
            const priorityColor = 
              task.priority === 'high' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
              task.priority === 'medium' ? 'text-brand-amber bg-amber-500/10 border-amber-500/20' :
              'text-brand-cyan bg-cyan-500/10 border-cyan-500/20';

            return (
              <div key={task.id} className="relative flex items-start gap-4 pl-12 group">
                {/* Node icon on timeline */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`absolute left-2.5 top-3 w-5 h-5 rounded-full flex items-center justify-center transition-all bg-[#070912] border ${
                    isDone ? 'border-brand-mint text-brand-mint shadow-glow-mint' : 'border-white/20 text-text-muted hover:border-white/50'
                  }`}
                  title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                >
                  {isDone ? <CheckCircle2 size={16} fill="currentColor" className="text-brand-mint bg-[#070912]" /> : <Circle size={10} />}
                </button>

                {/* Milestone Card */}
                <GlassCard 
                  variant="standard" 
                  className={`p-4 sm:p-5 flex-1 transition-all ${isDone ? 'opacity-70 bg-white/[0.02]' : 'hover:border-white/25'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityColor}`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">
                          Phase {index + 1}
                        </span>
                      </div>
                      <h3 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-text-muted' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      ) : (
        <GlassCard variant="standard" className="p-12 text-center text-text-secondary">
          <Compass size={28} className="mx-auto mb-2 text-text-muted" />
          <div className="text-sm font-semibold text-white">No roadmap tasks found</div>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Upload and analyze a resume to generate tailored learning milestones based on your skill gaps.
          </p>
        </GlassCard>
      )}
    </div>
  );
};
