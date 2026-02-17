import { z } from 'zod';

export const messageMetadataSchema = z.object({
    created_at: z.number().optional(),
    model: z.string().optional(),
    total_tokens: z.number().optional(),
    input_tokens: z.number().optional(),
    output_tokens: z.number().optional(),
    finish_reason: z.string().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
