const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middlewares/auth')

//creating a task
router.post('/task',auth,async (req,res)=>{
    //console.log(req.body)
    try{
        const task = new Task({
            ...req.body,   //using spread operator to copy all of its values
            owner:req.user._id
        })
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})
//task read all records
//tasks?sortBy=status:desc
//tasks?limit=2&skip=2
//
router.get('/tasks',auth,async (req,res)=>{
    const match={}
    sort={}
    if(req.query.completed){
        match.status = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        parts = req.query.sortBy.split(':')
        console.log(parts)
        sort[ parts[0] ] = parts[1]==='desc'?-1:1;
    }

    try{
        await req.user.populate({
            path:'tasks',
            match:match,
            options:{
                //it req.query.limit is not set than it will be ignored
                limit:parseInt( req.query.limit ),
                skip:parseInt( req.query.skip ),
                sort
            }
        }).execPopulate()
        const tasks = req.user.tasks
        res.status(200).send(tasks)
    }
    catch(e){
        res.status(500).send(e)
    }
})
//task read task by id
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id , owner: req.user._id })
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})
//task update task
router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title','desc','status']
    const isAllowed = updates.every((update)=> allowedUpdates.includes(update))
    if( !isAllowed ){
        return res.status(404).send('error : Ivalid Updates.')
    }
    try{
        //const user = await User.findByIdAndUpdate( req.params.id , req.body , { new:true , runValidators:true } )
        //const task = await Task.findByIdAndUpdate( req.params.id , req.body ,{new:true, runValidators:true} )
        const _id = req.params.id
        //const task =await Task.findById( req.params.id )
        const task = await Task.findOne({ _id , owner:req.user._id })
                
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update] = req.body[update] )
        await task.save()
        return res.status(200).send(task)
    }
    catch(e){
        return res.status(500).send(e)
    }
})
//task-->delete task by id
router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        //const task = await Task.findByIdAndDelete( req.params.id )
        const _id = req.params.id
        //we can also use here Task.findOneAndDelete({ _id ,owner:req.user._id })
        const task = await Task.findOne({ _id ,owner:req.user._id })
        if(!task){
            return res.status(404).send('Invalid Task Id.')
        }
        task.remove()
        return res.status(200).send(task)
    }
    catch(e){
        return res.status(500).send(e)
    }
})

router.post('/tasks/login',async (req,res)=>{
    
    try{
        const task =await Task.findOne( req.body.title , req.body.desc )
        res.send(task)
    }catch(e){
        res.send(e)
    }

    //return res.send('Allah Almighty Is Greatest Of All')
})

module.exports = router