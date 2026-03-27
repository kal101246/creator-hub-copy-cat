import { useGlossaryFlow } from './hooks/useGlossaryFlow';
import GlossaryView from './components/glossary/GlossaryView';

function App() {
  const flow = useGlossaryFlow();

  return (
    <GlossaryView
      isPanelOpen={flow.isPanelOpen}
      rules={flow.rules}
      showSuccessToast={flow.showSuccessToast}
      openPanel={flow.openPanel}
      closePanel={flow.closePanel}
      draftRule={flow.draftRule}
      updateDraft={flow.updateDraft}
    />
  );
}

export default App;
