import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./article.entity";

@Entity()
export class ArticleImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => Article, (article) => article.images, { onDelete: 'CASCADE' })
    article: Article;

    @CreateDateColumn()
    createdAt: Date;
}