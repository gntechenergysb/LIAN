import { getSessionUser } from '@/lib/auth';
import AppearanceForm from '@/components/AppearanceForm';

export const dynamic = 'force-dynamic';

export default async function AppearancePage() {
  const user = await getSessionUser();
  if (!user) return null;
  return <AppearanceForm user={user} />;
}
