import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Session } from './session.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('session_participants')
export class SessionParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Session, (session) => session.participants, {
    onDelete: 'CASCADE',
  })
  session: Session;

  @ManyToOne(() => User, (user) => user.sessionsJoined, {
    onDelete: 'CASCADE',
    eager: true, // Eager load the user details
  })
  user: User;

  @Column({ default: false })
  online: boolean;

  @Column({ default: false })
  kicked: boolean;

  @Column({ default: false })
  muted: boolean;
}
