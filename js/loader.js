document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const loadingText = loader.querySelector('.loading-text');
    const howToPlayModal = document.getElementById('how-to-play-modal');

    let percent = 0;
    const interval = setInterval(()=>{
        percent++;
        loadingText.textContent = `${percent}%`;

        if (percent >= 100){
            clearInterval(interval);
            setTimeout(()=>{
                loader.classList.add('hidden');
            howToPlayModal.classList.remove('hidden');
        howToPlayModal.classList.add('flex');
    }, 300);
        }
    }, 30);

    // Proceed button
    document.getElementById('proceed-btn').addEventListener('click', () => {
    howToPlayModal.classList.remove('flex');
    howToPlayModal.add('hidden');
});
});



