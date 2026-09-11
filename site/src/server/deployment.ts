/** Only an explicit server-side opt-in enables metered AI calls. */
export function deploymentMode(): 'demo' | 'full' {
  return process.env.EDGE_SPECTRUM_MODE === 'full' ? 'full' : 'demo';
}

export function demoRestriction() {
  return {
    status: 403,
    body: {
      mode: 'demo',
      error: 'Live AI is disabled on this demo. Create your own instance to use the full advisor.',
    },
  };
}
