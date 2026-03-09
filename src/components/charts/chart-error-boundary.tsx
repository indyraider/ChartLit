'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  chartType?: string;
}

interface State {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-bg-inset">
            <div className="text-center">
              <p className="text-xs text-text-muted">Failed to render</p>
              {this.props.chartType && (
                <p className="mt-1 text-[10px] text-text-dim">
                  {this.props.chartType}
                </p>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
