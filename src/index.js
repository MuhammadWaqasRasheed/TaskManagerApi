const express = require('express')
require('./db/mongoose')  //including this file ensures that file will run
const UserRouter = require('./routers/user')
const TaskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT 

app.use(express.json())

//registering user & Task router
app.use(UserRouter)
app.use(TaskRouter)

app.listen(PORT,()=>{
    console.log('Server is up and running on PORT : '+PORT)
})

//Eample how to use multer(imaes uloading library)
// const multer =  require('multer')
// const upload = multer({
//     dest:'images',
//     limits:{
//         fileSize: 1000000  //file size smaller than MB will be accepted
//     },
//     fileFilter(req,file,callback){
//         if( !file.originalname.match(/\.(doc|docx)$/) ){
//             return callback(new Error('Please Upload a PDF file.'))
//         }
//         callback(undefined,true)
//     }
// })
// app.post('/upload',upload.single('upload'),(req,res)=>{
//     res.send()
// },(error,req,res,next)=>{
//     res.status(400).send({error:error.message})
// })



//-->How populate works
// const User = require('./models/user')
// const main = async ( )=>{
//     const user = await User.findById('6067180b2aa2b32b4456175d')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
// main()