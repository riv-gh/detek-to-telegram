import sharp from 'sharp';

/**
 * Добавляет белые края к изображению из буфера
 * @param {Buffer} imageBuffer - исходное изображение
 * @param {number} padding - размер отступа (px)
 * @returns {Buffer} - новое изображение с белыми краями
 */
async function addWhiteBorderToImage(imageBuffer, padding = 20) {
  const img = sharp(imageBuffer);

  // Получаем размеры исходного изображения
  const metadata = await img.metadata();

  // Создаём белый фон большего размера
  const extended = await img
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // белый цвет
    })
    .toBuffer();

  return extended;
}

/**
 * Дает задержку в милисикундах через Promise
 * @param {number} ms - задержка в милисекундах
 */
function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}


export {
    addWhiteBorderToImage,
    delay,
};