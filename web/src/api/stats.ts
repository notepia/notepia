import axios from 'axios';

export interface NoteCountByDate {
  date: string;
  count: number;
}

export const getNoteCountsByDate = async (
  workspaceId: string,
  days?: number,
  timezoneOffset?: number
): Promise<NoteCountByDate[]> => {
  const params = new URLSearchParams();
  if (days) {
    params.append('days', days.toString());
  }
  if (timezoneOffset !== undefined) {
    params.append('timezoneOffset', timezoneOffset.toString());
  }

  const url = `/api/v1/workspaces/${workspaceId}/stats/note-counts-by-date${params.toString() ? '?' + params.toString() : ''}`;
  const response = await axios.get(url, { withCredentials: true });
  return response.data as NoteCountByDate[];
};
