import { MerchantEditView } from 'src/sections/merchant/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Dashboard: Edit Merchant' };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <MerchantEditView id={id} />;
}
