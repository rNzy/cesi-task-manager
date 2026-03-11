import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class TaskTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'title', length: 100 })
  title: string;
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;
  @Column({
    name: 'done',
    type: 'boolean',
    default: false,
  })
  done: boolean;
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
