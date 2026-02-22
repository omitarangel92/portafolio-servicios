// Contenido unificado de scripts.js, validar.js y lógica de carrusel.

(function ($) {
    "use strict";

    /* --- Lógica de Navegación y Scroll (Basado en scripts.js) --- */

    // jQuery para colapsar la barra de navegación al hacer scroll
    $(window).on('scroll load', function () {
        if ($(".navbar").offset().top > 60) {
            $(".fixed-top").addClass("top-nav-collapse");
        } else {
            $(".fixed-top").removeClass("top-nav-collapse");
        }
    });

    // Script offcanvas de Bootstrap + elemento para cerrar el menú al hacer clic en vista pequeña
    $('[data-toggle="offcanvas"], .navbar-nav li a:not(.dropdown-toggle').on('click', function () {
        $('.offcanvas-collapse').toggleClass('open');
    });

    // Manejo de hover en modo escritorio (dropdowns)
    function toggleDropdown(e) {
        const _d = $(e.target).closest('.dropdown'),
            _m = $('.dropdown-menu', _d);
        setTimeout(function () {
            const shouldOpen = e.type !== 'click' && _d.is(':hover');
            _m.toggleClass('show', shouldOpen);
            _d.toggleClass('show', shouldOpen);
            $('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
        }, e.type === 'mouseleave' ? 300 : 0);
    }
    $('body')
        .on('mouseenter mouseleave', '.dropdown', toggleDropdown)
        .on('click', '.dropdown-menu a', function (e) {
            // Permite ir a la URL en lugar de solo cambiar el estado del dropdown
            location.href = this.href;
        });

    /* Mover el focus de etiquetas de campos de formulario cuando el usuario escribe */
    // para campos input y textarea
    $("input, textarea").keyup(function () {
        if ($(this).val() != '') {
            $(this).addClass('notEmpty');
        } else {
            $(this).removeClass('notEmpty');
        }
    });

    /* Mover la página al elemento de contenido cuando se hace clic en el enlace del menú */
    $(".navbar-nav li a").on("click", function (event) {
        // Excluye enlaces sin un ID de destino relevante
        if (event.target.id !== "log-in" && event.target.id !== "sign-up") {
            var targetID = $(this).attr("href");
            if (targetID && targetID.startsWith('#')) {
                targetID = targetID.substring(1); // remueve '#'
                if (targetID !== '') {
                    // Previene el comportamiento por defecto de ancla
                    event.preventDefault(); 
                    smoothScroll(targetID);
                }
            }
        }
    });

    // Botón de Volver Arriba
    $('body').prepend('<a href="#header" class="back-to-top page-scroll">Back to Top</a>');
    var amountScrolled = 700;
    $(window).scroll(function () {
        if ($(window).scrollTop() > amountScrolled) {
            $('a.back-to-top').fadeIn('500');
        } else {
            $('a.back-to-top').fadeOut('500');
        }
    });

    // Scrolling suave al hacer clic en el botón de volver arriba
    $('a.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
    });

    /* Elimina el foco persistente en los botones */
    $(".button, a, button").mouseup(function () {
        $(this).blur();
    });

    /* --- Lógica del Carrusel (Flickity - se mantiene por si se usa en otra parte) --- */
    if ($.fn.flickity) {
        var $carousel = $('.carousel').flickity({
            imagesLoaded: true,
            percentPosition: false,
        });

        var $imgs = $carousel.find('.carousel-cell img');
        var docStyle = document.documentElement.style;
        var transformProp = typeof docStyle.transform == 'string' ?
            'transform' : 'WebkitTransform';
        var flkty = $carousel.data('flickity');

        if (flkty) {
            $carousel.on('scroll.flickity', function () {
                flkty.slides.forEach(function (slide, i) {
                    var img = $imgs[i];
                    var x = (slide.target + flkty.x) * -1 / 3;
                    img.style[transformProp] = 'translateX(' + x + 'px)';
                });
            });
        }
    }


})(jQuery); // Fin de la IIFE de jQuery


/* --- Funciones de Utilidad (Fuera de la IIFE de jQuery) --- */

/**
 * Función de desplazamiento suave.
 * @param {string} targetID - El ID del elemento al que desplazarse.
 */
function smoothScroll(targetID) {
    const headerElement = document.getElementById('header');
    const headerHeight = headerElement ? document.querySelector('.navbar').offsetHeight : 0;
    
    const target = document.getElementById(targetID);
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    window.requestAnimationFrame(step);

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        window.scrollTo(0, easeInOutCubic(progress, startPosition, distance, duration));
        if (progress < duration) window.requestAnimationFrame(step);
    }
}

