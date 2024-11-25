import fs from 'fs';
import path from 'path';

export const uploadImage = async (imageFile: Express.Multer.File): Promise<string> => {
    const uploadsDir = path.join(process.cwd(), 'public/uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${imageFile.originalname}`;
    const filePath = path.join(uploadsDir, filename);

    // Save the file
    fs.writeFileSync(filePath, imageFile.buffer);

    return `/uploads/${filename}`; // Return relative path for the saved image
};