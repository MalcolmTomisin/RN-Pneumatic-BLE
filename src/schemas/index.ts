import {z} from 'zod';

const HardwareSchema = z.object({
  _id: z.string(),
  type: z.string(),
  description: z.string(),
  macAddress: z.string(),
  model: z.string(),
});

const ProfileSchema = z.object({
  _id: z.string(),
  userEmail: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userId: z.string(),
});

export const LoginResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    profile: ProfileSchema,
    hardware: HardwareSchema,
    token: z.string(),
    when: z.string().datetime(),
  }),
});

export type LoginResponseType = z.infer<typeof LoginResponseSchema>;
export type HardwareType = z.infer<typeof HardwareSchema>;
export type ProfileType = z.infer<typeof ProfileSchema>;
