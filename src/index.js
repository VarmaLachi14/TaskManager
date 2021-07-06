const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/userRoute')
const TaskRouter = require('./routers/taskRoute')

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(TaskRouter)


app.listen(port, () => {
    console.log("Server Started at port" + port)
})

