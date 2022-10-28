import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { fileMimetypeFilter } from "../helper/file-mimetype-filter";
import { v4 as uuidv4 } from 'uuid';


export function ApiFile(
    fieldName: string = 'file',
    required: boolean = false,
    localOptions?: MulterOptions,
) {
    return applyDecorators(
        UseInterceptors(FileInterceptor(fieldName, localOptions)),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                required: required ? [fieldName] : [],
                properties: {
                    [fieldName]: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        })
    );
}

export function ApiImageFile(
    fileName: string = 'image',
    required: boolean = false,
    destination: string
) {
    return ApiFile(fileName, required, {
        fileFilter: fileMimetypeFilter('image'),
        storage: diskStorage({
            destination, filename(req, file, callback) {
                const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);

                const fileName = uuidv4() + fileExtension;

                callback(null, fileName);
            },
        }),
    });
}