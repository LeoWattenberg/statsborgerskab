// Global state
let allQuestions = [];
let quizQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let selectedCategories = new Set(['Legal', 'Historical', 'Current']);
let totalSelectedQuestions = 0;

// Load questions from the JSON data
async function loadQuestions() {
    try {
        // Wait for data to be loaded by data-loader.js
        let attempts = 0;
        while (typeof window.all_questions === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof window.all_questions !== 'undefined') {
            allQuestions = window.all_questions;
            initializeCategoryScreen();
        } else {
            console.error('Failed to load questions');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Initialize the category selection screen
function initializeCategoryScreen() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const categoryCounts = {};
    
    // Count questions by category
    allQuestions.forEach(q => {
        if (q.category) {
            q.category.forEach(cat => {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        }
    });
    
    // Update category counts in UI
    const categories = ['Legal', 'Historical', 'Current', 'Political', 'Cultural', 'Sports', 'danish values'];
    categories.forEach(cat => {
        const countEl = document.querySelector(`[data-category="${cat}"]`);
        if (countEl) {
            countEl.textContent = categoryCounts[cat] || 0;
        }
    });
    
    // Add event listeners to checkboxes
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCategorySelection);
    });
    
    // Initialize selected categories
    selectedCategories = new Set(['Legal', 'Historical', 'danish values']);
    updateCategorySelection();
    
    // Start button listener
    document.getElementById('startBtn').addEventListener('click', startQuiz);
}

function updateCategorySelection() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    selectedCategories = new Set(Array.from(categoryCheckboxes).map(cb => cb.value));
    
    // Filter questions by selected categories
    const filteredQuestions = allQuestions.filter(q => {
        return q.category && q.category.some(cat => selectedCategories.has(cat));
    });
    
    // Update total count
    const totalCount = filteredQuestions.length;
    document.getElementById('totalCount').textContent = totalCount;
    
    // Enable/disable start button
    document.getElementById('startBtn').disabled = totalCount === 0;
}

function startQuiz() {
    // Filter questions by selected categories
    const filteredQuestions = allQuestions.filter(q => {
        return q.category && q.category.some(cat => selectedCategories.has(cat));
    });
    
    // Store total selected questions count
    totalSelectedQuestions = filteredQuestions.length;
    
    // Shuffle and set quiz questions
    quizQuestions = shuffleArray([...filteredQuestions]);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    
    // Update screen
    switchScreen('quizScreen');
    displayQuestion();
}

function displayQuestion() {
    if (quizQuestions.length === 0) {
        endQuiz();
        return;
    }
    
    const question = quizQuestions[currentQuestionIndex];
    
    // Update progress
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = totalSelectedQuestions;
    
    const progressPercent = ((currentQuestionIndex) / totalSelectedQuestions) * 100;
    document.getElementById('progressFill').style.width = Math.max(progressPercent, 5) + '%';
    
    // Update scores
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('wrongCount').textContent = wrongAnswers;
    
    // Display question
    document.getElementById('questionText').textContent = question.question;
    
    // Display options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const optionLabels = ['A', 'B', 'C'];
    optionLabels.forEach((label, index) => {
        if (question.options[label]) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <span class="option-label">${label}.</span>
                <span class="option-text">${question.options[label]}</span>
            `;
            optionDiv.addEventListener('click', () => answerQuestion(label, question));
            optionsContainer.appendChild(optionDiv);
        }
    });
    
    // Hide feedback
    document.getElementById('feedbackContainer').style.display = 'none';
}

function answerQuestion(selectedLabel, question) {
    const isCorrect = selectedLabel === question.answer;
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.add('disabled'));
    
    // Mark selected option
    const selectedOption = Array.from(options).find(opt => 
        opt.textContent.includes(`${selectedLabel}.`)
    );
    selectedOption.classList.add('selected');
    
    // Mark correct and wrong options
    const correctOption = Array.from(options).find(opt => 
        opt.textContent.includes(`${question.answer}.`)
    );
    correctOption.classList.add('correct');
    
    if (!isCorrect) {
        selectedOption.classList.add('wrong');
    }
    
    // Update counters
    if (isCorrect) {
        correctAnswers++;
    } else {
        wrongAnswers++;
        // Add question back to the end of the queue
        quizQuestions.push(question);
    }
    
    // Show feedback
    const feedbackContainer = document.getElementById('feedbackContainer');
    const feedbackContent = document.getElementById('feedbackContent');
    
    if (isCorrect) {
        feedbackContent.className = 'feedback-content correct';
        feedbackContent.textContent = '✓ Rigtigt! Godt gået!';
    } else {
        feedbackContent.className = 'feedback-content wrong';
        feedbackContent.innerHTML = `✗ Forkert! Det rigtige svar er <strong>${question.answer}.</strong>`;
    }
    
    feedbackContainer.style.display = 'block';
    
    // Show next button
    document.getElementById('nextBtn').addEventListener('click', nextQuestion, { once: true });
}

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

function endQuiz() {
    const totalAnswered = correctAnswers + wrongAnswers;
    const percentage = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    
    document.getElementById('finalPercentage').textContent = percentage;
    document.getElementById('finalCorrect').textContent = correctAnswers;
    document.getElementById('finalWrong').textContent = wrongAnswers;
    document.getElementById('finalTotal').textContent = totalAnswered;
    
    switchScreen('resultsScreen');
    
    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
}

function restartQuiz() {
    switchScreen('categoryScreen');
    selectedCategories = new Set(['Legal', 'Historical', 'Current']);
    updateCategoryCheckboxes();
    updateCategorySelection();
}

function updateCategoryCheckboxes() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = selectedCategories.has(checkbox.value);
    });
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Exit button listener
document.getElementById('exitBtn').addEventListener('click', () => {
    if (confirm('Er du sikker på at du vil afslutte quizzen?')) {
        restartQuiz();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadQuestions);
