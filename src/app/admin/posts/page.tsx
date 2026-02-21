// /app/(admin)/posts/page.tsx
import {prisma} from "@/lib/prisma";
import PostManagementClient from "@/components/admin/PostManagementClient";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, role: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
        <div className="text-sm text-gray-600">
          Total Posts: <span className="font-semibold">{posts.length}</span>
        </div>
      </div>

      <PostManagementClient initialPosts={posts} />
    </div>
  );
}