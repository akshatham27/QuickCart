import { v2 as cloudinary } from 'cloudinary';

// Add debug logging for configuration
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

// Detailed configuration logging
console.log('Detailed Cloudinary Configuration Check:', {
    cloud_name: {
        value: cloudinaryConfig.cloud_name,
        status: cloudinaryConfig.cloud_name ? '✓ Present' : '✗ Missing'
    },
    api_key: {
        value: cloudinaryConfig.api_key ? '****' + cloudinaryConfig.api_key.slice(-4) : undefined,
        status: cloudinaryConfig.api_key ? '✓ Present' : '✗ Missing'
    },
    api_secret: {
        status: cloudinaryConfig.api_secret ? '✓ Present' : '✗ Missing'
    }
});

if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    console.error('Missing Cloudinary configuration:', {
        cloud_name: !cloudinaryConfig.cloud_name,
        api_key: !cloudinaryConfig.api_key,
        api_secret: !cloudinaryConfig.api_secret
    });
    throw new Error('Missing required Cloudinary configuration. Please check your environment variables.');
}

cloudinary.config(cloudinaryConfig);

export const uploadToCloudinary = async (file) => {
    try {
        if (!file) {
            throw new Error('No file provided for upload');
        }

        // Log file details
        console.log('File details for upload:', {
            name: file.name,
            type: file.type,
            size: `${(file.size / 1024).toFixed(2)} KB`
        });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: 'auto',
                folder: 'quickcart',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ],
                unique_filename: true,
                overwrite: true,
                format: 'webp'
            };

            console.log('Starting Cloudinary upload with options:', uploadOptions);

            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', {
                            message: error.message,
                            http_code: error.http_code,
                            name: error.name
                        });
                        reject(new Error(`Failed to upload image: ${error.message}`));
                    } else {
                        console.log('Cloudinary upload success:', {
                            url: result.secure_url,
                            publicId: result.public_id,
                            format: result.format,
                            size: `${(result.bytes / 1024).toFixed(2)} KB`,
                            width: result.width,
                            height: result.height
                        });
                        resolve(result.secure_url);
                    }
                }
            );

            // Handle upload stream errors
            uploadStream.on('error', (error) => {
                console.error('Upload stream error:', error);
                reject(new Error(`Upload stream error: ${error.message}`));
            });

            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error('Error processing file for upload:', {
            message: error.message,
            stack: error.stack
        });
        throw new Error(`Failed to process file for upload: ${error.message}`);
    }
}; 