/**
 * This script handles all premium dynamic functionality for the website:
 * 1. The initial splash screen animation.
 * 2. The two-step pre-booking and payment modal logic.
 * 3. The creation of the bar chart with logos and on-scroll animation.
 * 4. Live animation for the statistics counter.
 * 5. Cinematic on-scroll reveal animations for sections and cards.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- SPLASH SCREEN LOGIC ---
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        splashScreen.style.visibility = 'hidden';
        mainContent.classList.remove('hidden');
        mainContent.style.opacity = '1';
        mainContent.style.transition = 'opacity 1s ease-in';
    }, 4000);

    // --- PRE-BOOKING & PAYMENT MODAL LOGIC ---
    const modalOverlay = document.getElementById('booking-modal');
    const modalTitle = document.getElementById('modal-course-title');
    const modalPrice = document.getElementById('modal-course-price');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const pricingButtons = document.querySelectorAll('.course-button');
    const prebookStep = document.getElementById('prebook-step');
    const paymentStep = document.getElementById('payment-step');
    const prebookForm = document.getElementById('prebook-form');
    const backToFormBtn = document.getElementById('back-to-form-btn');
    const copyUpiBtn = document.getElementById('copy-upi-btn');

    const openModal = (course, price) => {
        modalTitle.textContent = `Pre-book: ${course}`;
        modalPrice.textContent = `₹${price}`;
        prebookStep.classList.remove('hidden');
        paymentStep.classList.add('hidden');
        modalOverlay.classList.add('active');
    };
    const closeModal = () => modalOverlay.classList.remove('active');
    pricingButtons.forEach(button => button.addEventListener('click', () => openModal(button.dataset.course, button.dataset.price)));
    prebookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        prebookStep.classList.add('hidden');
        paymentStep.classList.remove('hidden');
    });
    backToFormBtn.addEventListener('click', () => {
        paymentStep.classList.add('hidden');
        prebookStep.classList.remove('hidden');
    });
    copyUpiBtn.addEventListener('click', () => {
        const upiId = 'raviteja.consultancy@upi';
        navigator.clipboard.writeText(upiId).then(() => {
            copyUpiBtn.textContent = 'Copied!';
            setTimeout(() => { copyUpiBtn.textContent = 'Copy'; }, 2000);
        });
    });
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => e.target === modalOverlay && closeModal());

    // --- CINEMATIC ON-SCROLL REVEAL ANIMATIONS ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.section-title, .feature-item, .course-card, .stat-item, .contact-form').forEach((el, index) => {
        el.style.setProperty('--i', index);
        revealObserver.observe(el);
    });

    // --- LIVE STATISTICS COUNTER & CHART (ON-SCROLL) ---
    const chartCanvas = document.getElementById('comparisonChart');
    const statsSection = document.getElementById('stats');
    let chartHasBeenCreated = false;
    let statsAnimated = false;

    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200;
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const createChart = () => {
        // --- NEW: Load logo images before creating the chart ---
        const logoSources = [
            'images/logo.png',
            'images/kush.png',
            'images/masth.png',
            'images/muk.png',
            'images/prani.png' // Your logo
        ];
        const logoImages = [];
        let loadedImages = 0;

        logoSources.forEach((src, index) => {
            const img = new Image();
            img.src = src;
            // Use placeholders if an image fails to load
            img.onerror = () => {
                const placeholder = new Image();
                placeholder.src = `https://placehold.co/80x40/f0f0f0/000000?text=Logo`;
                placeholder.onload = () => {
                    logoImages[index] = placeholder;
                    checkAllImagesLoaded();
                }
            };
            img.onload = () => {
                logoImages[index] = img;
                checkAllImagesLoaded();
            };
        });

        function checkAllImagesLoaded() {
            loadedImages++;
            if (loadedImages === logoSources.length) {
                renderChart();
            }
        }

        function renderChart() {
            const ctx = chartCanvas.getContext('2d');
            const chartData = {
                labels: ['RaviTeja Consultancy', 'Kushal Corporate Connects', 'Masthan Career Bridge', 'Mukesh Global Careers.', 'Praneeth Aptitude Solutions'],
                datasets: [{
                    label: 'Success Rate (%)',
                    data: [95, 69, 56, 51, 49],
                    backgroundColor: ['rgba(54, 162, 235, 0.7)','rgba(75, 192, 192, 0.7)','rgba(255, 206, 86, 0.7)','rgba(153, 102, 255, 0.7)','rgba(255, 99, 132, 0.7)'],
                    borderColor: ['#fff'],
                    borderWidth: 2,
                    borderRadius: 5
                }]
            };

            // --- NEW: Plugin to draw images on the chart ---
            const labelsWithImages = {
                id: 'labelsWithImages',
                afterDraw: (chart) => {
                    const ctx = chart.ctx;
                    const xAxis = chart.scales.x;
                    const yAxis = chart.scales.y;
                    
                    xAxis.getMatchingVisibleMetas().forEach((meta, metaIndex) => {
                        meta.data.forEach((bar, index) => {
                            const logo = logoImages[index];
                            if (logo) {
                                const barWidth = bar.width;
                                const imgWidth = 60; // Desired width of the logo
                                const imgHeight = (logo.height / logo.width) * imgWidth;
                                const x = bar.x - (imgWidth / 2);
                                const y = yAxis.bottom + 10; // 10px below the axis
                                ctx.drawImage(logo, x, y, imgWidth, imgHeight);
                            }
                        });
                    });
                }
            };

            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 50 // Add extra space at the bottom for the logos
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: (value) => value + '%', font: { family: "'Inter', sans-serif" } }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: {
                        grid: { display: false },
                        ticks: {
                            display: false // Hide the original text labels
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Consultancy Success Rate Comparison', font: { size: 18, family: "'Poppins', sans-serif" }, padding: { top: 10, bottom: 30 } },
                    tooltip: { callbacks: { label: (context) => `${context.dataset.label || ''}: ${context.parsed.y}%` }, backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { family: "'Poppins', sans-serif" }, bodyFont: { family: "'Inter', sans-serif" } }
                },
                animation: { duration: 1500, easing: 'easeInOutQuart' }
            };

            new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: chartOptions,
                plugins: [labelsWithImages] // Register the new plugin
            });
            chartHasBeenCreated = true;
        }
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target === chartCanvas && !chartHasBeenCreated) {
                    createChart();
                }
                if (entry.target === statsSection && !statsAnimated) {
                    animateCounters();
                    statsAnimated = true;
                }
            }
        });
    }, { threshold: 0.5 });

    if (chartCanvas) animationObserver.observe(chartCanvas);
    if (statsSection) animationObserver.observe(statsSection);
});