import axios from "axios";

export interface OAuthClient {
    id: string;
    user_id: string;
    name: string;
    client_id: string;
    client_secret_prefix: string;
    redirect_uris: string[];
    description: string;
    created_at: string;
    updated_at: string;
}

export interface OAuthClientCreationResponse extends OAuthClient {
    client_secret: string; // Only present on creation
}

export interface CreateOAuthClientRequest {
    name: string;
    redirect_uris: string[];
    description?: string;
}

export interface UpdateOAuthClientRequest {
    name?: string;
    redirect_uris?: string[];
    description?: string;
}

export const listOAuthClients = async (userId: string): Promise<OAuthClient[]> => {
    const response = await axios.get(`/api/v1/users/${userId}/oauth-clients`);
    return response.data;
};

export const getOAuthClient = async (userId: string, clientId: string): Promise<OAuthClient> => {
    const response = await axios.get(`/api/v1/users/${userId}/oauth-clients/${clientId}`);
    return response.data;
};

export const createOAuthClient = async (
    userId: string,
    request: CreateOAuthClientRequest
): Promise<OAuthClientCreationResponse> => {
    const response = await axios.post(`/api/v1/users/${userId}/oauth-clients`, request);
    return response.data;
};

export const updateOAuthClient = async (
    userId: string,
    clientId: string,
    request: UpdateOAuthClientRequest
): Promise<OAuthClient> => {
    const response = await axios.patch(`/api/v1/users/${userId}/oauth-clients/${clientId}`, request);
    return response.data;
};

export const deleteOAuthClient = async (userId: string, clientId: string): Promise<void> => {
    await axios.delete(`/api/v1/users/${userId}/oauth-clients/${clientId}`);
};
