// Update waktu real-time
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
}

// Hitung countdown ke waktu sholat berikutnya
function updateCountdown() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Waktu sholat dalam menit dari tengah malam
    const prayerTimes = [
        { name: 'Subuh', time: 4 * 60 + 53 },
        { name: 'Dzuhur', time: 12 * 60 + 14 },
        { name: 'Ashar', time: 15 * 60 + 21 },
        { name: 'Magrib', time: 18 * 60 + 37 },
        { name: 'Isya', time: 19 * 60 + 26 }
    ];
    
    // Cari waktu sholat berikutnya
    let nextPrayer = null;
    for (let prayer of prayerTimes) {
        if (currentTimeInMinutes < prayer.time) {
            nextPrayer = prayer;
            break;
        }
    }
    
    // Jika tidak ada waktu sholat hari ini, gunakan Subuh besok
    if (!nextPrayer) {
        nextPrayer = prayerTimes[0];
        const minutesUntilMidnight = (24 * 60) - currentTimeInMinutes;
        const minutesAfterMidnight = nextPrayer.time;
        const totalMinutes = minutesUntilMidnight + minutesAfterMidnight;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        document.getElementById('countdownText').textContent = 
            `${hours} jam ${minutes} menit lagi menuju waktu ${nextPrayer.name}`;
        return;
    }
    
    const minutesLeft = nextPrayer.time - currentTimeInMinutes;
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    
    document.getElementById('countdownText').textContent = 
        `${hours} jam ${minutes} menit lagi menuju waktu ${nextPrayer.name}`;
}

// Update setiap detik
setInterval(() => {
    updateTime();
    updateCountdown();
}, 1000);

// Jalankan saat halaman dimuat
updateTime();
updateCountdown();
