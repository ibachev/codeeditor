import Participant from "./participant.interface";
import User from "./user.inteface";

interface SessionData {
  id: number;
  name: string;
  sessionId: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  creator: User;
}

export default SessionData;
