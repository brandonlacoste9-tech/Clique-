// View Navigation
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const viewName = button.getAttribute('data-view');
        
        // Update active nav button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active view
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewName}-view`).classList.add('active');
        
        // Initialize camera if camera view is activated
        if (viewName === 'camera') {
            initCamera();
        }
    });
});

// Camera Functionality
let cameraStream = null;
const cameraFeed = document.getElementById('camera-feed');
const captureBtn = document.getElementById('capture-btn');
const flashOverlay = document.querySelector('.flash-overlay');

async function initCamera() {
    // If camera is already initialized, don't reinitialize
    if (cameraStream) {
        return;
    }
    
    try {
        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: false 
        });
        cameraFeed.srcObject = cameraStream;
    } catch (error) {
        console.log('Camera access not available:', error);
        // Show placeholder instead
        cameraFeed.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gold-primary);
            font-size: 18px;
            text-align: center;
            padding: 20px;
        `;
        placeholder.textContent = 'Camera access not available.\nThis is a demonstration of The Lens interface.';
        document.querySelector('.viewfinder-frame').appendChild(placeholder);
    }
}

// Capture button functionality
captureBtn.addEventListener('click', () => {
    // Trigger the burnished gold flash effect
    flashOverlay.classList.add('flash');
    
    // Remove the flash class after animation completes
    setTimeout(() => {
        flashOverlay.classList.remove('flash');
    }, 500);
    
    // Here you would normally capture the photo
    console.log('Dispatch captured!');
});

// Initialize camera on page load if camera view is active
if (document.getElementById('camera-view').classList.contains('active')) {
    initCamera();
}

// Dispatch (Sealed Message) Functionality
const dispatchItems = document.querySelectorAll('.dispatch-item');
const dispatchViewer = document.getElementById('dispatch-viewer');
const closeDispatchBtn = document.getElementById('close-dispatch');

dispatchItems.forEach(item => {
    item.addEventListener('click', function() {
        // Add seal breaking animation
        const seal = this.querySelector('.wax-seal');
        seal.style.animation = 'sealBreak 0.5s ease';
        
        // Show dispatch viewer after seal breaks
        setTimeout(() => {
            dispatchViewer.classList.add('active');
            seal.style.animation = '';
        }, 500);
    });
});

// Close dispatch viewer
closeDispatchBtn.addEventListener('click', () => {
    dispatchViewer.classList.remove('active');
});

// Close dispatch viewer when clicking outside content
dispatchViewer.addEventListener('click', (e) => {
    if (e.target === dispatchViewer) {
        dispatchViewer.classList.remove('active');
    }
});

// Add seal breaking animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sealBreak {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(-5deg); }
        50% { transform: scale(1.05) rotate(5deg); }
        75% { transform: scale(1.1) rotate(-3deg); }
        100% { transform: scale(0.95) rotate(0deg); opacity: 0.7; }
    }
`;
document.head.appendChild(style);

// Cleanup camera on page unload
window.addEventListener('beforeunload', () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
});
