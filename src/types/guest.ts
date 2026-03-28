export interface Guest {
  id: string;
  name: string;
  confirmed: boolean;
  declined: boolean;
  decline_reason: string;
  dietary: string;
  plus_one: boolean;
  plus_one_name: string;
  createdAt: string;
}
