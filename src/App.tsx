import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGlossaryFlow } from './hooks/useGlossaryFlow';
import GlossaryView from './components/glossary/GlossaryView';
import TranslationStringsView from './components/translation/TranslationStringsView';

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
        <Route path="/" element={<GlossaryRoot />} />
        <Route path="/translate" element={<TranslationStringsView />} />
      </Routes>
    </BrowserRouter>
  );
}
