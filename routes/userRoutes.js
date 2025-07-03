const express=require('express');
const router=express.Router();
const User=require('./../models/user');
const {jwtAuthMiddleware, generateToken}= require('../middleware/jwt');

router.post('/signup', async(req,res)=>{
    try{
        const data = req.body 

        const newUser= new User(data);
        
        const response=await newUser.save();
        console.log('data saved');
        const payload={
            id: response.id,
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload)
        console.log("Token is :", token);
        res.status(200).json({message:"signup succesfully",result: response, token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})

router.post('/login', async(req,res)=>{
    try{
        console.log("first")
        const {mobile,password}=req.body;

        const user=await User.findOne({mobile:mobile});
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'})
        }
        //generate token
        const payload={
            id:user.id
        }
        const token=generateToken(payload)
        res.status(200).json({message:"login succesfully",token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})

router.put('/forgot-password', async(req,res)=>{
    console.log("first")
    try{
        const {mobile,currentpassword,newPassword}=req.body;
        if(!mobile || !currentpassword|| !newPassword){
            return res.status(400).json({error:'mobile no, password, newpassword required'})
        }

        const user=await User.findOne({mobile});
        if(!user){
            return res.status(404).json({error:'User not found'});
        }

        const isMatch=await user.comparePassword(currentpassword)
        if(!isMatch){
            return res.status(401).json({error:'current password is not matched'})
        }
        user.password=newPassword;
        await user.save();
        res.status(200).json({message:'password updated successfully'})
    }
    catch{
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})


 
module.exports = router;