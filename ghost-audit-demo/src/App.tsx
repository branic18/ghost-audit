import React, { useEffect } from 'react';
import { useStore } from './state/store';
import TopBar from './components/TopBar';
import Banner from './components/Banner';
import SearchHeader from './components/SearchHeader';
import { EmptyStatePanel, LoadingStatePanel } from './components/StatePanel';
import ResultsView from './components/ResultsView';
import ArchivesView from './components/ArchivesView';
import KnowledgeTest from './components/KnowledgeTest';
import SettingsModal from './components/SettingsModal';
import ToastRegion from './components/ToastRegion';

export default function App() {
  const { state } = useStore();
  const onTest = state.view === 'knowledge-test';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <TopBar />
      {onTest ? (
        <KnowledgeTest />
      ) : (
        <>
          <Banner />
          <main id="main-content">
            <SearchHeader />
            {state.view === 'empty' && <EmptyStatePanel />}
            {state.view === 'loading' && <LoadingStatePanel />}
            {state.view === 'results' && <ResultsView />}
            {state.view === 'archives' && <ArchivesView />}
          </main>
        </>
      )}
      <SettingsModal />
      <ToastRegion />
    </div>
  );
}
