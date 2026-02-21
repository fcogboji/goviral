"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  price: number;
  priceNGN: number | null;
  priceGBP: number | null;
  yearlyMonthlyPrice: number | null;
  yearlyMonthlyPriceNGN: number | null;
  yearlyMonthlyPriceGBP: number | null;
  description: string | null;
  features: string[];
  maxPosts: number;
  maxPlatforms: number;
  maxWhatsAppMessages: number;
  trialDays: number;
  sortOrder: number;
  isActive: boolean;
  _count?: { subscriptions: number; payments: number };
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  NGN: "₦",
  GBP: "£",
};

function formatPrice(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${symbol}${amount.toLocaleString()}`;
}

const emptyPlan = {
  name: "",
  price: 0,
  priceNGN: null as number | null,
  priceGBP: null as number | null,
  yearlyMonthlyPrice: null as number | null,
  yearlyMonthlyPriceNGN: null as number | null,
  yearlyMonthlyPriceGBP: null as number | null,
  description: "",
  features: [""],
  maxPosts: 150,
  maxPlatforms: 5,
  maxWhatsAppMessages: 0,
  trialDays: 7,
  sortOrder: 0,
  isActive: true,
};

export default function PlansManagementClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyPlan);
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price,
      priceNGN: plan.priceNGN,
      priceGBP: plan.priceGBP,
      yearlyMonthlyPrice: plan.yearlyMonthlyPrice,
      yearlyMonthlyPriceNGN: plan.yearlyMonthlyPriceNGN,
      yearlyMonthlyPriceGBP: plan.yearlyMonthlyPriceGBP,
      description: plan.description ?? "",
      features: plan.features.length ? plan.features : [""],
      maxPosts: plan.maxPosts,
      maxPlatforms: plan.maxPlatforms,
      maxWhatsAppMessages: plan.maxWhatsAppMessages,
      trialDays: plan.trialDays,
      sortOrder: plan.sortOrder,
      isActive: plan.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const features = form.features.filter((f) => f.trim());
    if (!form.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (features.length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        features,
        priceNGN: form.priceNGN || null,
        priceGBP: form.priceGBP || null,
        yearlyMonthlyPrice: form.yearlyMonthlyPrice || null,
        yearlyMonthlyPriceNGN: form.yearlyMonthlyPriceNGN || null,
        yearlyMonthlyPriceGBP: form.yearlyMonthlyPriceGBP || null,
      };

      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : "/api/admin/plans";
      const method = editingPlan ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save plan");
      }

      toast.success(editingPlan ? "Plan updated" : "Plan created");
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (plan._count && plan._count.subscriptions > 0) {
      toast.error("Cannot delete plan with active subscribers. Deactivate instead.");
      return;
    }
    if (!confirm(`Delete plan "${plan.name}"?`)) return;

    setDeleting(plan.id);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast.success("Plan deleted");
      fetchPlans();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, ""] }));
  const removeFeature = (i: number) =>
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, j) => j !== i),
    }));
  const updateFeature = (i: number, v: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.map((x, j) => (j === i ? v : x)),
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plans Management</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Plans here appear on the pricing page. Edit prices, features, and limits.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 transition-colors ${
              plan.isActive ? "border-gray-200 hover:border-blue-500" : "border-gray-100 opacity-75"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  {!plan.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(plan)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    disabled={(plan._count?.subscriptions ?? 0) > 0 || deleting === plan.id}
                    className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(plan.price, "USD")}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                {(plan.priceNGN != null || plan.priceGBP != null) && (
                  <div className="text-sm text-gray-600">
                    {plan.priceNGN != null && formatPrice(plan.priceNGN, "NGN")}
                    {plan.priceNGN != null && plan.priceGBP != null && " / "}
                    {plan.priceGBP != null && formatPrice(plan.priceGBP, "GBP")}
                  </div>
                )}
              </div>

              {plan.description && (
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-gray-500">Subscribers</p>
                  <p className="text-lg font-semibold">{plan._count?.subscriptions ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payments</p>
                  <p className="text-lg font-semibold">{plan._count?.payments ?? 0}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Posts</span>
                  <span className="font-medium">
                    {plan.maxPosts === -1 ? "Unlimited" : plan.maxPosts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Platforms</span>
                  <span className="font-medium">
                    {plan.maxPlatforms === -1 ? "Unlimited" : plan.maxPlatforms}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp</span>
                  <span className="font-medium">{plan.maxWhatsAppMessages}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                <ul className="space-y-1">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 truncate">
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-sm text-gray-500">+{plan.features.length - 4} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No plans yet. Create your first plan.</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Plan
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingPlan ? "Edit Plan" : "Create Plan"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. Starter"
                  disabled={!!editingPlan}
                />
                {editingPlan && (
                  <p className="text-xs text-gray-500 mt-1">Plan name cannot be changed</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price USD</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price NGN</label>
                  <input
                    type="number"
                    min="0"
                    value={form.priceNGN ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceNGN: e.target.value ? parseFloat(e.target.value) : null,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price GBP</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.priceGBP ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceGBP: e.target.value ? parseFloat(e.target.value) : null,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Short description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Posts</label>
                  <input
                    type="number"
                    value={form.maxPosts === -1 ? "" : form.maxPosts}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxPosts: e.target.value === "" ? -1 : parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="-1 = unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Platforms</label>
                  <input
                    type="number"
                    value={form.maxPlatforms === -1 ? "" : form.maxPlatforms}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        maxPlatforms:
                          e.target.value === "" ? -1 : parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="-1 = unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={form.trialDays}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, trialDays: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <div className="space-y-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={f}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2"
                        placeholder="Feature"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="text-red-600 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add feature
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (shown on pricing page)
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
