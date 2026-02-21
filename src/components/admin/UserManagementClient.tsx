"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, Search, CreditCard, TrendingUp, Zap, Calendar, DollarSign, AlertCircle, Ban, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type Subscription = {
  id: string;
  planType: string;
  status: string;
  currentPeriodEnd: Date;
  trialEndsAt: Date | null;
  cardLast4: string | null;
  cardBrand: string | null;
  plan: {
    name: string;
    price: number;
    currency: string;
  };
};

type User = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  createdAt: Date;
  subscription: Subscription | null;
  stats: {
    totalPosts: number;
    connectedPlatforms: number;
  };
  _count?: {
    posts: number;
    notifications: number;
  };
};

type Props = {
  initialUsers: User[];
};

export default function UserManagementClient({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editRole, setEditRole] = useState("");
  const [editPlanType, setEditPlanType] = useState("");
  const [editSubscriptionStatus, setEditSubscriptionStatus] = useState("");
  const [editTrialEnd, setEditTrialEnd] = useState("");
  const [editPeriodEnd, setEditPeriodEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<{ id: string; name: string; price: number }[]>([]);

  useEffect(() => {
    fetch("/api/admin/plans")
      .then((res) => (res.ok ? res.json() : { plans: [] }))
      .then((data) => setAvailablePlans(data.plans || []))
      .catch(() => setAvailablePlans([]));
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditPlanType(user.subscription?.planType || "Free");
    setEditSubscriptionStatus(user.subscription?.status || "inactive");
    setEditTrialEnd(
      user.subscription?.trialEndsAt
        ? new Date(user.subscription.trialEndsAt).toISOString().split("T")[0]
        : ""
    );
    setEditPeriodEnd(
      user.subscription?.currentPeriodEnd
        ? new Date(user.subscription.currentPeriodEnd).toISOString().split("T")[0]
        : ""
    );
    setBlockReason(user.blockedReason || "");
    setIsEditModalOpen(true);
  };

  const handleBlockUser = async (user: User, block: boolean, reason?: string) => {
    if (block && !confirm(`Block ${user.email}? They will no longer be able to access the app.`)) return;
    if (!block && !confirm(`Unblock ${user.email}?`)) return;

    const finalReason = reason ?? blockReason;
    setIsBlocking(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBlocked: block,
          blockedReason: block ? (finalReason || "Blocked by administrator") : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const refreshRes = await fetch("/api/admin/users");
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setUsers(refreshData.users);
        const updated = refreshData.users.find((u: User) => u.id === user.id);
        if (updated && selectedUser?.id === user.id) setSelectedUser(updated);
      }

      toast.success(block ? "User blocked successfully" : "User unblocked successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Operation failed");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const updateData: {
        role: string;
        planType?: string;
        subscriptionStatus?: string;
        trialEndsAt?: string;
        currentPeriodEnd?: string;
      } = {
        role: editRole,
      };

      // Only send subscription data if user is not on free plan
      if (editPlanType !== "Free") {
        updateData.planType = editPlanType;
        updateData.subscriptionStatus = editSubscriptionStatus;
        if (editTrialEnd) {
          updateData.trialEndsAt = new Date(editTrialEnd).toISOString();
        }
        if (editPeriodEnd) {
          updateData.currentPeriodEnd = new Date(editPeriodEnd).toISOString();
        }
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user");
      }


      // Refresh the user list
      const refreshRes = await fetch("/api/admin/users");
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setUsers(refreshData.users);
      }

      setIsEditModalOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const postsCount = user.stats?.totalPosts ?? user._count?.posts ?? 0;
              const platformsCount = user.stats?.connectedPlatforms ?? 0;

              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {user.email?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">{user.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "premium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.isBlocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Ban className="w-3 h-3" />
                          Blocked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {user.subscription?.planType || "Free"}
                    </div>
                    {user.subscription?.cardLast4 && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {user.subscription.cardBrand} •••• {user.subscription.cardLast4}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscription?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.subscription?.status === "trial"
                          ? "bg-blue-100 text-blue-800"
                          : user.subscription?.status === "past_due"
                          ? "bg-orange-100 text-orange-800"
                          : user.subscription?.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.subscription?.status || "inactive"}
                    </span>
                    {user.subscription?.trialEndsAt && new Date(user.subscription.trialEndsAt) > new Date() && (
                      <div className="text-xs text-gray-500 mt-1">
                        Trial ends {formatDate(new Date(user.subscription.trialEndsAt))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {postsCount} posts
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {platformsCount} platforms
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== "admin" && (
                      <>
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleBlockUser(user, false)}
                            disabled={isBlocking}
                            className="text-green-600 hover:text-green-800 mr-3"
                            title="Unblock user"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user, true)}
                            disabled={isBlocking}
                            className="text-amber-600 hover:text-amber-800 mr-3"
                            title="Block user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Enhanced Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Manage User Account</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-medium">
                  {selectedUser.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedUser.name || "N/A"}</div>
                  <div className="text-sm text-gray-600">{selectedUser.email}</div>
                  <div className="text-xs text-gray-500">ID: {selectedUser.id}</div>
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Admin Override:</strong> Changes made here will immediately affect the user&apos;s account and may override their payment status.
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Block Status */}
              {selectedUser.role !== "admin" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="blockStatus"
                        checked={!selectedUser.isBlocked}
                        onChange={() => {}}
                        className="text-green-600"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="blockStatus"
                        checked={!!selectedUser.isBlocked}
                        onChange={() => {}}
                        className="text-red-600"
                      />
                      <span>Blocked</span>
                    </label>
                  </div>
                  {selectedUser.isBlocked && selectedUser.blockedReason && (
                    <p className="mt-1 text-xs text-gray-500">Reason: {selectedUser.blockedReason}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    {selectedUser.isBlocked ? (
                      <button
                        type="button"
                        onClick={() => handleBlockUser(selectedUser, false)}
                        disabled={isBlocking}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                      >
                        Unblock User
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBlockUser(selectedUser, true, blockReason)}
                        disabled={isBlocking}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                      >
                        Block User
                      </button>
                    )}
                  </div>
                  {!selectedUser.isBlocked && (
                    <input
                      type="text"
                      placeholder="Block reason (optional)"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  )}
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Free User</option>
                  <option value="premium">Premium User</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Determines system access permissions</p>
              </div>

              {/* Subscription Plan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Subscription Plan
                </label>
                <select
                  value={editPlanType}
                  onChange={(e) => setEditPlanType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Free">Free (no subscription)</option>
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (${p.price}/month)
                    </option>
                  ))}
                  {availablePlans.length === 0 && (
                    <>
                      <option value="Starter">Starter ($29/month)</option>
                      <option value="Pro">Pro ($59/month)</option>
                    </>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">Select the user&apos;s subscription tier</p>
              </div>

              {/* Subscription Status */}
              {editPlanType !== "Free" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subscription Status
                    </label>
                    <select
                      value={editSubscriptionStatus}
                      onChange={(e) => setEditSubscriptionStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="past_due">Past Due</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Current subscription state</p>
                  </div>

                  {/* Date Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trial End Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Trial End Date
                      </label>
                      <input
                        type="date"
                        value={editTrialEnd}
                        onChange={(e) => setEditTrialEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Leave empty if not on trial</p>
                    </div>

                    {/* Subscription End Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Billing Period End
                      </label>
                      <input
                        type="date"
                        value={editPeriodEnd}
                        onChange={(e) => setEditPeriodEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">When the current billing period ends</p>
                    </div>
                  </div>
                </>
              )}

              {/* Current Stats */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Usage Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Posts</div>
                    <div className="text-lg font-bold text-blue-600">
                      {selectedUser.stats?.totalPosts ?? selectedUser._count?.posts ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Connected Platforms</div>
                    <div className="text-lg font-bold text-blue-600">
                      {selectedUser.stats?.connectedPlatforms ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Account Created</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                  {selectedUser.subscription && (
                    <div>
                      <div className="text-gray-600">Payment Method</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {selectedUser.subscription.cardBrand && selectedUser.subscription.cardLast4
                          ? `${selectedUser.subscription.cardBrand} •••• ${selectedUser.subscription.cardLast4}`
                          : "None"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                disabled={isUpdating}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={isUpdating}
                className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
