import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from '../glass/GlassCard';
import { GlassButton } from '../glass/GlassButton';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-36 pb-20 px-4 flex items-center justify-center relative z-20">
          <div className="w-full max-w-lg">
            <GlassCard variant="elevated" className="p-8 text-center border border-amber-500/30 shadow-glass-lg">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <AlertTriangle size={28} />
              </div>

              <h1 className="text-xl font-bold text-white mb-2">
                Interface Recovery Mode
              </h1>

              <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
                An unexpected view rendering issue occurred. Your uploaded data and progress are safe.
              </p>

              {this.state.error?.message && (
                <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-text-muted font-mono text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={this.handleReset}
                  icon={<RotateCcw size={16} />}
                  className="w-full sm:w-auto"
                >
                  Try Again
                </GlassButton>

                <a href="/dashboard" className="w-full sm:w-auto">
                  <GlassButton
                    variant="secondary"
                    size="md"
                    icon={<Home size={16} />}
                    className="w-full sm:w-auto"
                  >
                    Go to Dashboard
                  </GlassButton>
                </a>
              </div>
            </GlassCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