/**
 * Función de easing (interpolación) para el desplazamiento suave.
 * @param {number} t - Tiempo actual.
 * @param {number} b - Valor inicial.
 * @param {number} c - Cambio de valor.
 * @param {number} d - Duración.
 * @returns {number} - El valor interpolado.
 */
function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
}


/* --- Lógica de Validación de Formulario (Se mantiene) --- */
function validardesktop() {
    if (typeof Swal === 'undefined') {
        console.error("SweetAlert no está cargado. La validación visual fallará.");
    }

    var FullName, phone, descrip;

    FullName = document.getElementById('fullnamedesktop')?.value || '';
    phone = document.getElementById('phonedesktop')?.value || '';
    descrip = document.getElementById('descripdesktop')?.value || '';

    const pattern = new RegExp('^[A-Z\u00f1\u00d1\u00E0-\u00FC\\s]+$', 'i');
    const words = /([a-zA-Z])\1{2,}/;
    const telephonePattern = /([1-8])\1{4,}/;

    if (FullName === "" || phone === "" || descrip === "") {
        Swal.fire({
            title: "Error de envío",
            text: "Todos los campos son obligatorios.",
            icon: "error",
        });
        return false;
    }

    else if (FullName.length > 40) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo nombre es demasiado largo (máximo 40 caracteres).",
            icon: "error",
        });
        return false;
    }
    else if (FullName.length <= 2) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo nombre debe tener mínimo 3 letras.",
            icon: "error",
        });
        return false;
    }
    else if (!pattern.test(FullName)) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de nombre no puede contener números ni caracteres especiales.",
            icon: "error",
        });
        return false;
    }
    else if (words.test(FullName)) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de nombre no puede contener más de 2 letras repetidas consecutivamente.",
            icon: "error",
        });
        return false;
    }

    else if (isNaN(phone)) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo para digitar el número móvil solo puede contener números.",
            icon: "error",
        });
        return false;
    }
    else if (phone.length !== 10) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de teléfono debe contener exactamente 10 dígitos.",
            icon: "error",
        });
        return false;
    }
    else if (!phone.startsWith('3')) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo para digitar tu número móvil no puede empezar por un número diferente a 3.",
            icon: "error",
        });
        return false;
    }
    else if (telephonePattern.test(phone)) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo para digitar el número móvil no puede contener más de 4 números repetidos consecutivamente.",
            icon: "error",
        });
        return false;
    }

    else if (descrip.length <= 10) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de la descripción debe contener al menos 10 caracteres.",
            icon: "error",
        });
        return false;
    }
    else if (descrip.length > 500) {
        Swal.fire({
            title: "Error de envío",
            text: "El campo de la descripción es demasiado largo, máximo 500 caracteres.",
            icon: "error",
        });
        return false;
    }

    Swal.fire({
        title: "Correcto",
        text: "Información enviada correctamente",
        icon: "success",
    });
    return true;
}


