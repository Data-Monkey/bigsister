function moveSlide(button, direction) {
    // Find the parent carousel container
    const carousel = button.closest('.carousel');

    // Select all images and dots within this specific carousel
    const images = carousel.querySelectorAll('.carousel-track img');
    const dots = carousel.querySelectorAll('.dot');

    // Find index of currently visible image
    let activeIndex = Array.from(images).findIndex(img => img.classList.contains('active'));

    // Remove active class from current image and dot
    images[activeIndex].classList.remove('active');
    if (dots.length) {
    dots[activeIndex].classList.remove('active');
    }

    // Calculate new slide index with looping
    let newIndex = activeIndex + direction;
    if (newIndex >= images.length) newIndex = 0;
    if (newIndex < 0) newIndex = images.length - 1;

    // Activate new image and dot
    images[newIndex].classList.add('active');
    if (dots.length) {
    dots[newIndex].classList.add('active');
    }
}