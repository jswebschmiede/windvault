import './style.css';
import AppleStyleSlider from './index.js';

/**
 * Initializes the demo sliders on the demo page
 * @returns {void}
 */
function initDemo() {
    window.sliders = [
        new AppleStyleSlider('#discover-slider', {
            alignEl: '#discover-content',
            navigation: {
                prevEl: '#discover-prev',
                nextEl: '#discover-next',
            },
            pagination: true,
        }),
        new AppleStyleSlider('#more-slider', {
            alignEl: '#more-content',
            navigation: {
                prevEl: '#more-prev',
                nextEl: '#more-next',
            },
            pagination: {
                el: '#more-fraction',
                type: 'fraction',
            },
        }),
    ];
}

initDemo();
