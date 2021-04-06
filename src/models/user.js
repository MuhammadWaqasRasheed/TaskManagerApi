const mongoose = require('mongoose');
const validator = require('validator');
const chalk = require('chalk');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')
const sharp = require('sharp');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,  //built in vaidtion
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid.')
            }
        }
    },
    age:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:8
    },
    avatar:{
        type: Buffer  //for storing images
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
}, {
    timestamps:true
})
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable To Login')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable To Login')
    }
    return user
}

//returns same user but eleminate password and auth tokens from it for security reasons
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}


userSchema.methods.generteAuthToken = async function(){
    const user = this
    //generatig a token
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

//hash the plain text password before saving
userSchema.pre('save',async function (next){
    //console.log(chalk.green.inverse('Message just before saving user'))
    const user = this
    if( user.isModified('password') ){
        
        user.password = await bcrypt.hash(user.password,8)
        //console.log(chalk.red.inverse(user.password))
    }
    next()
})

//deleting all tasks before deleting a user
userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({ owner:user._id })
    next()
})
//creating  a model
const User = mongoose.model('User',userSchema)

//making object
// const obj = new User({
//     name:'Hazrat Muhammad(Peace Be upon Him)',
//     email:'waqasrasheed438@gmail.com',
//     password:'Waqas12345',
//     age:63
// })
// // saving to
// obj.save().then((res)=>{
//     console.log(res)
//  }).catch(error=>{
//      console.log(error)
//  })
module.exports = User