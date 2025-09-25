import React from 'react';

const AppFooter: React.FC = () => {
  const env = import.meta.env.VITE_BUILD_ENV || 'dev';
  const sha = import.meta.env.VITE_COMMIT_SHA || 'local';
  const shortSha = (sha || '').substring(0, 7);
  const versionLabel = env === 'prod' ? `Commit ${shortSha}` : 'Dev Mode';
  const dateStr = new Date().toISOString().split('T')[0];

  return (
    <footer className="relative z-10 container mx-auto px-4 py-6 mt-auto">
      <div className="border-t border-base-content/10 pt-6 text-center text-xs text-base-content/50 font-mono">
        DARKNET_DUEL • {versionLabel} • {dateStr}
      </div>
    </footer>
  );
};

export default AppFooter;


