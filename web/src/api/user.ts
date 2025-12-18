import axios from "axios";

export interface UserPreferences {
    lang?: string;
    theme?: 'light' | 'dark';
    primaryColor?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences: UserPreferences;
}

export const updatePreferences = async (user: User) => {
    const response = await axios.patch(`/api/v1/users/${user.id}/preferences`,
        {
            preferences: user.preferences
        });
    return response.data as User;
};
