const BLOCK = 'apple-style-slider';

const ICON_PREV =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const ICON_NEXT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

const DEFAULTS = {
    alignEl: null,
    navigation: {
        prevEl: null,
        nextEl: null,
        container: null,
        prevLabel: 'Zurück',
        nextLabel: 'Weiter',
        prevIcon: ICON_PREV,
        nextIcon: ICON_NEXT,
    },
    pagination: {
        el: null,
        type: 'bullets',
        variant: 'expand',
        bulletLabel: (index) => `Slide ${index + 1}`,
        fractionSeparator: ' / ',
    },
    slideLabel: (index, total) => `${index + 1} / ${total}`,
    drag: true,
    dragThreshold: 50,
    keyboard: true,
    on: {},
};

/**
 * Resolves a selector or element to an element
 * @param {string|HTMLElement|null} target - Selector or element
 * @param {Document|Element} [scope=document] - Scope for selector lookup
 * @returns {HTMLElement|null} Resolved element or null
 */
function resolveEl(target, scope = document) {
    if (!target) {
        return null;
    }
    return typeof target === 'string' ? scope.querySelector(target) : target;
}

/**
 * Normalizes a feature option (true | false | object) against its defaults
 * @param {boolean|object|undefined} value - User value
 * @param {object} defaults - Default config of the feature
 * @returns {object|null} Merged config or null when disabled
 */
function featureOption(value, defaults) {
    if (value === false) {
        return null;
    }
    return { ...defaults, ...(typeof value === 'object' && value !== null ? value : {}) };
}

/**
 * Apple-style card slider: native scroll-snap, slides snap to the edges of a centered
 * content container while neighbouring slides bleed into the page margins.
 */
export default class AppleStyleSlider {
    #abort = new AbortController();
    #resizeObserver = null;
    #created = [];
    #addedClasses = [];
    #frame = 0;
    #measureFrame = 0;
    #activeIndex = 0;
    #activeSlideIndex = 0;
    #bulletCount = -1;
    #fraction = null;
    #labelledSlides = [];
    #padStart = 0;
    #drag = { down: false, moved: false, startX: 0, startScroll: 0, startIndex: 0 };

    /**
     * @param {string|HTMLElement} el - Root element (.apple-style-slider) or selector
     * @param {object} [options] - See DEFAULTS
     */
    constructor(el, options = {}) {
        this.el = resolveEl(el);
        if (!this.el) {
            throw new Error(`AppleStyleSlider: element "${el}" not found`);
        }

        this.viewport = this.el.querySelector(`.${BLOCK}__viewport`);
        this.track = this.el.querySelector(`.${BLOCK}__track`);
        if (!this.viewport || !this.track) {
            throw new Error(`AppleStyleSlider: .${BLOCK}__viewport and .${BLOCK}__track are required`);
        }

        this.options = {
            ...DEFAULTS,
            ...options,
            navigation: featureOption(options.navigation ?? true, DEFAULTS.navigation),
            pagination: featureOption(options.pagination ?? true, DEFAULTS.pagination),
            on: { ...DEFAULTS.on, ...options.on },
        };
        this.alignEl = resolveEl(this.options.alignEl);

        this.#initNavigation();
        this.#initPagination();
        this.#bindEvents();
        this.#measure();

        document.fonts?.ready.then(() => this.update());
        this.#emit('init');
    }

    /** @returns {HTMLElement[]} All slide elements */
    get slides() {
        return Array.from(this.track.querySelectorAll(`.${BLOCK}__slide`));
    }

    /** @returns {number} Index of the current snap position */
    get activeIndex() {
        return this.#activeIndex;
    }

    /** @returns {number} Index of the slide marked as active */
    get activeSlideIndex() {
        return this.#activeSlideIndex;
    }

    /**
     * Scrolls to a snap position
     * @param {number} index - Snap position index (clamped)
     * @param {boolean} [smooth=true] - Smooth scrolling
     * @returns {void}
     */
    slideTo(index, smooth = true) {
        const snaps = this.#snaps();
        const i = Math.max(0, Math.min(snaps.length - 1, index));
        this.viewport.scrollTo({ left: snaps[i].pos, behavior: smooth ? 'smooth' : 'instant' });
    }

