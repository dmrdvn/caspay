import { MerchantIntegrationView } from 'src/sections/merchant/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Dashboard: API Integration' };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <MerchantIntegrationView merchantId={id} />;
}
