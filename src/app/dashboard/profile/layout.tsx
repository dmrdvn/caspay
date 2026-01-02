import { ProfileLayout } from 'src/sections/profile/profile-layout';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <ProfileLayout> {children}</ProfileLayout>;
}
