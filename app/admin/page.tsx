import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type Rsvp = {
  id: number;
  name: string;
  attending: boolean;
  message: string | null;
  created_at: string | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { password?: string };
}) {
  const password = searchParams.password ?? "";

  if (password !== process.env.ADMIN_PASSWORD) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <p className="text-paper">
          401 Unauthorized. Add <code>?password=...</code> to the URL to view
          the RSVPs.
        </p>
      </main>
    );
  }

  if (!supabaseAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <p className="text-paper">
          Admin client is not configured. Check&nbsp;SUPABASE_SERVICE_ROLE_KEY
          on the server.
        </p>
      </main>
    );
  }

  const { data: rsvps, error } = await supabaseAdmin
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: true });

  const attending = rsvps
    ? rsvps.filter((r) => r.attending).length
    : 0;

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">RSVPs</h1>
        <p className="mt-1 text-lg">
          Attending: <strong>{attending}</strong>
          {rsvps ? <span> / {rsvps.length} total</span> : null}
        </p>

        {error ? (
          <p className="mt-4 text-heart-red">
            Error loading RSVPs: {error.message}
          </p>
        ) : !rsvps || rsvps.length === 0 ? (
          <p className="mt-4 text-ink/70">No RSVPs yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-blush-mid">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Attending</th>
                  <th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r: Rsvp) => (
                  <tr key={r.id} className="border-b border-blush-mid/50">
                    <td className="py-2 pr-4 font-semibold">{r.name}</td>
                    <td className="py-2 pr-4">
                      {r.attending ? "Yes" : "No"}
                    </td>
                    <td className="py-2 text-ink/70">
                      {r.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}