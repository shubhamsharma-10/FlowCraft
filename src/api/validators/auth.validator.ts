import zod from 'zod';

export const registerSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    name: zod.string().min(2, 'Name must be at least 2 characters long')
})

export const siginSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6, 'Password must be at least 6 characters long')
})