"use client";

import { useCallback, useEffect, useState } from "react";

type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  method?: string;
  paid_at?: string;
};

type BookingWithReceipt = {
  id: string;
  court_name: string;
  player_name: string;
  player_email: string;
  start_at: string;
  end_at: string;
  total_price: number;
  status: string;
  payment_receipt_url?: string;
};

function formatCurrency(value: number): string {
  return `P${value.toFixed(2)}`;
}

export default function DashboardPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<BookingWithReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [paymentsRes, bookingsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/dashboard/bookings"),
      ]);

      const paymentsPayload = (await paymentsRes.json()) as { data?: Payment[]; message?: string };
      const bookingsPayload = (await bookingsRes.json()) as { data?: BookingWithReceipt[]; message?: string };

      if (!paymentsRes.ok || !paymentsPayload.data) {
        throw new Error(paymentsPayload.message || "Failed to load payments.");
      }

      if (!bookingsRes.ok || !bookingsPayload.data) {
        throw new Error(bookingsPayload.message || "Failed to load bookings.");
      }

      setPayments(paymentsPayload.data || []);
      setBookings(bookingsPayload.data || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const uploadReceipt = async (bookingId: string) => {
    if (!receiptFile) return;

    setUploadingId(bookingId);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", receiptFile);

      const uploadResponse = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      const uploadPayload = (await uploadResponse.json()) as { url?: string; message?: string };
      if (!uploadResponse.ok) {
        throw new Error(uploadPayload.message || "Failed to upload receipt.");
      }

      const patchResponse = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          payment_receipt_url: uploadPayload.url,
        }),
      });

      const patchPayload = (await patchResponse.json()) as { message?: string };
      if (!patchResponse.ok) {
        throw new Error(patchPayload.message || "Failed to update booking with receipt.");
      }

      setReceiptFile(null);
      setReceiptPreview(null);
      await fetchData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setUploadingId(null);
    }
  };

  const getBookingForPayment = (bookingId: string) => {
    return bookings.find((b) => b.id === bookingId);
  };

  if (isLoading) {
    return <p className="text-center text-sm text-slate-500">Loading payments...</p>;
  }

  if (errorMessage && payments.length === 0) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>;
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Payments</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Audit payment status and recent transaction records.</p>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      {payments.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">No payment records found.</p>
      ) : (
        <div className="mt-4 sm:mt-6 space-y-3">
          {payments.map((payment) => {
            const booking = getBookingForPayment(payment.bookingId);
            return (
              <div key={payment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {booking ? `${booking.court_name} - ${booking.player_name}` : `Booking ${payment.bookingId}`}
                    </p>
                    <p className="text-sm text-slate-600">{formatCurrency(payment.amount)}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${payment.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {payment.status}
                    </span>
                    {payment.method && <p className="text-xs text-slate-500 capitalize">Method: {payment.method}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    {booking && !booking.payment_receipt_url && (
                      <div>
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-50">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-slate-400">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span className="text-xs font-medium text-slate-700">Upload Receipt</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                                setErrorMessage("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
                                return;
                              }
                              setReceiptFile(file);
                              setReceiptPreview(URL.createObjectURL(file));
                            }}
                          />
                         </label>
                         {receiptPreview ? (
                           <div className="mt-2 h-24 w-auto rounded-lg border border-slate-200 bg-white p-2">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={receiptPreview} alt="Receipt preview" className="h-full w-full object-contain" />
                           </div>
                         ) : null}
                         <button
                          onClick={() => uploadReceipt(booking.id)}
                          disabled={!receiptFile || uploadingId === booking.id}
                          className="mt-2 w-full min-h-[44px] rounded-xl bg-lime-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {uploadingId === booking.id ? "Uploading..." : "Upload Receipt"}
                        </button>
                      </div>
                    )}
                    {booking && booking.payment_receipt_url && (
                      <div>
                        <button
                          onClick={() => setOverlayUrl(booking.payment_receipt_url || null)}
                          className="text-sm font-medium text-blue-600 transition hover:text-blue-500"
                        >
                          View Receipt
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {overlayUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setOverlayUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-white p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOverlayUrl(null)}
              className="absolute right-2 top-2 rounded-full bg-slate-900/50 p-2 text-white transition hover:bg-slate-900/70"
              aria-label="Close receipt preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={overlayUrl} alt="Payment Receipt" className="max-h-[80vh] w-auto rounded-xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
