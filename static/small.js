'use strict';

// ------- DOCUMENT READY -------//
$(document).ready(function () {

    const colorBoxCanvas = $("#color-main");
    const colorSliderCanvas = $("#color-slider");
    const colorBox = document.getElementById("color-main");
    const colorSlider = document.getElementById("color-slider");

    // media-query for small screens
    if (window.matchMedia("(max-width: 550px)").matches) {
        colorBox.width = colorBoxCanvas.width = 313;
        colorSlider.width = colorSliderCanvas.width = 313;
    }
});