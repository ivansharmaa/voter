// Smart Contract Configuration
// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
const CONTRACT_ABI = [
    // Add your contract ABI here after deployment
];

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const pages = document.querySelectorAll('.page');
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const voteMessage = document.getElementById('vote-message');
const candidatesContainer = document.getElementById('candidates-container');
const resultsContainer = document.getElementById('results-container');
const totalVotesElement = document.getElementById('total-votes');

// Candidates data
let candidates = [
    { id: 1, name: "ARVIND MEEENA", voteCount: 0 },
    { id: 2, name: "RUDRA PRATAP", voteCount: 0 },
    { id: 3, name: "IVAN SHARMA", voteCount: 0 }
];

// Load saved vote counts from localStorage
function loadSavedVotes() {
    const savedVotes = localStorage.getItem('candidateVotes');
    if (savedVotes) {
        const parsedVotes = JSON.parse(savedVotes);
        candidates = candidates.map(candidate => {
            const savedCandidate = parsedVotes.find(c => c.id === candidate.id);
            return savedCandidate ? { ...candidate, voteCount: savedCandidate.voteCount } : candidate;
        });
    }
}

// Save vote counts to localStorage
function saveVotes() {
    localStorage.setItem('candidateVotes', JSON.stringify(candidates));
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target page
        pages.forEach(page => {
            if (page.id === targetPage) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    });
});

// Feature buttons on home page
document.querySelectorAll('.btn[data-page]').forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.getAttribute('data-page');
        const targetLink = document.querySelector(`.nav-links a[data-page="${targetPage}"]`);
        targetLink.click();
    });
});

// Registration Form
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    // Check if email contains @nith.ac.in
    if (email.includes('@nith.ac.in')) {
        // Store the verified email in localStorage
        localStorage.setItem('verifiedEmail', email);
        showMessage(registerMessage, 'Registration successful! You can now vote.', 'success');
    } else {
        showMessage(registerMessage, 'Please use a valid NIT Hamirpur email address (@nith.ac.in)', 'error');
    }
});

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

// Check if user is registered
function checkRegistration() {
    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (!verifiedEmail) {
        showMessage(voteMessage, 'Please register first with your college email', 'error');
        return false;
    }
    return true;
}

// Load candidates
function loadCandidates() {
    if (!checkRegistration()) return;
    
    // Display candidates
    displayCandidates(candidates);
}

// Display candidates in the UI
function displayCandidates(candidates) {
    candidatesContainer.innerHTML = '';
    
    candidates.forEach(candidate => {
        const candidateCard = document.createElement('div');
        candidateCard.className = 'candidate-card';
        candidateCard.innerHTML = `
            <h3>${candidate.name}</h3>
            <p>Current Votes: ${candidate.voteCount}</p>
            <button class="btn primary" data-id="${candidate.id}">Vote</button>
        `;
        
        candidatesContainer.appendChild(candidateCard);
    });
    
    // Add event listeners to vote buttons
    document.querySelectorAll('.candidate-card button').forEach(button => {
        button.addEventListener('click', () => {
            const candidateId = parseInt(button.getAttribute('data-id'));
            castVote(candidateId);
        });
    });
}

// Cast vote function
function castVote(candidateId) {
    // Check if user has already voted
    const hasVoted = localStorage.getItem('hasVoted');
    if (hasVoted) {
        showMessage(voteMessage, 'You have already cast your vote!', 'error');
        return;
    }
    
    // Find the candidate and increment their vote count
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
        candidate.voteCount++;
        
        // Mark user as having voted
        localStorage.setItem('hasVoted', 'true');
        
        // Save the updated vote counts
        saveVotes();
        
        showMessage(voteMessage, 'Vote cast successfully!', 'success');
        
        // Reload candidates to update vote counts
        loadCandidates();
        
        // Update results if on results page
        if (document.getElementById('results').classList.contains('active')) {
            loadResults();
        }
    }
}

// Load and display results
function loadResults() {
    // Calculate total votes
    const total = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    // Display results
    displayResults(candidates, total);
}

// Display results in the UI
function displayResults(candidates, total) {
    resultsContainer.innerHTML = '';
    totalVotesElement.textContent = total;
    
    candidates.forEach(candidate => {
        const percentage = total > 0 ? (candidate.voteCount / total) * 100 : 0;
        const formattedPercentage = percentage.toFixed(1);
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.innerHTML = `
            <h3>${candidate.name}</h3>
            <p>Votes: ${candidate.voteCount}</p>
            <div class="progress-container">
                <div class="progress-bar" data-candidate="${candidate.id}" style="width: ${percentage}%">
                    <span class="vote-percentage">${formattedPercentage}%</span>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(resultCard);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load saved votes from localStorage
    loadSavedVotes();
    
    // Load candidates when vote page is shown
    document.querySelector('a[data-page="vote"]').addEventListener('click', loadCandidates);
    
    // Load results when results page is shown
    document.querySelector('a[data-page="results"]').addEventListener('click', loadResults);
}); 