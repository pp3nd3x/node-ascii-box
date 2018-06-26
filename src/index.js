// +---------------------------------------------+
// |                                             |
// |  ASCII-BOX - 2018                           |
// |  Utility to print boxes in the console      |
// |                                             |
// +---------------------------------------------+

/* eslint-disable no-control-regex */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-mixed-operators */
import boxes from 'cli-boxes';
import colors from 'colors';
import { extraBoxes } from './extraBoxes';

/**
 * Function getContent
 * Get the formatted content for the passed message
 * @todo update to use str.padStart() and str.padEnd()
 * @ignore internal helper
 * @param {string} msg
 * @param {number} maxlength
 * @param {object} borders
 * @param {number} padding
 * @return {string}
 */
const getContent = (msg, maxlength, borders, padding) => {
  const matchPattern = new RegExp(`(.{${maxlength}})`, 'gi');
  return msg
    .split('\n')
    .map(line => (line.length > maxlength ? line.replace(matchPattern, '$1\n') : line))
    .join('\n')
    .split('\n')
    .map(line => {
      const bits = line.match(/(\x1b\[.{1,2}m)/gi) ? line.match(/(\x1b\[.{1,2}m)/gi).length : 0;
      const extra = parseInt(maxlength - line.length + parseInt(bits * 5, 10), 10);
      const content = `${' '.repeat(padding / 2)}${line}${' '.repeat(padding / 2)}`;
      return line.length < maxlength
        ? `${borders.vertical}${content}${' '.repeat(extra)}${borders.vertical}`
        : `${borders.vertical}${content}${borders.vertical}`;
    });
};

/**
 * Function getMaxLength
 * Get the max length for line based on longest line or the console width
 * @ignore internal helper
 * @param {array} msgArray
 * @param {number} padding
 * @param {number} minWidth
 * @param {number} maxWidth
 */
const getMaxLength = (msgArray, padding, minWidth, maxWidth) => {
  const lineLength =
    msgArray.reduce((acc, curr) => (curr.length > acc ? curr.length : acc), 0) + padding;
  const maxlengthContent = lineLength > minWidth ? lineLength : minWidth;
  const maxViewport = maxWidth < process.stdout.columns ? maxWidth : process.stdout.columns;
  return maxlengthContent < maxViewport ? maxlengthContent : maxViewport - 2 * padding;
};

/**
 * Function draw
 * Draws the box given the dimensions, borders and message
 * @ignore internal helper
 * @param {string} msg
 * @param {object} borders
 * @param {number} padding
 * @param {number} minWidth
 * @param {number} maxWidth
 */
const draw = (msg, borders, padding, minWidth, maxWidth) => {
  // --
  const shape = [];
  const msgArray = msg.split('\n');
  const maxlength = getMaxLength(msgArray, padding, minWidth, maxWidth);
  const borderHorizontal = `${borders.horizontal.repeat(maxlength + padding)}`;
  const blanklines = `${' '.repeat(maxlength + padding)}`;
  const boxcontent = getContent(msg, maxlength, borders, padding);

  // --
  shape.push(`${borders.topLeft}${borderHorizontal}${borders.topRight}`);
  shape.push(`${borders.vertical}${blanklines}${borders.vertical}`);
  shape.push(...boxcontent);
  shape.push(`${borders.vertical}${blanklines}${borders.vertical}`);
  shape.push(`${borders.bottomLeft}${borderHorizontal}${borders.bottomRight}`);

  return shape.join('\n');
};

/**
 * box
 * Returns an ascii-box wrapping the passed message
 * @param {string} msg
 * @param {Object} opts
 * @param {string} opts.border - single, double, code, round, dotted, retro, single-double, double-single
 * @param {string} opts.color - green, red, blue, cyan, magenta, gray, black, white
 * @param {number} opts.padding
 * @param {number} opts.minWidth
 * @param {number} opts.maxWidth
 */
function box(msg, opts) {
  const defaultOpts = {
    border: 'classic', // single, double, code, round, dotted, retro, single-double, double-single
    color: 'none', // green, red, blue, cyan, magenta, gray, black, white
    padding: 4,
    minWidth: 20,
    maxWidth: 80
  };

  try {
    const allBoxes = { ...boxes, ...extraBoxes };
    const tableOpts = { ...defaultOpts, ...opts };
    let borders = allBoxes[tableOpts.border];
    const { padding, minWidth, maxWidth } = { ...tableOpts };

    if (tableOpts.color !== 'none') {
      borders = Object.entries(borders).reduce((acc, [key, val]) => {
        acc[key] = colors[tableOpts.color](val);
        return acc;
      }, {});
    }

    return draw(msg, borders, padding, minWidth, maxWidth);
  } catch (_) {
    return `(no-table)\n${msg}`;
  }
}

export { box };
