import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Session } from 'src/session/entities/session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @OneToMany(() => Session, (session) => session.creator)
  sessions: Session[];

  @ManyToMany(() => Session, (session) => session.participants)
  sessionsJoined: Session[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  hashedRefreshToken: string | null;
}
