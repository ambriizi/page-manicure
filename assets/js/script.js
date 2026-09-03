document.addEventListener("DOMContentLoaded", () => {

    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Desconta a altura do menu fixo para não cobrir o título da seção
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    const sectionsToAnimate = document.querySelectorAll(".about-section, .gallery-section, .services-section, .reviews-section, .service-card, .review-card");

    const animationOptions = {
        root: null, // Usa a tela do navegador como referência
        threshold: 0.15, // Ativa a animação quando 15% do elemento estiver visível
        rootMargin: "0px"
    };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("element-visible");
                observer.unobserve(entry.target); // Para de observar após animar uma vez (ganho de performance)
            }
        });
    }, animationOptions);
    sectionsToAnimate.forEach(section => {
        // Adiciona a classe inicial de invisibilidade via JS (evita quebrar o site se o JS estiver desligado)
        section.classList.add("element-hidden");
        sectionObserver.observe(section);
    });

    // Pulso único no botão do WhatsApp na primeira vez que ele entra na tela,

    const whatsappBtn = document.getElementById("whatsappBtn");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (whatsappBtn && !prefersReducedMotion) {
        const pulseOnce = () => {
            whatsappBtn.style.transform = "scale(1.1)";
            setTimeout(() => {
                whatsappBtn.style.transform = "scale(1)";
            }, 300);
        };

        const whatsappObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    pulseOnce();
                    observer.disconnect();
                }
            });
        }, { threshold: 1 });

        whatsappObserver.observe(whatsappBtn);
    }

    setupWhatsappLinks();
    setupCarousels();
});

/* ---------- WhatsApp: link com mensagem personalizada por botão ---------- */

const WHATSAPP_NUMBER = "5515996623916";

function buildWhatsappLink(message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function setupWhatsappLinks() {
    document.querySelectorAll(".js-whatsapp").forEach((link) => {
        const message = link.dataset.msg || "Olá Carol! Gostaria de agendar um horário.";
        link.setAttribute("href", buildWhatsappLink(message));
    });
}

/* ---------- Carrossel de fotos ---------- */

function setupCarousels() {
    document.querySelectorAll(".carousel").forEach((carousel) => initCarousel(carousel));
}

function initCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    const dotsWrap = carousel.querySelector(".carousel-dots");
    const prevBtn = carousel.querySelector(".carousel-arrow--prev");
    const nextBtn = carousel.querySelector(".carousel-arrow--next");
    const autoplayDelay = parseInt(carousel.dataset.autoplay, 10) || 0;

    if (slides.length === 0) return;

    let current = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));
    if (current === -1) current = 0;
    let timer = null;

    // Cria os dots dinamicamente, um por slide
    const dots = slides.map((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Ir para foto ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function render() {
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    }

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        render();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
        if (!autoplayDelay || slides.length < 2) return;
        stopAutoplay();
        timer = setInterval(next, autoplayDelay);
    }

    function stopAutoplay() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    prevBtn?.addEventListener("click", () => { prev(); startAutoplay(); });
    nextBtn?.addEventListener("click", () => { next(); startAutoplay(); });

    // Pausa ao passar o mouse ou focar, retoma ao sair
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);

    // Navegação por teclado quando o carrossel está em foco
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { prev(); startAutoplay(); }
        if (e.key === "ArrowRight") { next(); startAutoplay(); }
    });

    // Swipe em telas de toque
    let touchStartX = 0;
    track.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoplay();
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) {
            delta > 0 ? prev() : next();
        }
        startAutoplay();
    });

    render();
    startAutoplay();
}