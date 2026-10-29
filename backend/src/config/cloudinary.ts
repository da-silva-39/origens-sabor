import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface StorageOptions {
  folder: string;
  allowedFormats: string[];
  transformation: Array<Record<string, unknown>>;
}

function createCloudinaryStorage({ folder, allowedFormats, transformation }: StorageOptions): multer.StorageEngine {
  return {
    _handleFile(_req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          allowed_formats: allowedFormats,
          transformation: transformation as any,
        },
        (error, result) => {
          if (error) return cb(error);
          if (!result) return cb(new Error('Falha no upload para o Cloudinary'));
          cb(null, {
            path: result.secure_url,
            filename: result.public_id,
            size: result.bytes,
          });
        }
      );

      file.stream.pipe(uploadStream);
    },
    _removeFile(_req, file, cb) {
      if (!file.filename) return cb(null);
      cloudinary.uploader.destroy(file.filename, (error) => cb(error));
    },
  };
}

const profileStorage = createCloudinaryStorage({
  folder: 'origens-sabor/perfil',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 300, height: 300, crop: 'limit' }],
});

const productStorage = createCloudinaryStorage({
  folder: 'origens-sabor/produtos',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  transformation: [{ width: 800, height: 800, crop: 'limit' }],
});

export const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadProduct = multer({ storage: productStorage, limits: { fileSize: 5 * 1024 * 1024 } });
