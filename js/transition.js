// Deteksi arah navigasi
// 'forward' = masuk ke fitur (slide dari kanan)
// 'back' = keluar dari fitur (slide dari kiri)

document.addEventListener('DOMContentLoaded', () => {
    const direction = sessionStorage.getItem('navDirection') || 'forward';
    const body = document.querySelector('body > .max-w-md') || document.body;

    if (direction === 'forward') {
        body.classList.add('slide-in-right');
    } else {
        body.classList.add('slide-in-left');
    }

    // Reset setelah animasi
    sessionStorage.removeItem('navDirection');
});

// Fungsi untuk navigasi maju (masuk ke fitur)
function navigateTo(url) {
    sessionStorage.setItem('navDirection', 'forward');
    window.location.href = url;
}

// Fungsi untuk navigasi mundur (tombol back)
function navigateBack(url) {
    sessionStorage.setItem('navDirection', 'back');
    window.location.href = url;
}
