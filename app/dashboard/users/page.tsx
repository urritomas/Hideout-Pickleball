"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  player_name: string;
  player_email: string;
  total_bookings: number;
  last_booking_date: string;
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/dashboard/users");
      const payload = (await response.json()) as { data?: User[]; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load users.");
      }

      setUsers(payload.data || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return <p className="text-center text-sm text-slate-500">Loading users...</p>;
  }

  if (errorMessage) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>;
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Users</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Review user profiles, activity, and account status.</p>

      {users.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">No users found.</p>
      ) : (
        <div className="mt-4 sm:mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Total Bookings</th>
                <th className="py-2">Last Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {users.map((user, index) => (
                <tr key={`${user.player_email}-${index}`}>
                  <td className="py-3 font-medium">{user.player_name}</td>
                  <td className="py-3">{user.player_email}</td>
                  <td className="py-3">{user.total_bookings}</td>
                  <td className="py-3">
                    {new Date(user.last_booking_date).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
