import { metaObject } from '@/config/site.config';
import PersonalInfoView from '@shared/account-settings/personal-info';

export const metadata = {
  ...metaObject('Profile Settings'),
};

export default function ProfileSettingsFormPage() {
  return <PersonalInfoView />;
}
