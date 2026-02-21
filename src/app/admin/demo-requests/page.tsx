'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchRequests = useCallback(async () => {
    try {
      const url = filter === 'all'
        ? '/api/demo/request'
        : `/api/demo/request?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      toast.error('Failed to fetch demo requests');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Demo Requests</h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b">
            {['all', 'pending', 'scheduled', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  filter === status
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              No {filter !== 'all' ? filter : ''} demo requests found.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{request.name}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                  </div>
                  <Badge className={getStatusBadgeColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {request.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm">{request.phone}</p>
                    </div>
                  )}
                  {request.company && (
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm">{request.company}</p>
                    </div>
                  )}
                  {request.preferredDate && (
                    <div>
                      <p className="text-xs text-gray-500">Preferred Date</p>
                      <p className="text-sm">
                        {new Date(request.preferredDate).toLocaleDateString()}
                        {request.preferredTime && ` at ${request.preferredTime}`}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Requested On</p>
                    <p className="text-sm">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Message</p>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {request.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <a
                    href={`mailto:${request.email}`}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Email Contact
                  </a>
                  {request.phone && (
                    <>
                      <span className="text-gray-300">|</span>
                      <a
                        href={`tel:${request.phone}`}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Call Contact
                      </a>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
