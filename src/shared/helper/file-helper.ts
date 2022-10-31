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