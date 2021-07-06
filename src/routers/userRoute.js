const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()



router.post('/users', async (req,res) => {
    const user = new User(req.body)
    
    try{
        await user.save()
        const token = await user.generateAuthToken()
       res.status(201).send({user,token})
    }catch (e){
        res.status(400).send(e)
    }

})

router.post('/users/login',async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch (e){
        res.status(400).send()
    }
})

router.post('/users/logout',auth, async (req,res) => {
    try{
        req.user.tokens = []

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logout/all',auth, async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => false)

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


router.get('/users/me',auth,async (req,res) => {
    res.send(req.user)
})

// router.get('/users/:id',async (req,res) => {
//     const _id = req.params.id
    
//     try{
//         const user = await User.findById(_id)
//         res.send(user)
//     }catch(e){
//         res.status(500).send()        
//     }
// })

router.patch('/users/me',auth,async(req,res) => {
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['age','name','email','password']
    const isValid = updates.every( (go) => allowedUpdates.includes(go) )

    if(!isValid){
        return res.status(400).send("Hey it is not in the fields")
    }
    try{

        // const user = await User.findById(req.params.id)
        updates.forEach((loop) => {
            req.user[loop] = req.body[loop]
        } )
        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new : true ,runValidators: true})
        
        // if(!user){
        //     return res.status(404).send()
        // }
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

router.delete('/users/me',auth,async (req,res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.send(500).send("error")
    }
})

const upload = multer({
    limits : {
        fieldSize : 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Not an Image File")) 
        }
        cb(undefined,true)
    }

})

router.post('/users/me/avatar',auth,upload.single('match'),async (req,res) => {
    req.user.awatar = req.file.buffer
    await req.user.save()
    res.send()
},(err,req,res,next) => {
    res.status(400).send({err : err.message})
})

router.delete('/users/me/avatar',auth,async (req,res) => {
    req.user.awater = undefined
    await req.user.save()
    res.send('Deleted')
})

router.get('/users/:id/avatar',async (req,res) => {
    const user = await User.findOne({_id : req.params.id})

    res.set('Content-Type','image/jpg')
    res.send(user.awatar)
})

module.exports = router