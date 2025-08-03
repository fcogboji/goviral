// /app/(admin)/posts/page.tsx
import {prisma} from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, role: true } },
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Posts Management</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {posts.map((post) => (
            <li key={post.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {post.content.slice(0, 100)}...
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>by {post.user.email}</span>
                      <span className="mx-2">•</span>
                      <span>Platforms: {post.platforms.join(', ')}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === PostStatus.PUBLISHED ? 'bg-green-100 text-green-800' :
                      post.status === PostStatus.SCHEDULED ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}