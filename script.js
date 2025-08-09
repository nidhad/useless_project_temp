document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadZone = document.getElementById('uploadZone');
    const cutletUpload = document.getElementById('cutlet-upload');
    const cutletPreview = document.getElementById('cutlet-preview');
    const resultsContainer = document.getElementById('resultsContainer');
    const symmetryScore = document.getElementById('symmetry-score');
    const feedbackText = document.getElementById('feedback-text');
    const progressRing = document.querySelector('.progress-ring');

    // File upload handler
    cutletUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                cutletPreview.src = event.target.result;
                
                cutletPreview.onload = function() {
                    resultsContainer.style.display = 'block';
                    analyzeCutlet();
                };
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Main analysis function
    function analyzeCutlet() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = cutletPreview.naturalWidth || cutletPreview.width;
        canvas.height = cutletPreview.naturalHeight || cutletPreview.height;
        ctx.drawImage(cutletPreview, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Detect cutlet and calculate score
        const score = calculateShapeMatchScore(imageData, canvas.width, canvas.height);
        
        // Ensure score is valid (1-10)
        const finalScore = Math.max(1, Math.min(10, score));
        
        updateResults(finalScore.toFixed(1));
    }

    // Calculate how well the cutlet matches a perfect ellipse
    function calculateShapeMatchScore(imageData, width, height) {
        // Convert image to binary (cutlet = 1, background = 0)
        const binary = getBinaryMap(imageData);
        
        // Find the largest contour (the cutlet)
        const contour = findLargestContour(binary, width, height);
        
        if (!contour || contour.length < 5) {
            console.error("No valid cutlet contour found");
            return 5; // Default score if detection fails
        }
        
        // Fit an ellipse to the cutlet shape
        const ellipse = fitEllipseToContour(contour);
        
        if (!ellipse) {
            console.error("Ellipse fitting failed");
            return 5;
        }
        
        // Compare cutlet shape to the fitted ellipse
        const matchScore = compareShapeToEllipse(binary, width, height, ellipse);
        
        // Scale score to 1-10 range
        return 1 + matchScore * 9;
    }

    // Convert image to binary (1 = cutlet, 0 = background)
    function getBinaryMap(imageData) {
        const binary = [];
        const threshold = 100; // Adjust based on image darkness
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const brightness = (r + g + b) / 3;
            binary.push(brightness < threshold ? 1 : 0);
        }
        
        return binary;
    }

    // Find the largest continuous shape (the cutlet)
    function findLargestContour(binary, width, height) {
        // This is a simplified contour finder (replace with OpenCV for better accuracy)
        let maxArea = 0;
        let bestContour = null;
        
        // For each pixel, check if it's part of the cutlet
        const visited = new Array(width * height).fill(false);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                
                if (binary[idx] === 1 && !visited[idx]) {
                    // Found a new shape, trace its contour
                    const contour = traceContour(binary, width, height, x, y, visited);
                    const area = contour.length;
                    
                    if (area > maxArea) {
                        maxArea = area;
                        bestContour = contour;
                    }
                }
            }
        }
        
        return bestContour;
    }

    // Trace the outline of a shape (BFS algorithm)
    function traceContour(binary, width, height, startX, startY, visited) {
        const contour = [];
        const queue = [[startX, startY]];
        visited[startY * width + startX] = true;
        
        const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
        const dy = [-1, -1, -1, 0, 0, 1, 1, 1];
        
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            contour.push([x, y]);
            
            for (let i = 0; i < 8; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = ny * width + nx;
                    
                    if (binary[nIdx] === 1 && !visited[nIdx]) {
                        visited[nIdx] = true;
                        queue.push([nx, ny]);
                    }
                }
            }
        }
        
        return contour;
    }

    // Fit an ellipse to the cutlet shape (simplified)
    function fitEllipseToContour(contour) {
        if (contour.length < 5) return null;
        
        // Calculate center (average of all points)
        let sumX = 0, sumY = 0;
        for (const [x, y] of contour) {
            sumX += x;
            sumY += y;
        }
        
        const centerX = sumX / contour.length;
        const centerY = sumY / contour.length;
        
        // Calculate approximate axes
        let maxDist = 0, minDist = Infinity;
        
        for (const [x, y] of contour) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > maxDist) maxDist = dist;
            if (dist < minDist) minDist = dist;
        }
        
        return {
            center: { x: centerX, y: centerY },
            majorAxis: maxDist * 2,
            minorAxis: minDist * 2,
            angle: 0 // Simplified (no rotation)
        };
    }

    // Compare cutlet shape to fitted ellipse
    function compareShapeToEllipse(binary, width, height, ellipse) {
        let matchCount = 0;
        let totalCount = 0;
        
        // Sample points around the ellipse
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            // Ellipse point
            const ex = ellipse.center.x + Math.cos(angle) * ellipse.majorAxis / 2;
            const ey = ellipse.center.y + Math.sin(angle) * ellipse.minorAxis / 2;
            
            if (ex >= 0 && ex < width && ey >= 0 && ey < height) {
                const idx = Math.floor(ey) * width + Math.floor(ex);
                
                // Check if this point is part of the cutlet
                if (binary[idx] === 1) {
                    matchCount++;
                }
                
                totalCount++;
            }
        }
        
        // Calculate match percentage (0-1)
        return totalCount > 0 ? matchCount / totalCount : 0.5;
    }

    // Update results display
    function updateResults(score) {
        symmetryScore.textContent = score;
        
        // Update progress ring
        if (progressRing) {
            const circumference = 2 * Math.PI * 50;
            const offset = circumference - (score / 10) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        // Generate feedback
        const scoreNum = parseFloat(score);
        
        if (scoreNum >= 8.5) {
            feedbackText.textContent = "Perfect! This cutlet is geometrically ideal 🎯";
        } else if (scoreNum >= 6.5) {
            feedbackText.textContent = "Great shape! Almost perfectly round 🟢";
        } else if (scoreNum >= 4.5) {
            feedbackText.textContent = "Good! Slightly irregular but tasty 😋";
        } else {
            feedbackText.textContent = "Rustic style! Unique and homemade 🏡";
        }
    }
});