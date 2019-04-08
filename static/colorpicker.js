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


//--------------------------- DOCUMENT READY ---------------------------------//

$(function () {

    // color box and slider canvas elements
    const colorBoxCanvas = $("#color-main");
    const colorSliderCanvas = $("#color-slider");

    // color box and slider pointer elements
    const boxPointer = $("#box-pointer");
    const sliderPointer = $("#slider-pointer");

    // Color box and slider canvas context.
    const colorBox = document.getElementById("color-main");
    const boxContext = colorBox.getContext("2d");
    const colorSlider = document.getElementById("color-slider");
    const sliderContex = colorSlider.getContext("2d");

    // Dynamic props
    let sliderColor;
    let boxP_X;
    let boxP_Y;
    let sliderP_X;
    
    //---------- Initialization of components ---------------//

    setUpSlider(); // Creates Color-strip to colorslider canvas.
    fixPointers(colorBox.width - 20, 20, colorSlider.width / 3.5);
    changeColor(); // Creates colorbox with light and dark gradients. 
    selectColor(); // Sets color result.
    savedColorEvents(); // Sets eventhandlers to color results.    


    //------------- Pointer drag-movement events ------------------//
    var moveElement = null; // Moving element

    /**
    * Box pointer mousedown eventhandler.
    * Sets event-target as moved element variable.
    * Hides cursor.
    */
    $(boxPointer).mousedown(function () {
        moveElement = boxPointer;
        $("body").css("cursor", "none");
    });

    /**
    * Box pointer mousedown eventhandler.
    * Sets event-target as moved element variable.
    * Hides cursor.
    */
    $(sliderPointer).mousedown(function () {
        moveElement = sliderPointer;
        $("body").css("cursor", "none");
    });

    /**
     * Document mouse move eventhandler.
     * If movedElement is not null, moves element.
     */
    $(document).mousemove(function (event) {
        if (moveElement)
            moveElement === boxPointer ? moveBoxPointer(moveElement, event) : moveSliderPointer(moveElement, event)
    });

    /**
     * Stops dragging.
     * Sets cursor to visible.
     */
    $(document).mouseup(function () {
        moveElement = null;
        $("body").css("cursor", "auto");
    });


    //---------------- Box-pointer move implementation ----------------//

    /**
     * Drags box pointer. Restricts movement to inside of the
     * color box.
     * @param {Element} pointer Box pointer element 
     * @param {Event}   event   Fired event
     */
    function moveBoxPointer(pointer, event) {
        const pointerHeigth = $(pointer).height();
        const pointerWidth = $(pointer).width();
        const canvasOffset = $(colorBoxCanvas).offset();
        const containerBottom = canvasOffset.top + $(colorBoxCanvas).height();
        const containerRigth = canvasOffset.left + $(colorBoxCanvas).width();

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
    

    //---------------------- Slider-pointer movement implementation -------------------//

    /**
     * Drags slider-pointer. Restricts movement to inside of the
     * color box. Only moves in X-axis.
     * @param {Element} pointer 
     * @param {Event} event 
     */
    function moveSliderPointer(pointer, event) {
        const pointerWidth = $(pointer).width();
        const canvasOffSet = $(colorSliderCanvas).offset();
        const canvasRigth = canvasOffSet.left + $(colorSliderCanvas).width();

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


    //-------------------------- Draw canvas -------------------------//

    /**
     * Sets up the color slider.
     * Draws color-strip to colorslider canvas.
     */
    function setUpSlider() {
        sliderContex.rect(0, 0, colorSlider.width, colorSlider.height);
        const rainbowGrd = sliderContex.createLinearGradient(0, 0, colorSlider.width, 0);

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
     * Creates color gradients to color-box.
     * @param {string} bgColor Box color. 
     */
    function fillGradientColor(bgColor) {
        boxContext.rect(0, 0, colorBox.width, colorBox.height);
        boxContext.fillStyle = bgColor;
        boxContext.fillRect(0, 0, colorBox.width, colorBox.height);

        // Ligth gradient.
        let ligth = boxContext.createLinearGradient(0, 0, (colorBox.width / 2) + (colorBox.width / 4), 0);
        ligth.addColorStop(0, 'rgba(255,255,255, 1)');
        ligth.addColorStop(0.05, 'rgba(255,255,255, 1)');
        ligth.addColorStop(1, 'rgba(255,255,255, 0)');
        boxContext.fillStyle = ligth;
        boxContext.fillRect(0, 0, colorBox.width, colorBox.height);

        // Dark gradient.
        let dark = boxContext.createLinearGradient(0, 0, 0, colorBox.height);
        dark.addColorStop(0, 'rgba(0,0,0,0)');
        dark.addColorStop(0.05, 'rgba(0,0,0,0)');
        dark.addColorStop(0.95, 'rgba(0,0,0,1)');
        boxContext.fillStyle = dark;
        boxContext.fillRect(0, 0, colorBox.width, colorBox.height);
    }


    //---------------------- Pointers -------------------------------------//

    /**
     * Fixes absolute positions of box-pointer and slider-pointer.
     * Used when pointers need to adjust to new window-size. Function 
     * utilizes pointers previous canvas coordinates.
     * @param {number} boxPointerX box-pointer X-coordinate
     * @param {number} boxPointerY box-pointer Y-coordinate
     * @param {number} sliderPointerX slider-pointer X-coordinate
     */
    function fixPointers(boxPointerX, boxPointerY, sliderPointerX) {
        $(boxPointer).css("left", $(colorBoxCanvas).offset().left + boxPointerX - $(boxPointer).width() / 2 + "px");
        $(boxPointer).css("top", $(colorBoxCanvas).offset().top + boxPointerY - $(boxPointer).width() / 2 + "px");
        $(sliderPointer).css("left", $(colorSliderCanvas).offset().left + sliderPointerX - $(sliderPointer).width() / 2 + "px");
        $(sliderPointer).css("top", $(colorSliderCanvas).offset().top - $(sliderPointer).height() / 6 + "px");
    }

    //--------------------- Color change and selection ----------------------//
    
    /**
     * Selects color from colorbox. Displays 
     * result in color-result div.
     */
    function selectColor() {
        boxP_X = $(boxPointer).offset().left + $(boxPointer).width() / 2 - $(colorBoxCanvas).offset().left;
        boxP_Y = $(boxPointer).offset().top + $(boxPointer).width() / 2 - $(colorBoxCanvas).offset().top;
        const pixel = boxContext.getImageData(boxP_X, boxP_Y, 1, 1).data;
        const hexValue = RGB_ArrayToHex(pixel);

        displayColorData(pixel, hexValue);
        $("#color-result").text(hexValue);
        $("#color-result").val(hexValue);
        $("#box-pointer").css("background", hexValue);    

        pixel[0] + pixel[1] + pixel[2] < 150 
            ? invoke(() => { $("#color-result").css("color", "white"); $("#box-pointer").css("border-color", "white"); })
            : invoke(() => { $("#color-result").css("color", "black"); $("#box-pointer").css("border-color", "black"); })
    }

    /**
     * Changes color in colorbox based on colorslider pointer
     * position inside color strip.
     */
    function changeColor() {
        sliderP_X = ($(sliderPointer).offset().left + $(sliderPointer).width() / 2 + 2 - $(colorSliderCanvas).offset().left);
        const sliderP_Y = $(sliderPointer).offset().top + 5 - $(colorSliderCanvas).offset().top;
        sliderColor = RGB_ArrayToHex(sliderContex.getImageData(sliderP_X, sliderP_Y, 1, 1).data);
        fillGradientColor(sliderColor); 
        $("#slider-pointer").css("background", sliderColor);
    }


    //------------------------ Presentation ----------------------------//

    /**
     * Displays color's data to user.
     * Sets selected color as sample's background color.
     */
    function displayColorData(pixel, bgColor) {
        const labels = $(".color-val-inpt");

        for (let i = 0; i  < 3; i++)
             labels[i].innerText = pixel[i];
        labels[3].innerText = pixel[0] + "," + pixel[1] + "," + pixel[2];
        labels[4].innerText = bgColor
        $("#color-result").css("background", bgColor);
    }


    //------------------------ Window resize ------------------------//

    /**
     * Resized eventhandler for window.
     * If window-width drops below 550px, canvases are scaled to
     * fit new look. Also scales canvases back to original size.
     * Fixes pointers to their new correct aboslute positions.
     */
    $(window).resize(function () {
        window.matchMedia("(max-width: 550px)").matches ? shrinkCanvases(313.0/400.0) : growCanvases(400.0/313.0);
        fixPointers(boxP_X, boxP_Y, sliderP_X)
    });

    /**
     * Shrinks canvases to 313px width. Only resizes
     * canvases the first time when screen-width is < 550px. 
     * @param {number} ratio Shrink ratio
     */
    function shrinkCanvases(ratio) { if (colorSlider.width > 313) scaleCavases(ratio); }

    /**
     * Grows canvases back to 400px width. Only resizes
     * cavases the first time when screen-width is > 550px.
     * @param {number} ratio Growth ratio
     */
    function growCanvases(ratio) { if (colorSlider.width <= 313) scaleCavases(ratio); }

    /**
     * Scales colorbox-canvas and colorslider-canvas to
     * new width. Refreshes pointer coordinates.
     * @param {number} ratio Scale ratio
     */
    function scaleCavases(ratio) {
        colorSliderCanvas.width = colorSlider.width *= ratio;
        colorBoxCanvas.width = colorBox.width *= ratio;
        fillGradientColor(sliderColor);
        setUpSlider();
        boxP_X *= ratio;
        sliderP_X *= ratio; 
    }


    //------------------- Colorbox and slider click movement ------------------------//

    /**
     * Click eventhandler for colorbox.
     * When clicked, pointer appears immediately on cursor location.
     * Updates selected color.
     */
    $(colorBoxCanvas).click(function (event) {
        $("#box-pointer").css("top", event.pageY - $("#box-pointer").width() / 2 + "px");
        $("#box-pointer").css("left", event.pageX - $("#box-pointer").width() / 2 + "px");
        selectColor();
    });

    /**
     * Click eventhandler for colorslider.
     * When clicked, pointer appears immediately on cursor location.
     * Updates selected color
     */
    $(colorSliderCanvas).click(function (event) {
        $("#slider-pointer").css("left", event.pageX - $("#slider-pointer").width() / 2 + "px");
        changeColor();
        selectColor();
    });


    //--------------------- Save selected color ---------------------------------//

    let savedColorIndex = 0;
    /**
     * Click eventhandler for color result div.
     * Saves to one of the saved-color divs.
     * Next save target rotates by savedColorIndex.
     */
    $("#color-result").click(function (e) {
        $(".saved-color")[savedColorIndex].getElementsByTagName("label")[0].innerText = e.target.value;
        $($(".saved-color")[savedColorIndex].getElementsByTagName("div")).css("background", e.target.value);
        (savedColorIndex < 9) ? savedColorIndex++ : savedColorIndex = 0;
    });


    //------------- Sidepanel events and functionality --------------//

    /**
     * Sets click eventhandlers to saved color elements.
     */
    function savedColorEvents() {
        const sideColors = $("#sidepanel > div");
        let sidePanelHidden = true;
        $.each($(".saved-color"), function (i, elem) {

            /**
             * Click-eventhandler.
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
                let backgroundColor = formatColor(e);
                if (sidePanelHidden) {
                    // Sidepanel is hidden. Lets fill colors to it and change it to visible.

                    let shadedColor = backgroundColor;
                    let brigthColor = backgroundColor;

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
                    $("#sidepanel").css("visibility", "visible");
                    sidePanelHidden = false;
                }
                else {
                    // Sidepanel is open. Let's close it.
                    $("#sidepanel").css("visibility", "hidden");
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
        function formatColor(event) {
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
            const colorElem = sideColors[index].firstChild;
            color = shadeColor(color, percent);
            $(sideColors[index]).css("background", color);
            colorElem.innerText = color;
            getBrightness(color) < 170 ? $(colorElem).css("color", "#e6e6e6")
                                       : $(colorElem).css("color", "#000000");
            return color;
        }
    }
});