    /** @returns {void} */
    slideNext() {
        this.slideTo(this.#activeIndex + 1);
    }

    /** @returns {void} */
    slidePrev() {
        this.slideTo(this.#activeIndex - 1);
    }

    /**
     * Recalculates layout, e.g. after changing CSS custom properties or slides
     * @returns {void}
     */
    update() {
        this.#measure();
    }

    /**
     * Removes listeners, observers and generated elements
     * @returns {void}
     */
    destroy() {
        this.#abort.abort();
        this.#resizeObserver?.disconnect();
        cancelAnimationFrame(this.#frame);
        cancelAnimationFrame(this.#measureFrame);
        this.#created.forEach((node) => node.remove());
        this.#addedClasses.forEach(([node, cls]) => node.classList.remove(cls));
        if (this.paginationEl && !this.#created.includes(this.paginationEl)) {
            this.paginationEl.replaceChildren();
            this.paginationEl.hidden = false;
        }
        this.slides.forEach((slide) => slide.classList.remove(`${BLOCK}__slide--active`));
        this.#unlabelSlides();
        ['--apple-style-slider-inner', '--apple-style-slider-offset-start', '--apple-style-slider-offset-end'].forEach(
            (prop) => this.el.style.removeProperty(prop),
        );
        this.el.classList.remove(`${BLOCK}--dragging`);
    }

    #addClass(node, cls) {
        if (!node.classList.contains(cls)) {
            node.classList.add(cls);
            this.#addedClasses.push([node, cls]);
        }
    }

    #emit(name, detail = {}) {
        const payload = { slider: this, index: this.#activeIndex, ...detail };
        this.options.on[name]?.(payload);
        this.el.dispatchEvent(new CustomEvent(`${BLOCK}:${name}`, { detail: payload }));
    }

    #initNavigation() {
        const nav = this.options.navigation;
        if (!nav) {
            return;
        }

        this.prevEl = resolveEl(nav.prevEl);
        this.nextEl = resolveEl(nav.nextEl);

        if (!this.prevEl || !this.nextEl) {
            const wrapper = document.createElement('div');
            wrapper.className = `${BLOCK}__nav`;
            this.prevEl ??= this.#createButton(nav.prevLabel, nav.prevIcon);
            this.nextEl ??= this.#createButton(nav.nextLabel, nav.nextIcon);
            wrapper.append(this.prevEl, this.nextEl);

            const container = resolveEl(nav.container);
            if (container) {
                container.append(wrapper);
            } else {
                this.el.insertBefore(wrapper, this.viewport);
            }
            this.#created.push(wrapper);
        }

        this.#addClass(this.prevEl, `${BLOCK}__button`);
        this.#addClass(this.prevEl, `${BLOCK}__button--prev`);
        this.#addClass(this.nextEl, `${BLOCK}__button`);
        this.#addClass(this.nextEl, `${BLOCK}__button--next`);
    }

    #createButton(label, icon) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', label);
        // icon is developer-provided markup from the options, not user input
        button.innerHTML = icon;
        return button;
    }

    #initPagination() {
        const pagination = this.options.pagination;
        if (!pagination) {
            return;
        }

        const isFraction = pagination.type === 'fraction';

        this.paginationEl = resolveEl(pagination.el);
        if (!this.paginationEl) {
            this.paginationEl = document.createElement(isFraction ? 'div' : 'ul');
            this.el.append(this.paginationEl);
            this.#created.push(this.paginationEl);
        }

        this.#addClass(this.paginationEl, `${BLOCK}__pagination`);
        this.#addClass(this.paginationEl, `${BLOCK}__pagination--${pagination.type}`);

        if (!isFraction) {
            this.#addClass(this.paginationEl, `${BLOCK}__pagination--${pagination.variant}`);
            return;
        }

        const current = document.createElement('span');
        current.className = `${BLOCK}__fraction-current`;
        const separator = document.createElement('span');
        separator.className = `${BLOCK}__fraction-separator`;
        separator.textContent = pagination.fractionSeparator;
        const total = document.createElement('span');
        total.className = `${BLOCK}__fraction-total`;
        this.paginationEl.replaceChildren(current, separator, total);
        this.#fraction = { current, total };
    }

    #renderPagination(snaps) {
        if (!this.paginationEl) {
            return;
        }

        if (this.#fraction) {
            const total = this.slides.length;
            this.#fraction.current.textContent = String(this.#activeSlideIndex + 1);
            this.#fraction.total.textContent = String(total);
            this.paginationEl.hidden = total < 2;
            return;
        }

