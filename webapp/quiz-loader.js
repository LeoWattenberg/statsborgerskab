// This file loads the questions data
// It's meant to be included before quiz.js

fetch('data/all_questions.json')
    .then(response => response.json())
    .then(data => {
        window.all_questions = data;
    })
    .catch(error => console.error('Error loading questions:', error));
