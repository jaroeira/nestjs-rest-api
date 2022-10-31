import { User } from "../../users/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ArticleImage } from "./article.image.entity";
import { Tag } from "./tag.entity";


@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('text')
    content: string;

    @ManyToOne(type => User, (user) => user.articles, { onDelete: 'CASCADE' })
    createdByUser: User;

    @OneToMany(type => ArticleImage, image => image.article)
    images: ArticleImage[];

    @ManyToMany(() => User)
    @JoinTable()
    likedBy: User[];

    @ManyToMany(() => Tag)
    @JoinTable()
    tags: Tag[];

    @CreateDateColumn()
    createdAt: Date;
}