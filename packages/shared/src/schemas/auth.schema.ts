import { z } from 'zod';

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const AuthRegisterSchema = AuthLoginSchema.extend({
  name: z.string().min(2),
});

export type AuthLogin = z.infer<typeof AuthLoginSchema>;
export type AuthRegister = z.infer<typeof AuthRegisterSchema>;
