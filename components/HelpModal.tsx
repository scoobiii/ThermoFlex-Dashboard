import React, { useState } from 'react';
import { CloseIcon, QuestionMarkCircleIcon } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

type HelpTab = 'glossary' | 'userGuide' | 'devGuide' | 'newProject';

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<HelpTab>('glossary');

  const tabButtonClasses = (tabName: HelpTab) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
      activeTab === tabName
        ? 'bg-cyan-600 text-white'
        : 'text-gray-300 hover:bg-gray-700/50'
    }`;

  const GlossaryContent = () => (
    <div className="space-y-4">
      {[ 'pue', 'cop', 'trigeneration', 'smr', 'tiac', 'fogging', 'cogs', 'ebitda' ].map(term => (
        <div key={term}>
          <h4 className="font-semibold text-cyan-400">{t(`glossary.${term}.term`)}</h4>
          <p className="text-gray-400 text-sm">{t(`glossary.${term}.def`)}</p>
        </div>
      ))}
    </div>
  );

  const UserGuideContent = () => (
    <div className="space-y-4 text-gray-300">
        <div>
            <h4 className="font-semibold text-white mb-1">1. {t('help.userGuide.nav.title')}</h4>
            <p className="text-sm">{t('help.userGuide.nav.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">2. {t('help.userGuide.project.title')}</h4>
            <p className="text-sm">{t('help.userGuide.project.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">3. {t('help.userGuide.controls.title')}</h4>
            <p className="text-sm">{t('help.userGuide.controls.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">4. {t('help.userGuide.maximize.title')}</h4>
            <p className="text-sm">{t('help.userGuide.maximize.desc')}</p>
        </div>
    </div>
  );
  
  const DevOpsGuideContent = () => (
     <div className="space-y-4 text-gray-300">
        <div>
            <h4 className="font-semibold text-white mb-1">1. {t('help.devGuide.structure.title')}</h4>
            <p className="text-sm">{t('help.devGuide.structure.desc')}</p>
            <code className="block bg-gray-900 p-2 rounded-md text-xs mt-2 text-cyan-400">/components (reusable), /pages (dashboards), /hooks, /data</code>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">2. {t('help.devGuide.state.title')}</h4>
            <p className="text-sm">{t('help.devGuide.state.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">3. {t('help.devGuide.i18n.title')}</h4>
            <p className="text-sm">{t('help.devGuide.i18n.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">4. {t('help.devGuide.newPage.title')}</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 pl-4">
                <li>{t('help.devGuide.newPage.step1')}</li>
                <li>{t('help.devGuide.newPage.step2')}</li>
                <li>{t('help.devGuide.newPage.step3')}</li>
                <li>{t('help.devGuide.newPage.step4')}</li>
            </ol>
        </div>
    </div>
  );

  const NewProjectGuideContent = () => (
     <div className="space-y-4 text-gray-300">
        <div>
            <h4 className="font-semibold text-white mb-1">Step 1: {t('help.newProject.step1.title')}</h4>
            <p className="text-sm">{t('help.newProject.step1.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">Step 2: {t('help.newProject.step2.title')}</h4>
            <p className="text-sm">{t('help.newProject.step2.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">Step 3: {t('help.newProject.step3.title')}</h4>
            <p className="text-sm">{t('help.newProject.step3.desc')}</p>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">Step 4: {t('help.newProject.step4.title')}</h4>
            <p className="text-sm">{t('help.newProject.step4.desc')}</p>
        </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 py-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <QuestionMarkCircleIcon className="w-7 h-7 text-cyan-400" />
            <h2 id="help-modal-title" className="text-xl font-bold text-white">{t('help.title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label={t('help.close')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex flex-col md:flex-row flex-grow min-h-0">
          <nav className="flex-shrink-0 md:w-48 p-4 border-b md:border-b-0 md:border-r border-gray-700">
            <ul className="flex flex-row md:flex-col gap-2">
              <li><button onClick={() => setActiveTab('glossary')} className={tabButtonClasses('glossary')}>{t('help.glossary')}</button></li>
              <li><button onClick={() => setActiveTab('userGuide')} className={tabButtonClasses('userGuide')}>{t('help.userGuide')}</button></li>
              <li><button onClick={() => setActiveTab('devGuide')} className={tabButtonClasses('devGuide')}>{t('help.devGuide')}</button></li>
              <li><button onClick={() => setActiveTab('newProject')} className={tabButtonClasses('newProject')}>{t('help.newProject')}</button></li>
            </ul>
          </nav>

          <main className="p-6 flex-grow overflow-y-auto">
            {activeTab === 'glossary' && <GlossaryContent />}
            {activeTab === 'userGuide' && <UserGuideContent />}
            {activeTab === 'devGuide' && <DevOpsGuideContent />}
            {activeTab === 'newProject' && <NewProjectGuideContent />}
          </main>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default HelpModal;
