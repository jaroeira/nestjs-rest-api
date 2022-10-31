import { RefreshToken } from "../auth/refreshToken.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Article } from "../articles/entities/article.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    @Index()
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

    @Column({ length: 300, nullable: true })
    resetPasswordToken: string;

    @Column({ nullable: true })
    avatarImageUrl: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(type => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];

    @OneToMany(type => Article, article => article.createdByUser)
    articles: Article[];

    @ManyToMany(() => Article)
    likedArticles: Article[];
}