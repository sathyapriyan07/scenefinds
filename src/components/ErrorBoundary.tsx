import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      
      try {
        const parsedError = JSON.parse(this.state.error?.message || '{}');
        if (parsedError.error) {
          errorMessage = `Firebase Error: ${parsedError.error}`;
        }
      } catch {
        // Not a JSON error
      }

      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black p-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">Oops! Something went wrong</h2>
          <p className="text-zinc-400 mb-8 max-w-md">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
            RELOAD PAGE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
