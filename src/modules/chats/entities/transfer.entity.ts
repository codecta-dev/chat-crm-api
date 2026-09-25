import { CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from ".";
import { User } from "../../users/entities/user.entity";

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat)
  chat: Chat;

  @ManyToOne(() => User)
  fromAgent: User;

  @ManyToOne(() => User)
  toAgent: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date
}