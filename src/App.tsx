import { useGlossaryFlow } from './hooks/useGlossaryFlow';
import GlossaryView from './components/glossary/GlossaryView';

function App() {
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

export default App;
