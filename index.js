// script.js
document.addEventListener("DOMContentLoaded", function() {
    const title = document.querySelector(".title");
    const subtitle = document.querySelector(".title-small");
    const crystaltitle = document.querySelector(".crystaltitle");
    const actionbutton = document.querySelector(".actionbuttons");

    setTimeout(() => {
        title.classList.add("show");
        subtitle.classList.add("show");
        crystaltitle.classList.add("show");
        actionbutton.classList.add("show");
    }, 100); // slight delay to ensure everything is loaded
});
