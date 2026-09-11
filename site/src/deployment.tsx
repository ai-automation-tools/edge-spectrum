import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

export function DemoBanner() {
  const { deployment } = useDeployment();
  if (deployment?.mode !== 'demo') return null;
  return (
    <div className="border-b border-sky-500/20 bg-sky-500/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-3 text-xs sm:text-sm">
        <p className="text-zinc-400"><span className="font-semibold text-sky-300">Public demo</span> · Interactive tools, sample AI advice.</p>
        <Link to="/setup" className="font-semibold text-sky-300 hover:text-sky-100">Create your own site →</Link>
      </div>
    </div>
  );
}
