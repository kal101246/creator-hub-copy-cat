import type { GlossaryFlowState, GlossaryFlowActions } from '../../hooks/useGlossaryFlow';
import GlossaryTable from './GlossaryTable';
import CreateRulePanel from './CreateRulePanel';

type Props = Pick<GlossaryFlowState, 'isPanelOpen' | 'rules' | 'showSuccessToast'> &
  Pick<GlossaryFlowActions, 'openPanel' | 'closePanel'>;

export default function GlossaryView({ openPanel }: Props) {
  return (
    <div>
      <button onClick={openPanel}>Create Rule</button>
      <GlossaryTable />
      <CreateRulePanel />
    </div>
  );
}
