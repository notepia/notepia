import axios from "axios";

export interface UserSettings {
    user_id: string
    openai_api_key: string
    gemini_api_key: string
    created_at?: string;
}

export const getUserSettings = async (id: string) => {
    const response = await axios.get(`/api/v1/users/${id}/settings`,
        {
            withCredentials: true
        });
    return response.data as UserSettings;
};

export const updateUserSettings = async (userSettings: UserSettings) => {
    const response = await axios.put(`/api/v1/users/${userSettings.user_id}/settings`, userSettings);
    return response.data as UserSettings;
};
