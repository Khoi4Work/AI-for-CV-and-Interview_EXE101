const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const OUTPUT_SIZE = 512;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Không thể đọc ảnh này. Vui lòng chọn ảnh khác.'));
        image.src = dataUrl;
    });
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không thể đọc ảnh này. Vui lòng thử lại.'));
        reader.readAsDataURL(file);
    });
}

/** Validate and center-crop a portrait into a compact square data URL for preview and print. */
export async function prepareProfilePhoto(file) {
    if (!file || !ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
        throw new Error('Ảnh hồ sơ chỉ hỗ trợ định dạng JPG, PNG hoặc WebP.');
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
        throw new Error('Ảnh hồ sơ tối đa 5 MB.');
    }

    const image = await loadImage(await readFileAsDataUrl(file));
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    if (!side) throw new Error('Ảnh không có kích thước hợp lệ.');

    const sourceX = (image.naturalWidth - side) / 2;
    const sourceY = (image.naturalHeight - side) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Không thể xử lý ảnh trên trình duyệt này.');

    context.drawImage(image, sourceX, sourceY, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    const webp = canvas.toDataURL('image/webp', 0.88);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.88);
}
