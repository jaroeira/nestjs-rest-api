import { RefreshToken } from "../auth/refreshToken.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 500 })
    passwordHash: string;

    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column({ length: 50, default: 'user' })
    role: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ length: 100, nullable: true })
    verificationToken: string;

    @Column({ nullable: true })
    passwordChanged: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(type => RefreshToken, refreshToken => refreshToken.user, { cascade: true })
    refreshTokens: RefreshToken[];
}