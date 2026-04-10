'use strict';

document.documentElement.classList.add('has-js');

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initFAQ();
    initReveal();
    initSmoothScroll();
    initServicesSlider();
    initContactModal();
    initTalkWidget();
    initCookieNotice();
});

function initHeader() {
    const header = document.querySelector('.s-header');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initFAQ() {
    const items = document.querySelectorAll('.c-faq-item');
    items.forEach((item, index) => {
        const question = item.querySelector('.c-faq-item__question');
        const answer = item.querySelector('.c-faq-item__answer');
        if (!question) return;

        if (answer) {
            const answerId = answer.id || `faq-answer-${index + 1}`;
            answer.id = answerId;
            question.setAttribute('aria-controls', answerId);
        }

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            items.forEach((other) => {
                if (other === item) return;
                other.classList.remove('is-open');
                other.querySelector('.c-faq-item__question')?.setAttribute('aria-expanded', 'false');
            });

            item.classList.toggle('is-open', !isOpen);
            question.setAttribute('aria-expanded', String(!isOpen));
        });
    });
}

function initReveal() {
    const elements = document.querySelectorAll('.js-reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach((element) => observer.observe(element));
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initServicesSlider() {
    const slider = document.querySelector('.js-services-slider');
    const track = slider?.querySelector('.s-services__track');
    const dots = slider?.querySelector('.s-services__dots');
    if (!slider || !track || !dots) return;

    const getPageCount = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        return Math.max(1, Math.ceil(maxScroll / track.clientWidth) + 1);
    };

    const setActiveDot = () => {
        const buttons = dots.querySelectorAll('.s-services__dot');
        if (!buttons.length) return;

        const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
        const index = Math.min(
            buttons.length - 1,
            Math.round((track.scrollLeft / maxScroll) * (buttons.length - 1))
        );

        buttons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === index;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });
    };

    const renderDots = () => {
        const pageCount = getPageCount();
        dots.innerHTML = '';

        for (let index = 0; index < pageCount; index += 1) {
            const button = document.createElement('button');
            button.className = 's-services__dot';
            button.type = 'button';
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-label', `Показать услуги, страница ${index + 1}`);
            button.addEventListener('click', () => {
                const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
                const target = pageCount === 1 ? 0 : (maxScroll / (pageCount - 1)) * index;
                track.scrollTo({ left: target, behavior: 'smooth' });
            });
            dots.appendChild(button);
        }

        setActiveDot();
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(renderDots, 120);
    });

    track.addEventListener('scroll', () => {
        window.requestAnimationFrame(setActiveDot);
    }, { passive: true });

    renderDots();
}

function initContactModal() {
    const modal = document.querySelector('.js-contact-modal');
    const openButtons = document.querySelectorAll('.js-contact-open');
    const closeButtons = modal?.querySelectorAll('.js-contact-close');
    const dialog = modal?.querySelector('.s-contact-modal__dialog');
    if (!modal || !dialog || !openButtons.length) return;

    let lastFocusedElement = null;

    const openModal = () => {
        lastFocusedElement = document.activeElement;

        const talkWidget = document.querySelector('.js-talk-widget');
        if (talkWidget) {
            talkWidget.hidden = true;
            document.body.classList.remove('has-talk-widget');
        }

        modal.hidden = false;
        document.body.classList.add('has-contact-modal');
        document.body.style.overflow = 'hidden';
        window.setTimeout(() => dialog.focus(), 0);
    };

    const closeModal = () => {
        modal.hidden = true;
        document.body.classList.remove('has-contact-modal');
        document.body.style.overflow = '';
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    };

    dialog.tabIndex = -1;
    openButtons.forEach((button) => button.addEventListener('click', openModal));
    closeButtons?.forEach((button) => button.addEventListener('click', closeModal));

    modal.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });
}

function initTalkWidget() {
    const widget = document.querySelector('.js-talk-widget');
    const closeButtons = widget?.querySelectorAll('.js-talk-close');
    const actionLinks = widget?.querySelectorAll('a');
    if (!widget || !closeButtons?.length) return;

    const delayBeforeShow = 60000;
    const retryDelay = 10000;
    let isDismissed = false;
    let showTimer;

    const closeWidget = () => {
        isDismissed = true;
        window.clearTimeout(showTimer);
        widget.hidden = true;
        document.body.classList.remove('has-talk-widget');
        document.body.style.overflow = '';
    };

    const showWidget = () => {
        const contactModal = document.querySelector('.js-contact-modal');
        if (isDismissed) return;
        if (contactModal && !contactModal.hidden) {
            showTimer = window.setTimeout(showWidget, retryDelay);
            return;
        }

        widget.hidden = false;
        document.body.classList.add('has-talk-widget');
        document.body.style.overflow = 'hidden';
    };

    showTimer = window.setTimeout(showWidget, delayBeforeShow);

    closeButtons.forEach((button) => button.addEventListener('click', closeWidget));
    actionLinks?.forEach((link) => link.addEventListener('click', closeWidget));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !widget.hidden) {
            closeWidget();
        }
    });
}

function initCookieNotice() {
    const notice = document.querySelector('.js-cookie-notice');
    const acceptButton = notice?.querySelector('.js-cookie-accept');
    if (!notice || !acceptButton) return;

    const storageKey = 'dale-cookie-notice-accepted-v1';
    const showDelay = 5000;
    let showTimer;

    const showNotice = () => {
        notice.hidden = false;
        document.body.classList.add('has-cookie-notice');
        window.requestAnimationFrame(() => {
            notice.classList.add('is-visible');
        });
    };

    const hideNotice = () => {
        notice.classList.remove('is-visible');
        document.body.classList.remove('has-cookie-notice');
        window.setTimeout(() => {
            notice.hidden = true;
        }, 260);
    };

    const saveAccepted = () => {
        window.localStorage.setItem(storageKey, 'accepted');
        window.clearTimeout(showTimer);
        hideNotice();
    };

    try {
        if (window.localStorage.getItem(storageKey) === 'accepted') {
            notice.hidden = true;
            document.body.classList.remove('has-cookie-notice');
            return;
        }
    } catch (error) {
        /* ignore localStorage issues and keep banner functional */
    }

    showTimer = window.setTimeout(showNotice, showDelay);

    acceptButton.addEventListener('click', () => {
        try {
            saveAccepted();
            return;
        } catch (error) {
            window.clearTimeout(showTimer);
            hideNotice();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !notice.hidden) {
            window.clearTimeout(showTimer);
            hideNotice();
        }
    });
}
