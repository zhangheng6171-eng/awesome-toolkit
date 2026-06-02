import { getDeployableTools } from '@/lib/deploy';
import { WizardClient } from './WizardClient';

export function generateStaticParams() {
  return getDeployableTools().map((t) => ({ id: t.id }));
}

export default function WizardPage() {
  return <WizardClient />;
}
