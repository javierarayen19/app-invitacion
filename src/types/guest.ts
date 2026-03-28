export interface Guest {
  id: string;
  name: string;
  confirmed: boolean;
  declined: boolean;
  decline_reason: string;
  dietary: string;
  createdAt: string;
}
