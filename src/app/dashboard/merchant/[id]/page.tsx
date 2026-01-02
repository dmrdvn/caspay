import { MerchantDetailsView } from 'src/sections/merchant/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Dashboard: Merchant Details' };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <MerchantDetailsView id={id} />;
}
