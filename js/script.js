document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions ---
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    const interpolate = (value, inputRange, outputRange) => {
        const [inMin, inMax] = inputRange;
        const [outMin, outMax] = outputRange;

        const clampedValue = clamp(value, inMin, inMax);
        const normalizedValue = (clampedValue - inMin) / (inMax - inMin);
        return outMin + normalizedValue * (outMax - outMin);
    };

    // --- Particle Animation Setup ---
    const particleConfigs = [
        { id: 'hero-particles', count: 100 },
        { id: 'services-particles', count: 60 },
        { id: 'portfolio-particles', count: 60 },
        { id: 'about-particles', count: 60 },
        { id: 'contact-particles', count: 60 }
    ];

    const allParticles = [];

    function createParticle(container) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        container.appendChild(particle);
        allParticles.push({ element: particle, container: container });
        resetParticle(particle, container);
    }

    function resetParticle(particleElement, containerElement) {
        const startX = Math.random() * containerElement.offsetWidth;
        const startY = Math.random() * containerElement.offsetHeight;

        const endX = startX + (Math.random() - 0.5) * 600;
        const endY = startY + (Math.random() - 0.5) * 600;

        const scale = Math.random() * 0.9 + 0.8;
        const duration = Math.random() * 7 + 3;
        const opacity = Math.random() * 0.5 + 0.3;

        particleElement.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            width: ${3 * scale}px;
            height: ${3 * scale}px;
            opacity: ${opacity};
            animation: moveParticle ${duration}s linear infinite alternate;
        `;

        particleElement.style.setProperty('--start-x', `${startX}px`);
        particleElement.style.setProperty('--start-y', `${startY}px`);
        particleElement.style.setProperty('--end-x', `${endX}px`);
        particleElement.style.setProperty('--end-y', `${endY}px`);
        particleElement.style.setProperty('--start-scale', `${scale}`);
        particleElement.style.setProperty('--end-scale', `${scale * 0.8}`);
        particleElement.style.setProperty('--start-opacity', `${opacity}`);
        particleElement.style.setProperty('--end-opacity', `${opacity * 0.5}`);
    }

    particleConfigs.forEach(config => {
        const container = document.getElementById(config.id);
        if (container) {
            for (let i = 0; i < config.count; i++) {
                createParticle(container);
            }
        }
    });

    // Window resize handler for particles and letter positions
    window.addEventListener('resize', () => {
        allParticles.forEach(p => resetParticle(p.element, p.container));
        // Reset letter positions on resize for precise collision
        splitTextIntoLetters();
        // Force restart of letter glow animation
        if (letterElements.length > 0) {
            if (letterGlowAnimationInterval) {
                clearInterval(letterGlowAnimationInterval);
            }
            startLetterGlowAnimation();
        }
    });

    // --- Hero Title Letter Animation (Glow only, no bouncing ball) ---
    const heroTitle = document.querySelector('.hero-title');
    let letterElements = []; // Niz za pohranu span elemenata svakog slova

    let currentLetterIndex = 0;
    let direction = 1; // 1 for forward, -1 for backward
    const glowInterval = 200; // Vreme između aktivacije sjaja na sledećem slovu (ms)

    let letterGlowAnimationInterval; // Koristićemo interval za ovu animaciju

    // Funkcija za deljenje teksta na slova i obmotavanje u spanove
    function splitTextIntoLetters() {
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.innerHTML = ''; // Isprazni originalni sadržaj

        letterElements = []; // Resetuj niz

        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.classList.add('letter-wrapper');
            if (char === ' ') {
                span.classList.add('space'); // Dodaj klasu za razmake
                span.innerHTML = '&nbsp;'; // Koristi non-breaking space za vidljivost razmaka
            } else {
                span.textContent = char;
            }
            heroTitle.appendChild(span);
            letterElements.push(span);
        });

        // Resetuj animaciju sjaja nakon ponovnog deljenja
        if (letterGlowAnimationInterval) {
            clearInterval(letterGlowAnimationInterval);
        }
        startLetterGlowAnimation();
    }

    // Funkcija za pokretanje animacije sjaja slova
    function startLetterGlowAnimation() {
        if (letterElements.length === 0) return;

        letterGlowAnimationInterval = setInterval(() => {
            // Ukloni sjaj sa svih slova pre nego što aktiviraš novo
            // i dodaj klasu za gašenje sjaja sa sporom tranzicijom
            letterElements.forEach(letter => {
                if (letter.classList.contains('active-glow')) {
                    letter.classList.remove('active-glow');
                    letter.classList.add('deactivating-glow');
                    // Nakon što se animacija gašenja završi, ukloni deactivating-glow
                    setTimeout(() => {
                        letter.classList.remove('deactivating-glow');
                    }, 800); // 0.8s je trajanje tranzicije u CSS-u
                }
            });

            // Aktiviraj sjaj na trenutnom slovu
            const targetLetter = letterElements[currentLetterIndex];
            targetLetter.classList.remove('deactivating-glow'); // Ukloni klasu za gašenje ako je postojala
            targetLetter.classList.add('active-glow');

            // Pređi na sledeće slovo
            currentLetterIndex += direction;

            // Logika za promenu smera kada dođe do kraja/početka teksta
            if (currentLetterIndex >= letterElements.length) {
                direction = -1; // Promeni smer unazad
                currentLetterIndex = letterElements.length - 1; // Osiguraj da indeks ne pređe granicu
            } else if (currentLetterIndex < 0) {
                direction = 1; // Promeni smer unapred
                currentLetterIndex = 0; // Osiguraj da indeks ne pređe granicu
            }
        }, glowInterval);
    }

    // Pokreni funkciju za deljenje teksta i animaciju sjaja kada se DOM učita
    splitTextIntoLetters();


    // --- Card Entry Animation & Glow/Scan Animations ---
    const animatedCards = document.querySelectorAll('.animated-card');

    animatedCards.forEach((card, index) => {
        const delay = index * 150; // Staggered delay for each card
        const glowColor = card.dataset.glowColor || 'var(--color-primary)';

        // Set CSS custom properties for dynamic glow color
        card.style.setProperty('--data-glow-color', glowColor);
        // Adjust shadow color if primary is used as base
        const shadowOpacity = 0.3; // Default shadow opacity
        let shadowColor = `rgba(0, 212, 255, ${shadowOpacity})`; // Default to original shadow if not provided

        if (glowColor === '#ff0080') {
            shadowColor = `rgba(255, 0, 128, ${shadowOpacity})`;
        } else if (glowColor === '#00ff88') {
            shadowColor = `rgba(0, 255, 136, ${shadowOpacity})`;
        }
        card.style.setProperty('--data-glow-shadow', shadowColor);

        // Initial state for entry animation (start hidden below and faded)
        card.style.transform = 'translateY(50px)';
        card.style.opacity = '0';

        // Entry animation using setTimeout for staggering and CSS transitions
        setTimeout(() => {
            card.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
            card.style.transform = 'translateY(0px)';
            card.style.opacity = '1';
        }, delay);
    });


    // --- Button Click Handlers ---
    const animatedButtons = document.querySelectorAll('.animated-button');

    animatedButtons.forEach(button => {
        const action = button.dataset.action; // Get data-action attribute

        button.addEventListener('click', (event) => {
            // Add 'active' class for a brief moment to trigger pulse/hover effects
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, 300); // Remove after a short duration

            // Specific actions based on data-action
            if (action === 'contact') {
                document.querySelector('.contact-section').scrollIntoView({ behavior: 'smooth' });
            } else if (action === 'portfolio') {
                document.querySelector('.portfolio-section').scrollIntoView({ behavior: 'smooth' });
            }
            // New: Handle call-phone action
            else if (action === 'call-phone') {
                const phoneNumber = button.closest('.contact-phone-group').querySelector('.contact-text').textContent.trim().replace(/\s/g, '');
                window.location.href = `tel:${phoneNumber}`;
            }
        });
    });

    // --- Service Card Interaction (Active state) ---
    const serviceCards = document.querySelectorAll('.service-card .card-inner-pressable');

    serviceCards.forEach(cardButton => {
        cardButton.addEventListener('click', () => {
            serviceCards.forEach(btn => {
                btn.closest('.animated-card').classList.remove('active-service-card');
            });

            const parentCard = cardButton.closest('.animated-card');
            parentCard.classList.add('active-service-card');

            console.log(`Service card "${cardButton.querySelector('.service-title').textContent}" clicked.`);
        });
    });

    // --- About Card Hover Button Functionality ---
    const aboutCards = document.querySelectorAll('.about-card');

    aboutCards.forEach(card => {
        // Kreiranje dugmeta
        const contactButton = document.createElement('button');
        contactButton.classList.add('animated-button', 'secondary-variant', 'contact-button-on-hover');
        contactButton.setAttribute('data-action', 'contact'); // Da dugme vodi na kontakt sekciju
        contactButton.textContent = 'Kontaktirajte nas';
        card.appendChild(contactButton);

        // Dodavanje event listenera za dugme
        contactButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Sprečava da klik na dugme aktivira i klik na karticu (ako postoji)
            document.querySelector('.contact-section').scrollIntoView({ behavior: 'smooth' });
            console.log('Dugme "Kontaktirajte nas" kliknuto iz About kartice.');
        });
    });

    // --- Formspree Contact Form Submission ---
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(contactForm);
            const formAction = contactForm.action;
            const submitButton = contactForm.querySelector('.form-submit-button');

            submitButton.textContent = 'Šaljem...'; // Update button text
            submitButton.disabled = true; // Disable button during submission

            try {
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important for Formspree JSON response
                    }
                });

                if (response.ok) {
                    alert('Poruka je uspešno poslata!');
                    contactForm.reset(); // Clear the form
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        alert(data.errors.map(error => error.message).join(', '));
                    } else {
                        alert('Došlo je do greške prilikom slanja poruke.');
                    }
                }
            } catch (error) {
                console.error('Greška pri slanju forme:', error);
                alert('Došlo je do greške prilikom slanja poruke. Proverite internet konekciju.');
            } finally {
                submitButton.textContent = 'Pošalji Poruku'; // Reset button text
                submitButton.disabled = false; // Re-enable button
            }
        });
    }
});