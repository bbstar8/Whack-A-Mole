document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const loadingText = loader.querySelector('.loading-text');

    let percent = 0;
    const interval = setInterval(()=>{
        percent++;
        loadingText.textContent = `${percent}%`;

        if (percent >= 100){
            clearInterval(interval);
            setTimeout(()=>{loader.classList.add('hidden');}, 300);
        }
    }, 30)
})