        this.#renderBullets(snaps.length);
        this.paginationEl.querySelectorAll(`.${BLOCK}__bullet`).forEach((bullet, i) => {
            const active = i === this.#activeIndex;
            bullet.classList.toggle(`${BLOCK}__bullet--active`, active);
            bullet.setAttribute('aria-current', active ? 'true' : 'false');
        });
    }

    #renderBullets(count) {
        if (count === this.#bulletCount) {
            return;
        }
        this.#bulletCount = count;

        const asList = ['UL', 'OL'].includes(this.paginationEl.tagName);
        const items = Array.from({ length: count }, (_, i) => {
            const bullet = document.createElement('button');
            bullet.type = 'button';
            bullet.className = `${BLOCK}__bullet`;
            bullet.setAttribute('aria-label', this.options.pagination.bulletLabel(i));
            bullet.addEventListener('click', () => this.slideTo(i), { signal: this.#abort.signal });
            if (!asList) {
                return bullet;
            }
            const li = document.createElement('li');
            li.append(bullet);
            return li;
        });

        this.paginationEl.replaceChildren(...items);
        this.paginationEl.hidden = count < 2;
    }

    #bindEvents() {
        const { signal } = this.#abort;
        const viewport = this.viewport;

        viewport.addEventListener(
            'scroll',
            () => {
                cancelAnimationFrame(this.#frame);
                this.#frame = requestAnimationFrame(() => this.#updateState());
            },
            { passive: true, signal },
        );

        this.prevEl?.addEventListener('click', () => this.slidePrev(), { signal });
        this.nextEl?.addEventListener('click', () => this.slideNext(), { signal });

        if (this.options.keyboard) {
            viewport.addEventListener(
                'keydown',
                (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        this.slideTo(this.#activeIndex + (e.key === 'ArrowRight' ? 1 : -1));
                    }
                },
                { signal },
            );
        }

        if (this.options.drag) {
            this.#bindDrag(signal);
        }

        this.#resizeObserver = new ResizeObserver(() => {
            cancelAnimationFrame(this.#measureFrame);
            this.#measureFrame = requestAnimationFrame(() => {
                this.#measure();
                this.#emit('resize');
            });
        });
        this.#resizeObserver.observe(viewport);
        if (this.alignEl) {
            this.#resizeObserver.observe(this.alignEl);
        }
    }

    /* Mouse drag; touch scrolls natively with snap */
    #bindDrag(signal) {
        const viewport = this.viewport;
        const drag = this.#drag;

        viewport.addEventListener(
            'pointerdown',
            (e) => {
                if (e.pointerType !== 'mouse' || e.button !== 0) {
                    return;
                }
                Object.assign(drag, {
                    down: true,
                    moved: false,
                    startX: e.clientX,
                    startScroll: viewport.scrollLeft,
                    startIndex: this.#activeIndex,
                });
                this.el.classList.add(`${BLOCK}--dragging`);
                viewport.setPointerCapture(e.pointerId);
            },
            { signal },
        );

        viewport.addEventListener(
            'pointermove',
            (e) => {
                if (!drag.down) {
                    return;
                }
                const dx = e.clientX - drag.startX;
                if (Math.abs(dx) > 3) {
                    drag.moved = true;
                }
                viewport.scrollLeft = drag.startScroll - dx;
            },
            { signal },
        );

        const endDrag = (e) => {
            if (!drag.down) {
                return;
            }
            drag.down = false;
            if (viewport.hasPointerCapture(e.pointerId)) {
                viewport.releasePointerCapture(e.pointerId);
            }
            const dx = e.clientX - drag.startX;
            let target = this.#nearestIndex();
            if (target === drag.startIndex && Math.abs(dx) > this.options.dragThreshold) {
                target = drag.startIndex + (dx < 0 ? 1 : -1);
            }
            this.el.classList.remove(`${BLOCK}--dragging`);
            this.slideTo(target);
        };
        viewport.addEventListener('pointerup', endDrag, { signal });
        viewport.addEventListener('pointercancel', endDrag, { signal });

        viewport.addEventListener(
            'click',
            (e) => {
                if (drag.moved) {
                    e.preventDefault();
                    e.stopPropagation();
                    drag.moved = false;
                }
            },
            { capture: true, signal },
        );
        viewport.addEventListener('dragstart', (e) => e.preventDefault(), { signal });
    }

    /*
     * With alignEl: measure its inner edges relative to the viewport and expose them as CSS vars.
     * Without: track padding / scroll-padding come from --apple-style-slider-content-width in CSS.
     * Slide width and height are always computed in CSS.
     */
    #measure() {
        const keepIndex = this.#activeIndex;

        if (this.alignEl) {
            const cs = getComputedStyle(this.alignEl);
            const target = this.alignEl.getBoundingClientRect();
            const box = this.viewport.getBoundingClientRect();
            const start = Math.max(0, Math.round(target.left + parseFloat(cs.paddingLeft) - box.left));
            const end = Math.max(0, Math.round(box.right - (target.right - parseFloat(cs.paddingRight))));
            this.el.style.setProperty('--apple-style-slider-offset-start', `${start}px`);
            this.el.style.setProperty('--apple-style-slider-offset-end', `${end}px`);
            this.el.style.setProperty('--apple-style-slider-inner', `${box.width - start - end}px`);
        }

        this.#padStart = parseFloat(getComputedStyle(this.track).paddingLeft) || 0;
        this.#labelSlides();

        // Restore position without smooth scrolling
        this.el.classList.add(`${BLOCK}--dragging`);
        const snaps = this.#snaps();
        this.viewport.scrollLeft = snaps[Math.min(keepIndex, snaps.length - 1)].pos;
        this.el.classList.remove(`${BLOCK}--dragging`);

        this.#updateState();
    }

    /* aria-label "n / total" per slide; <li> keeps its listitem role, other elements become a group */
    #labelSlides() {
        this.#unlabelSlides();
        const label = this.options.slideLabel;
        if (!label) {
            return;
        }

        const slides = this.slides;
        slides.forEach((slide, i) => {
            const setRole = slide.tagName !== 'LI' && !slide.hasAttribute('role');
            if (setRole) {
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-roledescription', 'slide');
            }
            slide.setAttribute('aria-label', label(i, slides.length));
            this.#labelledSlides.push([slide, setRole]);
        });
    }

    #unlabelSlides() {
        this.#labelledSlides.forEach(([slide, setRole]) => {
            slide.removeAttribute('aria-label');
            if (setRole) {
                slide.removeAttribute('role');
                slide.removeAttribute('aria-roledescription');
            }
        });
        this.#labelledSlides = [];
    }

    #maxScroll() {
        return this.viewport.scrollWidth - this.viewport.clientWidth;
    }

    /* Snap position: first slide flush left, last flush right, all others centered */
    #slidePos(slide, index, count) {
        let pos;
        if (index === 0) {
            pos = slide.offsetLeft - this.#padStart;
        } else if (index === count - 1) {
            pos = this.#maxScroll();
        } else {
            pos = slide.offsetLeft + slide.offsetWidth / 2 - this.viewport.clientWidth / 2;
        }
        return Math.min(this.#maxScroll(), Math.max(0, Math.round(pos)));
    }

    /*
     * Distinct snap positions with the slide they belong to (duplicates at the edges merged).
     * A merged end position belongs to the last slide, a merged start position to the first.
     */
    #snaps() {
        const slides = this.slides;
        const out = [];
        slides.forEach((slide, i) => {
            const pos = this.#slidePos(slide, i, slides.length);
            const last = out[out.length - 1];
            if (!last || pos - last.pos > 2) {
                out.push({ pos, slideIndex: i });
            } else if (i === slides.length - 1 && out.length > 1) {
                last.slideIndex = i;
            }
        });
        return out.length ? out : [{ pos: 0, slideIndex: 0 }];
    }

    #nearestIndex(snaps = this.#snaps()) {
        const current = this.viewport.scrollLeft;
        let best = 0;
        let bestDist = Infinity;
        snaps.forEach(({ pos }, i) => {
            const dist = Math.abs(pos - current);
            if (dist < bestDist) {
                bestDist = dist;
                best = i;
            }
        });
        return best;
    }

    #updateState() {
        const snaps = this.#snaps();
        const previous = this.#activeIndex;
        this.#activeIndex = this.#nearestIndex(snaps);
        this.#activeSlideIndex = snaps[this.#activeIndex].slideIndex;

        this.slides.forEach((slide, i) => {
            slide.classList.toggle(`${BLOCK}__slide--active`, i === this.#activeSlideIndex);
        });

        this.#renderPagination(snaps);

        if (this.prevEl) {
            this.prevEl.disabled = this.viewport.scrollLeft <= 1;
        }
        if (this.nextEl) {
            this.nextEl.disabled = this.viewport.scrollLeft >= this.#maxScroll() - 1;
        }

        if (previous !== this.#activeIndex) {
            this.#emit('slideChange', { previousIndex: previous, slideIndex: this.#activeSlideIndex });
        }
    }
}
