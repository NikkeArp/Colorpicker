'use strict';

//----------------------- GLOBAL FUNCTIONS -------------------------// 

/**
 * Transmutes RGB-values to hexadecimal format.
 * 
 * Parses rgb values to list.
 * Appends values in hexadecimal to result string.
 *  
 * @param   {string} RGB_string Color in rgb.
 * @returns {string} (#)Hexadecimal color value.
 */
function RGBtoHex(RGB_string) {
    const nums = RGB_string.match(/\d+/g).map(Number);
    let results = "#";
    nums.forEach(number => {
        results += number.toString(16).length < 2 ?  "0" + number.toString(16) : number.toString(16);
    });
    return results;
}

/**
 * Converts an array of rgb values to hexadecimal string.
 * 
 * @param {*} array array of red, green and blue values
 * @param {boolean} aplha include aplha 
 */
function RGB_ArrayToHex(array, aplha=false) {
    let length;
    aplha ? length = 4 : length = 3;
    let result = "#";
    for (let i = 0; i < length; i++)
        result += array[i].toString(16).length < 2 ? "0" + array[i].toString(16) : array[i].toString(16);
    return result;
}

/**
 * Computes color's brightness by adding up
 * Colors RGB values.
 * 
 * @param   {string} color Color
 * @returns {number} Color's brightness. 
 */
function getBrightness(color) {

    if (color.includes("#")) {
        return parseInt(color.substring(1, 3), 16) +
            parseInt(color.substring(3, 5), 16) +
            parseInt(color.substring(5, 7), 16);
    }
    else if (color.includes("rgb")) {
        let result = 0;
        const values = color.match(/\d+/g).map(Number);
        values.forEach(value => { result += value });
        return result;
    }
    return "incorrect input";
}

/**
 *  Shades given color percentually. Allowed
 *  color formats are rgb and hexadecimal.
 *  Negative percent argument darkens color,
 *  positive brightens it.
 * 
 * @param   {string} color     RGB or (#)hexadecimal.
 * @param   {number} percent   Percentual effect of shading.
 * @returns {string}           Shaded color in hexadecimal.
 */
function shadeColor(color, percent) {
    color = (color.includes("rgb")) ? RGBtoHex(color) : color;
    const rgb = [parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5, 7), 16)
    ];
    for (let i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(rgb[i] * (100 + percent) / 100);
        rgb[i] = rgb[i] < 255 ? rgb[i] : 255;        
    }
    return RGB_ArrayToHex(rgb);
}

/**
 * Invokes arrow-function
 * @param {*} func anon function
 */
function invoke(func) { func(); }
