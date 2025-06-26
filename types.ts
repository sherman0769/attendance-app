
export interface Participant {
  id: string; // Unique ID
  name: string;
  attendance: boolean[]; // Array tracking attendance for each event
}

export type ActiveTab = 'manage' | 'report';
