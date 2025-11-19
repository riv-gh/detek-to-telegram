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


/**
 * Экранирует специальные символы MarkdownV2 в тексте
 * @param {string} text - входящий текст
 * @returns {string} - текст с экранированными символами
 */
function escapeMarkdownV2(text) {
  // список спецсимволов, которые нужно экранировать
  const escapeChars = [
    '_', '*', '[', ']', '(', ')', '~', '`', '>', '#',
    '+', '-', '=', '|', '{', '}', '.', '!'
  ];

  let escaped = text;
  escapeChars.forEach(char => {
    const regex = new RegExp(`\\${char}`, 'g'); // ищем все вхождения
    escaped = escaped.replace(regex, `\\${char}`); // добавляем обратный слэш
  });

  return escaped;
}

/**
 * віделение по регулярному выражению в тексте для MarkdownV2
 * @param {string} inputText - входящий текст
 * @param {RegExp} [regex=/\b([0-2]\d:[0-5]\d)\b/g] - регулярное выражение для поиска
 * (по умолчанию время в формате HH:MM)
 * @param {string} [highlightTpl='__*$1*__'] - шаблон для выделения (по умолчанию __*$1*__)
 * @returns {string} - текст с выделенными данными в формате MarkdownV2
 */
function highlightDatesMarkdown(
  inputText,
  regex = /\b([0-2]\d:[0-5]\d)\b/g,
  highlightTpl = '__*$1*__'
) {
  // Заменяем найденные совпадения на выделенные в Markdown
  return escapeMarkdownV2(inputText).replace(regex, highlightTpl);
}



export {
    addWhiteBorderToImage,
    delay,
    escapeMarkdownV2,
    highlightDatesMarkdown,
};