import "./style.css";

/**
 * Initializes the interactive sample button component and binds click state updates
 * @param {string} selector - CSS selector for the button element
 * @returns {void}
 */
function initSampleButton(selector) {
    const button = document.querySelector(selector);
    if (!button) {
        return;
    }

    let clickCount = 0;

    button.addEventListener("click", () => {
        clickCount += 1;
        button.textContent = `Geklickt (${clickCount})`;
    });
}

initSampleButton("#sample-btn");
