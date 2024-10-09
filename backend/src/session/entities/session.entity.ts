import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { createHash } from 'crypto';
import { SessionParticipant } from './session-participants.entity';
import { Code } from 'src/code/entities/code.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    name: 'session_id',
    type: 'varchar',
    length: 12,
    unique: true,
  })
  sessionId: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
    eager: true,
  })
  creator: User;

  @Column({ default: false })
  isLocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Code, (code) => code.session, { cascade: true })
  @JoinColumn()
  code: Code;

  @OneToMany(
    () => SessionParticipant,
    (sessionParticipant) => sessionParticipant.session,
    {
      cascade: true,
      eager: true,
    },
  )
  participants: SessionParticipant[];

  @BeforeInsert()
  generateSessionId() {
    const hash = createHash('sha256')
      .update(`${Date.now()}${Math.random()}`)
      .digest('hex');
    this.sessionId = hash.slice(0, 12);
  }
}
