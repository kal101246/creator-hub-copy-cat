import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGlossaryFlow } from './hooks/useGlossaryFlow';
import GlossaryView from './components/glossary/GlossaryView';
import TranslationStringsView from './components/translation/TranslationStringsView';
import ImageTranslationV3 from './components/translation/ImageTranslationV3';
import HomeDashboard from './components/home/HomeDashboard';
import ExperienceOverview from './components/experience/ExperienceOverview';
import CreationsDashboard from './components/creations/CreationsDashboard';

function GlossaryRoot() {
  const flow = useGlossaryFlow();

  return (
    <GlossaryView
      isPanelOpen={flow.isPanelOpen}
      isEditing={flow.isEditing}
      rules={flow.rules}
      showSuccessToast={flow.showSuccessToast}
      isDeleteModalOpen={flow.isDeleteModalOpen}
      openPanel={flow.openPanel}
      closePanel={flow.closePanel}
      draftRule={flow.draftRule}
      updateDraft={flow.updateDraft}
      submitRule={flow.submitRule}
      editRule={flow.editRule}
      openDeleteModal={flow.openDeleteModal}
      closeDeleteModal={flow.closeDeleteModal}
      deleteRule={flow.deleteRule}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/creations" element={<CreationsDashboard />} />
        <Route path="/experience/overview" element={<ExperienceOverview />} />
        <Route path="/localization" element={<GlossaryRoot />} />
        <Route path="/translate" element={<TranslationStringsView />} />
        <Route path="/translate-v3" element={<ImageTranslationV3 />} />
      </Routes>
    </BrowserRouter>
  );
}
