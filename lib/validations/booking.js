import { z } from "zod";

export const sessionSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  startsAt: z.string().min(1, "Start time is required"),
  endsAt: z.string().min(1, "End time is required"),
  notes: z.string().max(500).optional(),
});

export const paymentSubmissionSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  method: z.enum(["JazzCash", "Easypaisa", "Bank Transfer"]),
  transactionId: z.string().min(4, "Transaction ID must be at least 4 characters").max(100),
  amount: z.coerce.number().min(100, "Amount must be at least 100 PKR"),
  proofUrl: z.string().url("Proof must be a valid URL").optional().or(z.literal("")),
});
