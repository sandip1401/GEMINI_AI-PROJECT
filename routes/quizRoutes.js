const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const express = require('express');
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const User=require('../models/user');
const { jwtAuthMiddleware } = require("../middleware/jwt");

const users = []; // store users { email, password }


const generate = async(question)=>{
    try{
        const result = await model.generateContent(question);
        return result.response.text();
    }
    catch(err){
        console.log(err);
    }
}

const checkAdmin=async(userId)=>{
    try{
        const user=await User.findById(userId);
        if(user.role==='admin'){
            return true;
        }
    }
    catch(err){
        return false;
    }
}

// In-memory store for quizzes
const quizzes = {};  // Format: { quizId: { questions: [...], answers: [...] } }

router.post("/generate-quiz", jwtAuthMiddleware, async (req, res) => {
    const topic = req.body.topic;
    const prompt = `Generate 10 multiple choice questions on the topic "${topic}". 
Each question must have 4 options labeled A to D, and include the correct answer.
Respond strictly in this JSON format:

[
  {
    "question": "What is the capital of India?",
    "options": ["A. Delhi", "B. Mumbai", "C. Kolkata", "D. Chennai"],
    "answer": "A"
  }
]`;

    try {
        const rawResult = await generate(prompt);
        console.log("RAW GEMINI OUTPUT:", rawResult);

        // Clean markdown block if needed
        let cleaned = rawResult.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/```json|```/g, "").trim();
        }

        const start = cleaned.indexOf("[");
        const end = cleaned.lastIndexOf("]") + 1;
        const jsonText = cleaned.substring(start, end);
        const fullQuiz = JSON.parse(jsonText); // contains questions + answers

        // Separate questions and answers
        const questions = fullQuiz.map(q => ({
            question: q.question,
            options: q.options
        }));
        const answers = fullQuiz.map(q => q.answer); // just "A", "B", etc.

        // Store in-memory
        const quizId = `quiz_${Date.now()}`;
        quizzes[quizId] = { questions, answers };
        console.log(quizzes);
        // Send only questions to frontend
        res.status(200).json({ message: "Quiz generated", quizId, questions });

    } catch (err) {
        console.error("Error parsing Gemini response:", err);
        res.status(500).json({ message: "Failed to generate quiz" });
    }
});

const scores = []; // Store { userId, score }

function addScore(userId, score) {
    scores.push({ userId, score });
}

function getScores() {
    return scores;
}

router.post("/submit-quiz", jwtAuthMiddleware, (req, res) => {
    const { quizId, answers } = req.body;
    const correctAnswers = quizzes[quizId]?.answers;

    if (!correctAnswers) {
        return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
        if (answers[i] === correctAnswers[i]) score++;
    }

    addScore(req.user.id, score); // Store student score
    res.json({ message: "Quiz submitted", score });
});

router.get("/all-scores", jwtAuthMiddleware, async(req, res) => {
    const user=await User.findById(req.user.id.id);
        if(user.role !=='teacher'){
            return res.status(403).json({message: 'user has not admin role'});
        }

    const allScores = getScores(); // from model or memory
    res.status(200).json({ scores: allScores });
});


module.exports=router;