/* --- LÓGICA PRINCIPAL DEL CARRUSEL RESPONSIVE (Actualizada) --- */
document.addEventListener('DOMContentLoaded', () => {
    const stackContainer = document.querySelector('.card-stack-container');
    const cardItems = document.querySelectorAll('.card-item');
    const navDotsContainer = document.querySelector('.carousel-nav-dots');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    
    // Elementos del Modal
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalClose = document.getElementsByClassName('modal-close')[0];
    
    if (cardItems.length === 0) return;

    // --- Parámetros de la vista stack ---
    const TOTAL_CARDS = cardItems.length;
    // Iniciamos en 0 (primera tarjeta)
    let activeCardIndex = 0; 

    // Ajustes para la separación y extensión 3D (Solo usados en Escritorio)
    const GROUP_SEPARATION_DISTANCE = 180; 
    const SCALE_DECREMENT = 0.05; 
    const ROTATION_DEGREES = 3;   
    const TRANSLATION_X_INCREMENT = 35; 
    const TRANSLATION_Z_INCREMENT = -60; 
    
    // Función para detectar modo móvil
    function isMobileMode() {
        // Coincide con la media query de 767px del CSS
        return window.matchMedia('(max-width: 767px)').matches;
    }

    // --- Lógica Principal de Actualización del Carrusel ---
    function updateCardStack() {
        const isMobile = isMobileMode();
        
        // 1. Limpieza general
        cardItems.forEach(card => {
            // Limpiamos los transforms para que el CSS (en móvil) o el JS (en desktop) actúe
            card.style.transform = ''; 
            card.classList.remove('active-card');
            card.classList.remove('active-mobile'); // Clase usada en móvil
            card.style.pointerEvents = 'none';
        });

        if (isMobile) {
            // --- MODO MÓVIL (Una sola imagen visible, sin 3D) ---
            
            cardItems.forEach((card, index) => {
                if (index === activeCardIndex) {
                    // El CSS ya tiene reglas de centrado y ocultación, 
                    // solo necesitamos añadir la clase para mostrar
                    card.classList.add('active-mobile'); 
                    card.style.opacity = '1'; 
                    card.style.zIndex = '5';
                    card.style.pointerEvents = 'auto';
                } else {
                    // Ocultamos el resto
                    card.style.opacity = '0'; 
                    card.style.zIndex = '1';
                }
            });
            
        } else {
            // --- MODO ESCRITORIO (Stack 3D) ---
            
            cardItems.forEach((card, index) => {
                
                const distanceToActive = index - activeCardIndex; 
                const isLeftGroup = distanceToActive < 0;
                const absDistance = Math.abs(distanceToActive);
                
                // Ocultar tarjetas demasiado lejos para optimizar
                if (absDistance > 4) {
                    card.style.opacity = '0';
                    card.style.transform = `scale(0.8) translateZ(-500px)`; 
                    card.style.zIndex = 1;
                    return;
                }

                // Cálculo de las transformaciones 3D
                const scale = 1 - (absDistance * SCALE_DECREMENT);
                const translateZ = absDistance * TRANSLATION_Z_INCREMENT;
                const stackTranslateX = isLeftGroup ? -absDistance * TRANSLATION_X_INCREMENT : absDistance * TRANSLATION_X_INCREMENT;
                const rotateY = isLeftGroup ? absDistance * ROTATION_DEGREES : -absDistance * ROTATION_DEGREES;

                let groupTranslateX = isLeftGroup ? -GROUP_SEPARATION_DISTANCE : GROUP_SEPARATION_DISTANCE;
                const totalTranslateX = groupTranslateX + stackTranslateX;

                // Aplicar las transformaciones
                card.style.transform = `translateX(${totalTranslateX}px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
                card.style.zIndex = 100 - absDistance;

                if (distanceToActive === 0) {
                    card.classList.add('active-card');
                    card.style.opacity = '1'; 
                } else {
                    card.style.opacity = '0.6'; // Opacidad para tarjetas no activas en desktop
                }
                
                if (absDistance <= 1) { 
                    card.style.pointerEvents = 'auto'; 
                }
            });
        }
        
        updateNavDots();
        updateNavButtons(); // Llamada para actualizar el estado de los botones
    }

    function goToCard(index) {
        if (index >= 0 && index < TOTAL_CARDS) {
            activeCardIndex = index;
            updateCardStack();
        }
    }

    function updateNavDots() {
        if (!navDotsContainer) return;
        navDotsContainer.innerHTML = ''; 
        cardItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === activeCardIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                goToCard(index);
            });
            navDotsContainer.appendChild(dot);
        });
    }
    
    function updateNavButtons() {
        if (!prevButton || !nextButton) return;
        
        // Se asegura que los botones sean 'flex' (visibles) en ambos modos
        prevButton.style.display = 'flex'; 
        nextButton.style.display = 'flex';
        
        // Habilitar/deshabilitar según el índice
        prevButton.disabled = activeCardIndex === 0;
        nextButton.disabled = activeCardIndex === TOTAL_CARDS - 1;
    }

    // --- Conexión de Eventos ---

    // 1. Flechas de navegación
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            goToCard(activeCardIndex - 1);
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            goToCard(activeCardIndex + 1);
        });
    }

    // 2. Clic en tarjetas: Abrir Modal o Navegar
    stackContainer.addEventListener('click', (e) => {
        e.preventDefault(); 
        const clickedLink = e.target.closest('.work-link');
        const clickedCard = e.target.closest('.card-item');
        
        if (!clickedLink || !clickedCard) return;

        // ASUMIENDO que la tarjeta tiene un atributo data-index con el índice 1-base:
        const clickedIndex = parseInt(clickedCard.dataset.index) - 1; 
        
        if (clickedIndex !== activeCardIndex) {
             // Si no es la tarjeta activa, navega el carrusel
             goToCard(clickedIndex);
        } else {
            // Si es la tarjeta activa, abre el modal
            const imageUrl = clickedLink.getAttribute('data-img-url');
            if (imageUrl) {
                modal.style.display = "block";
                modalImg.src = imageUrl;
                document.body.style.overflow = 'hidden'; 
            }
        }
    });

    // 3. Lógica del Modal (Se mantiene)
    modalClose.onclick = function() {
      modal.style.display = "none";
      document.body.style.overflow = 'auto'; 
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = 'auto'; 
      }
    }
    
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    });

    // 4. Navegación por arrastre (Swipe/Drag)
    let startX = 0;
    let isDragging = false;
    let initialActiveIndex = activeCardIndex;

    const handleDragStart = (e) => {
        isDragging = true;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        stackContainer.style.cursor = 'grabbing';
        initialActiveIndex = activeCardIndex;
    };

    const handleDragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        stackContainer.style.cursor = 'pointer';
        
        const endX = (e.type.includes('touch')) ? e.changedTouches[0].clientX : e.clientX;
        const diffX = endX - startX;
        
        if (Math.abs(diffX) > 50) { 
            if (diffX < 0) {
                goToCard(initialActiveIndex + 1);
            } else {
                goToCard(initialActiveIndex - 1);
            }
        }
    };
    
    stackContainer.addEventListener('mousedown', handleDragStart);
    stackContainer.addEventListener('touchstart', handleDragStart, {passive: true});
    stackContainer.addEventListener('mouseup', handleDragEnd);
    stackContainer.addEventListener('touchend', handleDragEnd);
    stackContainer.addEventListener('mouseleave', () => { isDragging = false; stackContainer.style.cursor = 'default'; });
    stackContainer.addEventListener('mousemove', (e) => { if (isDragging) e.preventDefault(); });

    // 5. Soporte Responsive: Re-renderizar al cambiar el tamaño de la ventana
    window.addEventListener('resize', updateCardStack);

    // Inicializar el carrusel
    goToCard(activeCardIndex); 
});





/* --- Lógica del Carrusel Vertical con Desplazamiento --- */

$(document).ready(function() {
    
    // Seleccionamos los elementos clave
    const slides = document.querySelectorAll('#details-section .slide');
    const navItems = document.querySelectorAll('.details-nav-timeline .nav-item');
    const dynamicContent = document.querySelector('.dynamic-content'); // Contenedor que se mueve

    if (slides.length === 0 || navItems.length === 0 || !dynamicContent) {
        return; 
    }
    
    const totalSlides = slides.length;
    let currentSlideIndex = 0;
    const intervalTime = 5000; // 5 segundos
    let carouselInterval; 

    // Función para gestionar el desplazamiento vertical
    function showSlide(index) {
        // 1. Calcular el desplazamiento vertical necesario
        // Multiplicamos el índice por la altura de un slide (ya definida en CSS)
        // Usamos la altura del primer slide como referencia
        const slideHeight = slides[0].offsetHeight; 
        const offset = -index * slideHeight; 
        
        // 2. Aplicar la transformación para mover el carrusel
        dynamicContent.style.transform = `translateY(${offset}px)`;

        // 3. Desactivar y Activar la Navegación (Línea de Tiempo)
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        if (navItems[index]) {
            navItems[index].classList.add('active');
        }
        
        currentSlideIndex = index; // Actualizar el índice global
    }
    
    // Función para avanzar al siguiente slide (bucle)
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides; 
        showSlide(currentSlideIndex);
    }
    
    // Función para reiniciar el bucle automático
    function restartInterval() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, intervalTime);
    }

    /* 1. MANEJO DE CLICKS (Navegación Manual) */
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el índice del data-index
            const index = parseInt(this.getAttribute('data-index'));

            if (!isNaN(index)) {
                showSlide(index);
                restartInterval(); // Reiniciar el bucle
            }
        });
    });

    /* 2. INICIALIZACIÓN Y BUCLE AUTOMÁTICO */
    // Inicializar mostrando el primer slide
    showSlide(currentSlideIndex);
    restartInterval();

    /* 3. UX: Pausar el carrusel al pasar el ratón */
    const dynamicContentContainer = document.querySelector('.details-interactive-wrapper');
    if (dynamicContentContainer) {
        dynamicContentContainer.addEventListener('mouseenter', () => {
            clearInterval(carouselInterval);
        });
        dynamicContentContainer.addEventListener('mouseleave', () => {
            restartInterval();
        });
    }
});