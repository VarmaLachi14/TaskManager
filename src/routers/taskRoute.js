const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/tasks',auth,async (req,res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    
    try {
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//GET /tasks ?completed = false, completed = true....

router.get('/tasks',auth,async (req,res) => {

    console.log(req.query)
    const match = {}
    if(req.query.completed){
         match.completed = req.query.completed === 'true'
    }

    try{
        await req.user.populate({
            path : 'anyName',
            match
        }).execPopulate()


        res.send(req.user.anyName)
    }catch(e){
        res.send(e)
    }
})

router.get('/tasks/:id',auth,async (req,res) => {

    const _id = req.params.id
    try{
        const task = await Task.findOne({_id , owner : req.user._id})
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id',auth,async (req,res) => {

    const updates = Object.keys(req.body)
    const availableUpdates = ['completed','description']
    const updateValidation = updates.every((go) => availableUpdates.includes(go))

    if(!updateValidation){
        return res.status(400).send("Hey it is not in the fields")
    }

    try{
        const task = await Task.findOne({_id : req.params.id , owner : req.user._id})
        updates.forEach((loop) => task[loop] = req.body[loop] )
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/task/:id',auth,async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({_id : req.params.id,owner : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.send(500).send("error")
    }
})

module.exports = router