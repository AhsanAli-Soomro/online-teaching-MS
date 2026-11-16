import { z } from "zod";
import { classLevels } from "./teacher";

export const requirementSchema = z
  .object({
    subjectId: z.string().optional().or(z.literal("")),
    customSubjectName: z.string().max(100).optional().or(z.literal("")),
    classLevel: z.string().min(1, "Class level is required"),
    budget: z.coerce
      .number()
      .min(500, "Budget must be at least 500 PKR")
      .max(500000, "Budget cannot exceed 500,000 PKR"),
    timing: z.string().min(3, "Timing description is required").max(200),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(2000),
  })
  .refine((data) => !!(data.subjectId || (data.customSubjectName && data.customSubjectName.trim().length >= 2)), {
    message: "Please select a subject or type a custom subject name.",
    path: ["subjectId"],
  });

export const proposalSchema = z.object({
  requirementId: z.string().min(1, "Requirement ID is required"),
  proposedFee: z.coerce
    .number()
    .min(500, "Proposed fee must be at least 500 PKR")
    .max(500000),
  message: z.string().min(10, "Message must be at least 10 characters long").max(2000),
});
