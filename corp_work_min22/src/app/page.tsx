import { getEventConfig } from "@/lib/config";
import { BookingFlow } from "@/components/BookingFlow";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getEventConfig();

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
      <BookingFlow initialConfig={config} />
    </main>
  );
}
