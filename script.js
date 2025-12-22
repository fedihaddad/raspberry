function updateDateTime() {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const date = now.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById("time").innerText = time;
    document.getElementById("date").innerText = date;
}

setInterval(updateDateTime, 1000);
updateDateTime();
