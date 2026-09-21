import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
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
    <div className="border-b border-zinc-800/60 bg-[#0a0a0b]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-2 text-xs">
        {deployment?.mode === 'demo' && (
          <p className="min-w-0 truncate text-zinc-500">
            <span className="font-semibold text-sky-300">Public demo</span> · Interactive tools, sample AI advice.{' '}
            <Link to="/setup" className="font-medium text-sky-300 hover:text-sky-100">Create your own site →</Link>
          </p>
        )}
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex flex-none items-center gap-1.5 font-medium text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <Github className="h-3.5 w-3.5" />
          View source
        </a>
      </div>
    </div>
  );
}
