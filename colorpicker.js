'use strict';

/**
 * @author Niklas Seppälä
 * @date 22.03.2019
 * @license MIT
 * 
 *  This is a script that creates colorpicker using predefined
 *  HTML5 elements. Script only adds functionality to those elements.
 *  Colorpicker operates with two canvases. Colorbox and colorslider.
 *  User uses slider to select base color and then selects color from
 *  colorbox. Colorbox adds ligth and dark gradients to base color.
 *  Selected color's data is displayd in following formats:

 *     color's red-value
 *     color's blue-value
 *     color's green-value
 *     RGB-value
 *     Hexadecimal-value.
 *     
 *  Colors can be saved to 10 fields that hold color's hexadecimal
 *  value and sample of that color.
 */


var sidePanelHidden = true;
var flag = false;
var movedElement = null;
var savedColorIndex = 0;

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
    var nums = RGB_string.match(/\d+/g).map(Number);
    var results = "#";
    nums.forEach(number => {
        results += number.toString(16).length < 2 ?  "0" + number.toString(16) : number.toString(16);
    });
    return results;
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
        let values = color.match(/\d+/g).map(Number);
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

    var R = parseInt(color.substring(1, 3), 16);
    var G = parseInt(color.substring(3, 5), 16);
    var B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length < 2) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length < 2) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length < 2) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

//----------------------------------------------------------------------------//


//--------------------------- DOCUMENT READY ---------------------------------//

