import { createJSONStorage, persist } from 'zustand/middleware/persist';
import { create } from 'zustand';

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            app_name: '',
        }),
        {
            name: 'app',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

type AppState = {
    app_name: string;
};

