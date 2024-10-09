import User from "./user.inteface";

interface Participant {
  id: number;
  online: boolean;
  kicked: boolean;
  muted: boolean;
  user: User;
}

export default Participant;