$(function () {

    // color box and slider canvas elements
    var colorBoxCanvas = $("#color-main");
    var colorSliderCanvas = $(".color-slider");

    // color box and slider pointer elements
    var boxPointer = $("#box-pointer");
    var sliderPointer = $("#slider-pointer");

    // Color box and slider canvas context.
    var colorBox = document.getElementById("color-main");
    var boxContext = colorBox.getContext("2d");
    var colorSlider = document.getElementsByClassName("color-slider")[0];
    var sliderContex = colorSlider.getContext("2d");

    // Color box and slider measurements.
    var boxWidth = colorBox.width;
    var boxHeigth = colorBox.height;
    var sliderWidth = colorSlider.width;
    var sliderHeigth = colorSlider.height;

    // Initialization of components.
    setUpSlider(); // Creates Color-strip to colorslider canvas.
    setPointers(); // Changes pointers absolute position to be on top of color areas.
    changeColor(); // Creates colorbox with light and dark gradients. 
    selectColor(); // Sets color result.
    savedColorEvents(); // Sets eventhandlers to color results.


    /**
    * Box pointer mousedown eventhandler.
    * Changes flag to true.
    * Sets event-target as moved element variable.
    * Hides cursor.
    */
    $(boxPointer).mousedown(function () {
        flag = true;
        movedElement = boxPointer;
        $("body").css("cursor", "none");
    });


    /**
    * Box pointer mousedown eventhandler.
    * Changes flag to true.
    * Sets event-target as moved element variable.
    * Hides cursor.
    */
    $(sliderPointer).mousedown(function () {
        flag = true;
        movedElement = sliderPointer;
        $("body").css("cursor", "none");
    });


    /**
     * Document mouse move eventhandler.
     * If flag is set to true, moves element stored in movedElement.
     */
    $(document).mousemove(function (event) {
        if (flag) {
            if (movedElement == boxPointer) moveBoxPointer(movedElement, event);
            else moveSliderPointer(movedElement, event);
        }
    });


    /**
     * Stops dragging.
     * Sets cursor to visible.
     */
    $(document).mouseup(function () {
        flag = false;
        movedElement = null;
        $("body").css("cursor", "auto");
    });


    /**
     * Drags box pointer. Restricts movement to inside of the
     * color box.
     * @param {Element} pointer Box pointer element 
     * @param {Event}   event   Fired event
     */
    function moveBoxPointer(pointer, event) {

        var pointerHeigth = $(pointer).height();
        var pointerWidth = $(pointer).width();

        var canvasOffset = $(colorBoxCanvas).offset();
        var containerBottom = canvasOffset.top + $(colorBoxCanvas).height();
        var containerRigth = canvasOffset.left + $(colorBoxCanvas).width();

        moveIn_Y_axis();
        moveIn_X_axis();
        selectColor();

        /**
         * Makes sure that pointer stays inside the box Y-axis.
         * Moves pointer to cursor position.
         */
        function moveIn_Y_axis() {
            if (event.pageY >= canvasOffset.top && event.pageY <= containerBottom)
                $(pointer).css("top", event.pageY - pointerHeigth / 2 + "px");
            else 
                (event.pageY <= canvasOffset.top) ? $(pointer).css("top", canvasOffset.top - pointerHeigth / 2 + "px")
                                                  : $(pointer).css("top", containerBottom - pointerHeigth / 2 + "px");
        }

        /**
         * Makes sure that pointer stays inside the box X-axis.
         * Moves pointer to cursor location.
         */
        function moveIn_X_axis() {

            if (event.pageX >= canvasOffset.left && event.pageX <= containerRigth)
                $(pointer).css("left", event.pageX - pointerWidth / 2 + "px");
            else 
                (event.pageX <= canvasOffset.left) ? $(pointer).css("left", (canvasOffset.left - pointerWidth / 2) + "px")
                                                   : $(pointer).css("left", (containerRigth - pointerWidth / 2) + "px"); 
        }
    }

    
    /**
     * Drags skider pointer. Restricts movement to inside of the
     * color box. Only moves in X-axis.
     * @param {Element} pointer 
     * @param {Event} event 
     */
    function moveSliderPointer(pointer, event) {

        var pointerWidth = $(pointer).width();
        var canvasOffSet = $(colorSliderCanvas).offset();
        var canvasRigth = canvasOffSet.left + $(colorSliderCanvas).width();

        moveIn_X_axis();
        changeColor();
        selectColor();

        /**
         * Makes sure that pointer stays inside the slider X-axis.
         * Moves pointer to cursor location.
         */
        function moveIn_X_axis() {

            if (event.pageX >= canvasOffSet.left && event.pageX <= canvasRigth)
                $(pointer).css("left", event.pageX - pointerWidth / 2 + "px");
            else 
                (event.pageX <= canvasOffSet.left) ? $(pointer).css("left", (canvasOffSet.left - pointerWidth / 2) + "px")
                                                   : $(pointer).css("left", (canvasRigth - pointerWidth / 2) - 3 + "px");
        }
    }


    /**
     * Sets up the color slider.
     * Draws color-strip to colorslider canvas.
     */
    function setUpSlider() {

        sliderContex.rect(0, 0, sliderWidth, sliderHeigth);
        var rainbowGrd = sliderContex.createLinearGradient(0, 0, sliderWidth, 0);

        rainbowGrd.addColorStop(0,     'rgba(255, 0,   0,   1)');
        rainbowGrd.addColorStop(0.05,  'rgba(255, 0,   0,   1)');
        rainbowGrd.addColorStop(0.17,  'rgba(255, 255, 0,   1)');
        rainbowGrd.addColorStop(0.175, 'rgba(255, 255, 0,   1)');
        rainbowGrd.addColorStop(0.34,  'rgba(0,   255, 0,   1)');
        rainbowGrd.addColorStop(0.345, 'rgba(0,   255, 0,   1)');
        rainbowGrd.addColorStop(0.51,  'rgba(0,   255, 255, 1)');
        rainbowGrd.addColorStop(0.515, 'rgba(0,   255, 255, 1)');
        rainbowGrd.addColorStop(0.68,  'rgba(0,   0,   255, 1)');
        rainbowGrd.addColorStop(0.685, 'rgba(0,   0,   255, 1)');
        rainbowGrd.addColorStop(0.85,  'rgba(255, 0,   255, 1)');
        rainbowGrd.addColorStop(0.855, 'rgba(255, 0,   255, 1)');
        rainbowGrd.addColorStop(0.995, 'rgba(255, 0,   0,   1)');
        rainbowGrd.addColorStop(1,     'rgba(255, 0,   0,   1)');

        sliderContex.fillStyle = rainbowGrd;
        sliderContex.fill();
    }


    /**
     * Moves color pointers to their start-positions inside 
     * color box and color slider.
     */
    function setPointers() {

        let boxOffset = $(colorBoxCanvas).offset();

        // Colorbox measurements.
        let boxWidth = $(colorBoxCanvas).width();
        let bPWidth = $(boxPointer).width();

        $(boxPointer).css("top", boxOffset.top + bPWidth + "px");
        $(boxPointer).css("left", boxOffset.left + boxWidth - bPWidth * 2 + "px");

        // Colorslider measurements.
        let sliderPos = $(colorSliderCanvas).offset();
        let sPHeigth = $(sliderPointer).height();

        $(sliderPointer).css("top", sliderPos.top - sPHeigth / 6 + "px");
        $(sliderPointer).css("left", sliderPos.left + 10 + "px");
    }

    /**
     * Creates color gradients to color-box.
     * @param {string} color Box color. 
     */
    function fillGradientColor(color) {

        boxContext.rect(0, 0, boxWidth, boxHeigth);
        boxContext.fillStyle = color;
        boxContext.fillRect(0, 0, boxWidth, boxHeigth);

        // Ligth gradient.
        var ligth = boxContext.createLinearGradient(0, 0, (boxWidth / 2) + (boxWidth / 4), 0);
        ligth.addColorStop(0, 'rgba(255,255,255, 1)');
        ligth.addColorStop(0.05, 'rgba(255,255,255, 1)');
        ligth.addColorStop(1, 'rgba(255,255,255, 0)');
        boxContext.fillStyle = ligth;
        boxContext.fillRect(0, 0, boxWidth, boxHeigth);

        // Dark gradient.
        var dark = boxContext.createLinearGradient(0, 0, 0, boxHeigth);
        dark.addColorStop(0, 'rgba(0,0,0,0)');
        dark.addColorStop(0.05, 'rgba(0,0,0,0)');
        dark.addColorStop(0.95, 'rgba(0,0,0,1)');
        boxContext.fillStyle = dark;
        boxContext.fillRect(0, 0, boxWidth, boxHeigth);
    }


    /**
     * Selects color from colorbox. Displays 
     * result in color-result div.
     */
    function selectColor() {

        let boxOffset = $(colorBoxCanvas).offset();
        let x = $(boxPointer).offset().left + $(boxPointer).width() / 2 - boxOffset.left;
        let y = $(boxPointer).offset().top + $(boxPointer).width() / 2 - boxOffset.top;

        let pixel = boxContext.getImageData(x, y, 1, 1).data;
        let bgColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";

        displayColorData(pixel, bgColor);

        let hexColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
        $("#color-result").text('#' + ('0000' + hexColor.toString(16)).substr(-6));
        $("#color-result").val('#' + ('0000' + hexColor.toString(16)).substr(-6));
        $("#box-pointer").css("background", hexColor);

        if (pixel[0] + pixel[1] + pixel[2] < 150) {
            $("#color-result").css("color", "white");
            $("#box-pointer").css("border-color", "white")
        }
        else {
            $("#color-result").css("color", "black");
            $("#box-pointer").css("border-color", "#020408")
        }
    }


    /**
     * Displays color's data to user.
     * Sets selected color as sample's background color.
     */
    function displayColorData(pixel, bgColor) {

        var labels = $(".color-val-inpt");

        labels[0].innerText = pixel[0];
        labels[1].innerText = pixel[1]; 
        labels[2].innerText = pixel[2];
        labels[3].innerText = pixel[0] + "," + pixel[1] + "," + pixel[2];
        labels[4].innerText = RGBtoHex(bgColor);

        $("#color-result").css("background", bgColor);
    }


    /**
     * Changes color in colorbox based on colorslider pointer
     * position inside color strip.
     */
    function changeColor() {

        let sliderOffset = $(colorSliderCanvas).offset();
        let sliderP = $(sliderPointer);
        let sliderP_offset = sliderP.offset();

        let x = (sliderP_offset.left + sliderP.width() / 2 + 1 - sliderOffset.left);
        let y = (sliderP_offset.top + 5 - sliderOffset.top);

        let pixel = sliderContex.getImageData(x, y, 1, 1).data;
        let bgColor = "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";

        fillGradientColor(bgColor); 
        $("#slider-pointer").css("background", bgColor);
    }


    /**
     * Resized eventhandler for window.
     * Fixes pointer locations everytime window is resized.
     */
    $(window).resize(function () {
        setPointers();
        changeColor();
        selectColor();
    });


    /**
     * Click eventhandler for colorbox.
     * When clicked, pointer appears immediately on cursor location. 
     */
    $(colorBoxCanvas).click(function (event) {

        $("#box-pointer").css("top", event.pageY - $("#box-pointer").width() / 2 + "px");
        $("#box-pointer").css("left", event.pageX - $("#box-pointer").width() / 2 + "px");

        // update color result
        selectColor();
    });


    /**
     * Click eventhandler for colorslider.
     * When clicked, pointer appears immediately on cursor location. 
     */
    $(colorSliderCanvas).click(function (event) {

        $("#slider-pointer").css("left", event.pageX - $("#slider-pointer").width() / 2 + "px");
        
        // Update color results.
        changeColor();
        selectColor();
    });


    /**
     * Click eventhandler for color result div.
     * Saves to one of the saved-color divs.
     * Next save target rotates by savedColorIndex.
     */
    $("#color-result").click(function (e) {
        $(".saved-color")[savedColorIndex].getElementsByTagName("label")[0].innerText = e.target.value;
        $($(".saved-color")[savedColorIndex].getElementsByTagName("div")).css("background", e.target.value);

        // rotate saved index.
        (savedColorIndex < 9) ? savedColorIndex++ : savedColorIndex = 0;
    });


    /**
     * Sets click eventhandlers to saved color elements.
     */
    function savedColorEvents() {

        var colors = $(".saved-color");
        var sideColors = $("#color-side-panel > div");
        var backgroundColor;

        // Set eventhandlers to each saved color-result.
        $.each(colors, function (i, elem) {

            /**
             * Click-eventhandler.
             * 
             * Once user clicks one of the saved color-divs,
             * event fires that toggles sidepanel to the rigth of
             * the main app-window. This sidepanel displays sligthly ligther
             * and darker variations of saved color.
             * 
             * Panel contains five brigther and five darker colors.
             * Original color is located in between of ligther and darker
             * variations.
             * 
             * Once sidepanel is visible, another click-event or loss of focus
             * hides panel. VISIBLE/HIDDEN-state can be monitored with sidePanelHidden-flag.
             */
            $(elem).click(function (e) {
                backgroundColor = defineBackgroundColor(e);

                if (sidePanelHidden) {
                    // Sidepanel is closed. Lets create one and change it to visible.

                    var shadedColor = backgroundColor;
                    var brigthColor = backgroundColor;

                    $(sideColors[5]).css("background", shadedColor);
                    $(sideColors[5].firstChild).text(shadedColor);

                    getBrightness(shadedColor) < 170 ? sideColors[5].firstChild.style.color = "#e6e6e6"
                                                     : sideColors[5].firstChild.style.color = "#000000";

                    // Creates and displays 5 brighter colors.
                    for (let i = 4; i >= 0; i--)
                        brigthColor = addShade(brigthColor, i, 15);

                    // Creates and displays 5 darker colors.
                    for (let i = 6; i < sideColors.length; i++)
                        shadedColor = addShade(shadedColor, i, -15);

                    // Changes sidepanel to visible and togles visibility flag to false.
                    $("#color-side-panel").css("visibility", "visible");
                    sidePanelHidden = false;
                }

                // Sidepanel is open. Let's close it.
                else {
                    // Changes sidepanel to hidden and toggles visibility flag to true;
                    $("#color-side-panel").css("visibility", "hidden");
                    sidePanelHidden = true;
                }
            });
        });


        /**
         * Helper function to determine who set off the event.
         * 
         * If event source was color-div, color format is in rgb.
         * Else color format is hexadecimal, and can be returned as the
         * result. RGB needs to be converted using RGBtoHex(color) function.
         * @param {Event} event 
         */
        function defineBackgroundColor(event) {

            switch (event.target.className) {
                case "color-value":
                    return event.target.innerText;
                case "saved-sample":
                    return RGBtoHex(event.target.style.background);
                default:
                    return event.target.getElementsByTagName("label")[0].innerText;
            }
        }


        /**
         * This function adds shade to given color ands sets
         * it as background of i:th element.
         * 
         * Also sets color value
         * as i:th elements label value. Computes if labelcolor needs
         * to be brigth or dark and sets color style accordingly.
         * 
         * Finally returns manipulated color so it is up to date in next
         * function call.
         * 
         * @param   {string} color   Color to be shaded. RGB or Hexadecimal. 
         * @param   {number} index   Div index.
         * @param   {number} percent Percentual shading effect.
         * @returns {string} Shaded color.
         */
        function addShade(color, index, percent) {
            var colorElem = sideColors[index].firstChild;
            color = shadeColor(color, percent);

            $(sideColors[index]).css("background", color);
            colorElem.innerText = color;
            getBrightness(color) < 170 ? $(colorElem).css("color", "#e6e6e6")
                                       : $(colorElem).css("color", "#000000");
            return color;
        }
    }
});
