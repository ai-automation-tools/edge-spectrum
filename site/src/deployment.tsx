import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { REPOSITORY_URL } from './projectLinks';

interface Deployment {
  mode: 'demo' | 'full';
  configured: boolean;
  authed: boolean;
}

const DeploymentContext = createContext<{ deployment: Deployment | null; error: boolean; updateAuth: (authed: boolean) => void }>({
  deployment: null, error: false, updateAuth: () => {},
});

export function DeploymentProvider({ children }: { children: React.ReactNode }) {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/advisor-auth', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Deployment status unavailable');
        const data = await response.json();
        if (data.mode !== 'demo' && data.mode !== 'full') throw new Error('Invalid deployment mode');
        setDeployment(data);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  const updateAuth = (authed: boolean) => setDeployment(current => current ? { ...current, authed } : current);
  return <DeploymentContext.Provider value={{ deployment, error, updateAuth }}>{children}</DeploymentContext.Provider>;
}

export const useDeployment = () => useContext(DeploymentContext);

export function SourceBar() {
  const { deployment } = useDeployment();
  return (
    <div className="src-bar">
      {deployment?.mode === 'demo' ? (
        <p className="src-note">
          <strong>Public demo</strong> · Interactive tools, sample AI advice.{' '}
          <Link to="/setup" className="font-medium text-sky-300 hover:text-sky-100">Create your own site →</Link>
        </p>
      ) : (
        <p className="src-note"><strong>Open source</strong> · tools for pricing bets and assets honestly.</p>
      )}
      <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="src-link">
        {/* The GitHub octicon, inlined: lucide-react 1.0 dropped brand icons. */}
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
        View source
      </a>
    </div>
  );
}
