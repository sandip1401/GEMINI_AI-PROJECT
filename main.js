const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const express=require('express')
const bodyparser=require('body-parser')
const app=express()
const connectDB = require('./db/db');
connectDB();
app.use(express.json());
app.use(bodyparser.json())

const userRoutes=require('./routes/userRoutes');
const quizRoutes=require('./routes/quizRoutes');
app.use('/user',userRoutes);
app.use('/quiz',quizRoutes);

app.listen(3000, ()=>{
    console.log("Server is running...")
})



