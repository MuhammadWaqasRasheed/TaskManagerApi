const express = require('express')
const router = new express.Router()
const User = require('../models/user') 
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail , sendCancelationEmail } = require('../emails/account')

//signup
router.post('/user',async (req,res)=>{
    const user = new User( req.body )
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generteAuthToken()
        res.status(201).send({ user,token })
    }
    catch(e){
        res.status(400).send(e)
    }
})
//login route
router.post('/users/login',async (req,res)=>{
    try{
        const user =await User.findByCredentials(req.body.email , req.body.password)
        const token =await user.generteAuthToken()
        res.send({ user , token })
    }catch(e){
        res.send(400).send()
    }
})
//logout
router.post('/users/logout',auth,async (req,res)=>{
    console.log('\nlogout\n')
    try{
        req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token )
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
//Task Logout all
router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//reading all users
router.get('/users/me',auth,async (req,res)=>{
    //this code will only run if auth run successfully
    res.send(req.user)
})
//reading user by id
router.get('/users/:id',async (req,res)=>{
     const _id = req.params.id
     try{
        const user = await User.findById(_id)
        if(user===null){
            res.status(404).send()
        }
        res.send(user)
     }
     catch(e){
        res.status(500).send()
     }
})
//update user by id
router.patch('/users/me',auth,async (req,res)=>{
    //user may try to update properties that donot exists
    const updates = Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(404).send('error : Ivalid Updates.')
    }

    try{
        //when we update this than our update middle ware will not run,so we an alternative to update
        //const user = await User.findByIdAndUpdate( req.params.id , req.body , { new:true , runValidators:true } )
        //alternative is as follow
        updates.forEach((update)=> req.user[update]= req.body[update] )
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        return res.status(500).send(e)
    }
})
//delete user by id
router.delete('/users/me',auth ,async (req,res)=>{
    try{
        await req.user.remove()  //deleting the user from database
        sendCancelationEmail(req.user.email,req.user.name)
        //sendWelcomeEmail(user.email,user.name)
        return res.status(200).send(req.user)
    }
    catch(e){
        return res.status(500).send(e)
    }
})

//image upload
const upload = multer({ 
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return callback(new Error('Please Upload jpg , jpeg or png file.'))
        }
        callback(undefined,true)
    }
 })

//save Avatar
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

//delete Avatar
router.delete('/users/avatars/me',auth,async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send() 
})

//get avatar by using user id
//
router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if( !user || !user.avatar ){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})
module.exports = router