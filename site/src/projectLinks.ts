export const REPOSITORY_URL = 'https://github.com/ai-automation-tools/edge-spectrum';
export const SETUP_GUIDE_URL = `${REPOSITORY_URL}/blob/main/Docs/self-hosting.md`;
export const DEPLOY_URL = `https://vercel.com/new/clone?${new URLSearchParams({
  'repository-url': REPOSITORY_URL,
  'root-directory': 'site',
  'project-name': 'my-edge-spectrum',
  'repository-name': 'my-edge-spectrum',
  env: 'EDGE_SPECTRUM_MODE,GEMINI_API_KEY,ADVISOR_PASSCODE,ADVISOR_SECRET',
  envDefaults: JSON.stringify({ EDGE_SPECTRUM_MODE: 'full' }),
  envDescription: 'Use full mode, your own Gemini key, a strong private passcode, and a long random signing secret.',
  envLink: SETUP_GUIDE_URL,
})}`;
