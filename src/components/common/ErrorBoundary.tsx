import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-slate-900 border border-red-500/40 text-center space-y-4 my-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'Something went wrong in this module'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your profile data is safe. You can reload this view or return to the main dashboard.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-300/80 bg-slate-950 p-2 rounded-lg mt-3 overflow-x-auto text-left font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
