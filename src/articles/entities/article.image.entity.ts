import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./article.entity";

@Entity()
export class ArticleImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    imageUrl: string;

    @ManyToOne(type => Article, (user) => user.images, { onDelete: 'CASCADE' })
    article: Article;

    @CreateDateColumn()
    createdAt: Date;
}