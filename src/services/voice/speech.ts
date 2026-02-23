import { postAPI } from '@/services/api';

export interface SpeechResult {
    audio: {
        base64: string;
        mediaType: string;
    };
}

export interface SpeechOptions {
    voice?: string;
    language?: string;
}

export const generateSpeech = async (text: string, options?: SpeechOptions): Promise<SpeechResult> => {
    const result = await postAPI('GENERATE_SPEECH', {
        text,
        voice: options?.voice ?? 'aura-2-helena-en',
    });

    if (result.statusCode !== 200) {
        throw new Error(result.message || 'Failed to generate speech');
    }

    return result.data;
};
