
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadZone = document.getElementById('uploadZone');
    const cutletUpload = document.getElementById('cutlet-upload');
    const cutletPreview = document.getElementById('cutlet-preview');
    const resultsContainer = document.getElementById('resultsContainer');
    const symmetryScore = document.getElementById('symmetry-score');
    const feedbackText = document.getElementById('feedback-text');
    const progressRing = document.querySelector('.progress-ring');

    // Debug check
    console.log("DOM loaded - elements found:", {
        uploadZone, cutletUpload, cutletPreview, 
        resultsContainer, symmetryScore, feedbackText,
        progressRing
    });

    // File upload handler
    cutletUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Show preview
                cutletPreview.src = event.target.result;
                
                // Show results section
                resultsContainer.style.display = 'block';
                
                // Analyze the cutlet
                analyzeCutlet();
            }
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Drag and drop functionality
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            cutletUpload.files = e.dataTransfer.files;
            const changeEvent = new Event('change');
            cutletUpload.dispatchEvent(changeEvent);
        }
    });

    // Analysis function
    function analyzeCutlet() {
        console.log("Analyzing cutlet...");
        
        // Generate random score (0-10)
        const score = (Math.random() * 10).toFixed(1);
        symmetryScore.textContent = score;
        
        // Update progress ring
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (score / 10) * circumference;
        progressRing.style.strokeDashoffset = offset;
        
        // Generate feedback
        generateFeedback(score);
    }

    // Feedback generator
    function generateFeedback(score) {
        const scoreNum = parseFloat(score);
        let feedback;
        
        if (scoreNum >= 8) {
            feedback = "Masterpiece! This cutlet belongs in the Louvre.";
        } else if (scoreNum >= 5) {
            feedback = "Decent effort. Could use more symmetry practice.";
        } else {
            feedback = "Did you shape this with your eyes closed?";
        }
        
        feedbackText.textContent = feedback;
    }
});



// Smooth scroll down arrow (if you add more sections later)
document.querySelector('.scroll-down').addEventListener('click', () => {
    window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
    });
});

// Add any other animations here