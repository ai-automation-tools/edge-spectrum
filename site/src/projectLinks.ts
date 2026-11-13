export const REPOSITORY_URL = 'https://github.com/ai-automation-tools/edge-spectrum';

/**
 * The original deployment's site and org (audit PROD-04). They apply only to a build of the
 * original repository: `vite.config.ts` decides which repo it is building and passes the result
 * in as VITE_SITE_URL and VITE_ORG_URL. A fork's build gets no canonical URL, sitemap or share
 * image pointing here, no org links and no org consent script, without editing anything; it can
 * set EDGE_SPECTRUM_SITE_URL to its own address to get those back for itself.
 */
export const ORIGINAL_REPO = 'ai-automation-tools/edge-spectrum';
export const ORIGINAL_SITE_URL = 'https://edge-spectrum.ai-automation-tools.dev';
export const ORIGINAL_ORG_URL = 'https://ai-automation-tools.dev';
/** This build's own address, or '' when it has none. */
export const SITE_URL: string = import.meta.env?.VITE_SITE_URL ?? '';
/** The org apex (landing page, cookie notice, consent script), or '' on a fork. */
export const ORG_URL: string = import.meta.env?.VITE_ORG_URL ?? '';
/** The org's Cronsole template gallery, or '' on a fork. */
export const GALLERY_URL = ORG_URL && `${ORG_URL.replace('://', '://cronsole.')}/`;
export const SETUP_GUIDE_URL = `${REPOSITORY_URL}/blob/main/docs/self-hosting.md`;
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
