const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const express=require('express')
const bodyparser=require('body-parser')
const app=express()
app.use(express.json());
app.use(bodyparser.json())

app.get('/', async(req,res)=>{
    res.send("Hello sandip...")
})

app.listen(3000, ()=>{
    console.log("Server is running...")
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const prompt = "who is mukesh ambani";

const generate = async(question)=>{
    try{
        const result = await model.generateContent(question);
        return result.response.text();
    }
    catch(err){
        console.log(err);
    }
}

app.get('/content', async (req,res)=>{
    try{
        const data=req.body.question;
        const result= await generate(data)
        res.send({
            "result": result
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "server error"})
    }
})

// generate();