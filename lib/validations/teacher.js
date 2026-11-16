import { z } from "zod";

export const classLevels = [
  "Primary",
  "Middle",
  "Matric",
  "O-Level",
  "A-Level",
  "Intermediate",
  "University",
];

export const dayOfWeekEnum = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const teacherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  bio: z.string().max(2000, "Bio must be under 2000 characters").optional().or(z.literal("")),
  qualification: z.string().max(200, "Qualification must be under 200 characters").optional().or(z.literal("")),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative").max(60, "Invalid experience years"),
  hourlyFee: z.coerce.number().min(100, "Fee must be at least 100 PKR").max(50000, "Fee cannot exceed 50,000 PKR"),
  city: z.string().max(100).optional().or(z.literal("")),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
  photoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  introVideoUrl: z.string().url("Must be a valid video URL").optional().or(z.literal("")),
  subjects: z.array(
    z.object({
      subjectId: z.string().min(1, "Subject is required"),
      classLevel: z.string().min(1, "Class level is required"),
    })
  ).optional(),
  availability: z.array(
    z.object({
      dayOfWeek: z.enum(dayOfWeekEnum),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
    })
  ).optional(),
});
