import { SubscriptionPlanEditView } from 'src/sections/subscription-plan/view';

// ----------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <SubscriptionPlanEditView id={id} />;
}
