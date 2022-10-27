import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class RefreshToken {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 300 })
    @Index({ unique: true })
    refreshToken: string;

    @Column()
    expires: Date;

    @Column({ nullable: true })
    revoked: Date;

    @Column({ length: 300, nullable: true })
    replacedByToken: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ length: 50 })
    createdByIp: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(type => User, (user) => user.refreshTokens)
    user: User
}