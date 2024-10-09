import { Session } from 'src/session/entities/session.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('code')
export class Code {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Session, (session) => session.code)
  session: Session;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
