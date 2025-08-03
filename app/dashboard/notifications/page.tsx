// /app/(dashboard)/notifications/page.tsx

import {prisma} from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function NotificationsPage() {
  const user = await currentUser();
  
  if (!user) {
    return <div>Please sign in to view notifications</div>;
  }

  const notifications = await prisma.notification.findMany({
    where: { user: { clerkId: user.id } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul className="space-y-4">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`border p-4 rounded ${
              n.read ? "bg-gray-100" : "bg-white"
            }`}
          >
            <p>{n.message}</p>
            <small className="text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </small>
            {!n.read && (
              <form
                action="/api/notifications"
                method="POST"
                className="mt-2"
              >
                <input type="hidden" name="id" value={n.id} />
                <button
                  formAction="/api/notifications"
                  formMethod="PATCH"
                  className="text-blue-500 underline"
                >
                  Mark as read
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}