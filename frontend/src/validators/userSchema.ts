import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email format");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters long");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signupOnlyFields = {
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  phone: z.string().regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
};

export const signupSchema = z.object({
  ...signupOnlyFields,
  email: emailSchema,
  password: passwordSchema,
});

export const combinedSchema = z.object({
  username: signupOnlyFields.username.optional(),
  email: emailSchema,
  first_name: signupOnlyFields.first_name.optional(),
  last_name: signupOnlyFields.last_name.optional(),
  dob: signupOnlyFields.dob.optional(),
  phone: signupOnlyFields.phone.optional(),
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type CombinedFormData = z.infer<typeof combinedSchema>;