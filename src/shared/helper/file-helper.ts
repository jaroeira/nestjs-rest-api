import * as fsPromises from 'fs/promises';
import { configService } from '../../config/config.service';

export async function deleteFile(filePath: string): Promise<void> {
    try {
        await fsPromises.unlink(filePath);
    } catch (error) {
        console.log('deleteFile', error)
    }
}

export async function deleteAvatarImage(avatarImageUrl: string): Promise<void> {
    const fileName = avatarImageUrl.substring(avatarImageUrl.lastIndexOf('/') + 1, avatarImageUrl.length);
    const filePath = `${configService.getUserAvatarUploadFolder()}/${fileName}`;
    await deleteFile(filePath);
}


export async function deleteArticleImage(articleImageUrl: string): Promise<void> {
    const fileName = articleImageUrl.substring(articleImageUrl.lastIndexOf('/') + 1, articleImageUrl.length);
    const filePath = `${configService.getArticleUploadFolder()}/${fileName}`;
    await deleteFile(filePath);
}

export async function deleteArticleImages(articleImageUrls: string[]) {
    const promises: Promise<void>[] = [];

    for (const articleImageUrl of articleImageUrls) {
        promises.push(deleteArticleImage(articleImageUrl));
    }

    await Promise.all(promises);
}

export async function exists(path: string): Promise<boolean> {
    try {
        await fsPromises.access(path);
        return true;
    } catch {
        return false;
    }
}