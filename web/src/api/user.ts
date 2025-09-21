import axios from "axios";

export interface User {
    id: string;
    name: string;
    email: string;
    preferences: any;
}

export const updatePreferences = async (user: User) => {
    const response = await axios.patch(`/api/v1/users/${user.id}/preferences`,
        {
            preferences: user.preferences
        });
    return response.data as User;
};
