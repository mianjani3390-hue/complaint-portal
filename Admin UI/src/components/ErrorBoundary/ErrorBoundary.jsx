import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-red-50 p-6">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
            <h1 className="text-xl font-bold text-red-700">Something went wrong</h1>
            <p className="mt-3 text-sm text-slate-600">{this.state.error.message}</p>
            <button
              type="button"
              className="mt-6 rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
