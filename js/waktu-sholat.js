// State untuk tanggal yang dipilih
let currentDate = new Date();
let prayerTimesData = {};

// Konfigurasi lokasi - Sulawesi Selatan (Makassar)
const LOCATION = {
    city: 'Makassar',
    country: 'Indonesia',
    latitude: -5.1477,
    longitude: 119.4327
};

// Nama hari dalam Bahasa Indonesia
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Update waktu real-time
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// Format tanggal untuk tampilan
function formatDate(date) {
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
}

// Konversi tanggal Masehi ke Hijriah (estimasi sederhana)
function toHijri(date) {
    // Menggunakan estimasi sederhana: 1 Muharram 1447 H = 7 Juli 2025
    const hijriEpoch = new Date(2025, 6, 7); // 7 Juli 2025
    const daysDiff = Math.floor((date - hijriEpoch) / (1000 * 60 * 60 * 24));
    const hijriYear = 1447 + Math.floor(daysDiff / 354);
    const dayInYear = ((daysDiff % 354) + 354) % 354;
    
    const hijriMonths = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 
                         'Rajab', 'Syaban', 'Ramadhan', 'Syawal', 'Dzulqadah', 'Dzulhijjah'];
    
    let monthIndex = Math.floor(dayInYear / 29.5);
    let dayInMonth = Math.floor(dayInYear % 29.5) + 1;
    
    if (monthIndex >= 12) {
        monthIndex = 11;
        dayInMonth = 29;
    }
    
    return `${dayInMonth} ${hijriMonths[monthIndex]} ${hijriYear}H`;
}

// Fetch waktu sholat dari API
async function fetchPrayerTimes(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    try {
        // Menggunakan API Aladhan untuk waktu sholat
        const response = await fetch(
            `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${LOCATION.latitude}&longitude=${LOCATION.longitude}&method=2`
        );
        
        if (!response.ok) throw new Error('Failed to fetch prayer times');
        
        const data = await response.json();
        return data.data.timings;
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        // Fallback ke waktu default jika API gagal
        return {
            Fajr: '04:53',
            Sunrise: '06:22',
            Dhuhr: '12:14',
            Asr: '15:21',
            Maghrib: '18:17',
            Isha: '19:26'
        };
    }
}

// Update tampilan tanggal
function updateDateDisplay() {
    const dateElement = document.querySelector('.text-center.flex-1 p:first-child');
    const hijriElement = document.querySelector('.text-center.flex-1 p:last-child');
    
    if (dateElement) {
        dateElement.textContent = formatDate(currentDate);
    }
    
    if (hijriElement) {
        hijriElement.textContent = toHijri(currentDate);
    }
}

// Update waktu sholat di tampilan
async function updatePrayerTimesDisplay() {
    const times = await fetchPrayerTimes(currentDate);
    
    // Mapping waktu sholat dengan elemen
    const prayerMapping = [
        { name: 'Subuh', time: times.Fajr },
        { name: 'Terbit', time: times.Sunrise },
        { name: 'Dzuhur', time: times.Dhuhr },
        { name: 'Ashar', time: times.Asr },
        { name: 'Magrib', time: times.Maghrib },
        { name: 'Isya', time: times.Isha }
    ];
    
    // Update setiap waktu sholat berdasarkan urutan
    const prayerElements = document.querySelectorAll('.space-y-0\\.5 > div');
    prayerElements.forEach((element, index) => {
        if (index < prayerMapping.length) {
            // Cari span terakhir yang berisi waktu (di sebelah kanan)
            const allSpans = element.querySelectorAll('span');
            const timeSpan = allSpans[allSpans.length - 1]; // Span terakhir adalah waktu
            
            if (timeSpan && timeSpan.classList.contains('font-semibold')) {
                timeSpan.textContent = prayerMapping[index].time;
            }
        }
    });
    
    // Update countdown
    updateCountdown(times);
}

// Hitung countdown ke waktu sholat berikutnya
function updateCountdown(times) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Hanya tampilkan countdown jika tanggal yang dipilih adalah hari ini
    if (today.getTime() !== selectedDay.getTime()) {
        const countdownElement = document.getElementById('countdownText');
        if (countdownElement) {
            countdownElement.textContent = 'Pilih hari ini untuk melihat countdown';
        }
        return;
    }
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Konversi waktu sholat ke menit
    const prayerTimes = [
        { name: 'Subuh', time: timeToMinutes(times.Fajr) },
        { name: 'Dzuhur', time: timeToMinutes(times.Dhuhr) },
        { name: 'Ashar', time: timeToMinutes(times.Asr) },
        { name: 'Magrib', time: timeToMinutes(times.Maghrib) },
        { name: 'Isya', time: timeToMinutes(times.Isha) }
    ];
    
    // Cari waktu sholat berikutnya
    let nextPrayer = null;
    for (let prayer of prayerTimes) {
        if (currentTimeInMinutes < prayer.time) {
            nextPrayer = prayer;
            break;
        }
    }
    
    const countdownElement = document.getElementById('countdownText');
    if (!countdownElement) return;
    
    // Jika tidak ada waktu sholat hari ini, gunakan Subuh besok
    if (!nextPrayer) {
        const minutesUntilMidnight = (24 * 60) - currentTimeInMinutes;
        const minutesAfterMidnight = prayerTimes[0].time;
        const totalMinutes = minutesUntilMidnight + minutesAfterMidnight;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        countdownElement.textContent = 
            `${hours} jam ${minutes} menit lagi menuju waktu ${prayerTimes[0].name}`;
        return;
    }
    
    const minutesLeft = nextPrayer.time - currentTimeInMinutes;
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    
    countdownElement.textContent = 
        `${hours} jam ${minutes} menit lagi menuju waktu ${nextPrayer.name}`;
}

// Helper: konversi waktu HH:MM ke menit
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Handler untuk tombol navigasi tanggal
function setupDateNavigation() {
    const prevButton = document.querySelector('.fa-chevron-left').closest('button');
    const nextButton = document.querySelector('.fa-chevron-right').closest('button');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDateDisplay();
            updatePrayerTimesDisplay();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay();
            updatePrayerTimesDisplay();
        });
    }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    updateDateDisplay();
    updatePrayerTimesDisplay();
    setupDateNavigation();
    
    // Update waktu setiap detik
    setInterval(() => {
        updateTime();
    }, 1000);
    
    // Update countdown setiap menit
    setInterval(() => {
        fetchPrayerTimes(currentDate).then(times => {
            updateCountdown(times);
        });
    }, 60000);
});
