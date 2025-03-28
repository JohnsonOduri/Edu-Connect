
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:8080', // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.post('/generate-assignment', (req, res) => {
    // Your API logic here
    res.json({ message: 'Assignment generated' });
});

// Add endpoint for checking plagiarism
app.post('/check-plagiarism', (req, res) => {
    // In a real app, this would connect to a plagiarism detection service
    const { text } = req.body;
    
    // Simulate response delay
    setTimeout(() => {
        const plagiarismScore = Math.floor(Math.random() * 100);
        
        res.json({
            plagiarismScore,
            analysis: [
                "Text analyzed for common patterns and online matches.",
                "Linguistic analysis performed to detect unusual writing styles.",
                "Paragraph structures examined for consistency."
            ],
            matchedSources: plagiarismScore > 30 ? [
                "www.example.com/essay-resources (73% match)",
                "www.academicpapers.org/topics/science (41% match)"
            ] : []
        });
    }, 1500);
});

// Add endpoint for generating lesson plans
app.post('/generate-lesson-plan', (req, res) => {
    // In a real app, this would connect to Gemini API
    const { subject, topic, gradeLevel, duration } = req.body;
    
    // Simulate response delay
    setTimeout(() => {
        res.json({
            mainTopic: topic,
            subtopics: [
                {
                    title: "Introduction to " + topic,
                    description: "Basic concepts and historical context",
                    activities: ["Group discussion", "Video introduction", "Interactive timeline"],
                    resources: ["Introductory video", "Digital timeline", "Reading materials"]
                },
                {
                    title: "Core Concepts of " + topic,
                    description: "Detailed exploration of fundamental principles",
                    activities: ["Guided practice", "Concept mapping", "Digital simulation"],
                    resources: ["Practice worksheet", "Digital simulation tool", "Visual aids"]
                }
            ],
            learningObjectives: [
                "Students will explain the key principles",
                "Students will apply concepts to solve problems",
                "Students will analyze real-world examples"
            ],
            suggestedTimeframe: duration,
            assessmentIdeas: [
                "Portfolio of concept applications",
                "Project-based assessment with presentation",
                "Formative quizzes throughout the unit"
            ]
        });
    }, 1500);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
