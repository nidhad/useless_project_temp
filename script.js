document.getElementById('cutlet-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('cutlet-preview');
            preview.src = event.target.result;
            preview.style.display = 'block';
            
            // Fake analysis (for demo)
            analyzeCutlet();
        }
        reader.readAsDataURL(file);
    }
});

function analyzeCutlet() {
    // Random score (0-10)
    const score = (Math.random() * 10).toFixed(1);
    document.getElementById('symmetry-score').textContent = score;

    // Funny feedback
    const feedback = document.getElementById('feedback-text');
    
    if (score >= 8) {
        feedback.textContent = "Perfect! This cutlet belongs in a museum.";
    } else if (score >= 5) {
        feedback.textContent = "Decent. Could use more symmetry, but still tasty.";
    } else {
        feedback.textContent = "Lopsided! Did you fry this in the dark?";
    }
}


// Smooth scroll down arrow (if you add more sections later)
document.querySelector('.scroll-down').addEventListener('click', () => {
    window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
    });
});

// Add any other animations here