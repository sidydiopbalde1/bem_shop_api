import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File, folder = 'products'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  uploadFiles(files: Express.Multer.File[], folder = 'products'): Promise<UploadApiResponse[]> {
    return Promise.all(files.map((f) => this.uploadFile(f, folder)));
  }
}
