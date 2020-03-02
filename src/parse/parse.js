/**
 * Finds tag ending position
 *
 * @param {String} text Input text.
 * @param {Number} startPosition Starting position of tag.
 * @returns {Number} Position.
 */
const findTagEndingPosition = (text, startPosition) => {
  let endPosition = startPosition;

  while (endPosition < text.length && text[endPosition] !== '>') {
    endPosition += 1;
  }

  return endPosition;
};

/**
 * Finds token ending position.
 *
 * @param {String} text Input text.
 * @param {Number} startPosition Starting position of token.
 * @param {String[]} delimiters Delimiters array.
 * @returns {Number} Position.
 */
const findTokenEndingPosition = (text, startPosition, delimiters) => {
  let endPosition = startPosition;

  while (endPosition < text.length && !delimiters.includes(text[endPosition]) && text[endPosition] !== '<') {
    endPosition += 1;
  }

  return endPosition - 1;
};

/**
 * Tests if token is in list of ignore words.
 *
 * @param {Array<String | RegExp>} ignoreWords List of words to ignore.
 * @param {String} token Token.
 * @returns {Boolean} True if is in list.
 */
const checkIgnoredWords = (ignoreWords, token) => ignoreWords.some((ignoreWord) => {
  if (ignoreWord instanceof RegExp) {
    return ignoreWord.test(token);
  }

  return ignoreWord === token;
});

/**
 * Parses text.
 *
 * @param {String} text Input text.
 * @param {Object} params Params object.
 * @returns {Promise<Object>}
 */
const parse = async (
  text,
  params = {},
) => {
  console.time('parsing');
  console.log('Started parsing text');

  const mergedParams = {
    delimiters: [' ', '\n', '\r', '\t', ',', '.'],
    startPosition: 0,
    minimalLength: 2,
    ignoreWords: [],
    modules: {},
    ...params,
  };

  if ('tokens' in mergedParams.modules) {
    throw new Error('Module cannot be named tokens');
  }

  const result = {
    tokens: {},
  };
  const modules = Object.entries(mergedParams.modules);
  modules.forEach(([moduleName]) => { result[moduleName] = null; });

  let position = mergedParams.startPosition;

  while (position < text.length) {
    console.timeLog('parsing');

    if (mergedParams.delimiters.includes(text[position])) {
      console.info(`Found delimiter ${text[position]} at position ${position}`);

      position += 1;
    } else if (text[position] === '<') {
      console.info(`Found HTML tag at position ${position}`);

      position = findTagEndingPosition(text, position) + 1;
    } else {
      const tokenEndingPosition = findTokenEndingPosition(text, position, mergedParams.delimiters);
      const token = text.substring(position, tokenEndingPosition + 1).toLowerCase();

      console.info(`Found token '${token}' at position ${position}`);

      if (token.length < mergedParams.minimalLength) {
        console.info(`Token ${token} at ${position} has too small length`);
      } else if (checkIgnoredWords(mergedParams.ignoreWords, token)) {
        console.info(`Token ${token} at ${position} is ignored`);
      } else {
        console.info(`Token '${token}' at ${position} is valid`);

        result.tokens[token] = result.tokens[token]
          ? result.tokens[token] + 1
          : 1;

        // eslint-disable-next-line no-await-in-loop, no-loop-func
        await modules.forEach(async ([moduleName, moduleMethod]) => {
          console.time(moduleName);

          result[moduleName] = await moduleMethod(result[moduleName], token, position);

          console.timeEnd(moduleName);
        });

        console.info(`Current result is ${JSON.stringify(result)}`);
      }

      position = tokenEndingPosition + 1;
    }

    console.info(`Next position is ${position}`);
  }

  console.log('Finished parsing text');
  console.timeEnd('parsing');

  return result;
};

export default parse;
