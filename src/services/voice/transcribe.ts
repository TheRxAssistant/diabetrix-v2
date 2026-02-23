import { postAPIForm } from '@/services/api';

export interface TranscriptionResult {
    text: string;
    segments: Array<{
        text: string;
        startSecond: number;
        endSecond: number;
    }>;
    language?: string;
    durationInSeconds?: number;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
    const form_data = new FormData();
    form_data.append('audio', audioBlob, 'audio.webm');

    const result = await postAPIForm('TRANSCRIBE_AUDIO', form_data);

    if (result.statusCode !== 200) {
        throw new Error(result.message || 'Failed to transcribe audio');
    }

    return result.data;
};
