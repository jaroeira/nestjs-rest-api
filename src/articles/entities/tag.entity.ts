import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./article.entity";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    tagName: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToMany(() => Article)
    articles: Article[];
}