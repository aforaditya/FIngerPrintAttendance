const express = require('express')
const {getCollection, addToArray} = require('./utils/db')


const app = express()
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')



// Home Page
app.get('/', async (req, res)=>{

    let classes = await getCollection('section')
    res.render('home', {classes})
})

// Mark Attendance
app.get('/markAttendance/:sectionName', (req, res)=>{
    let {sectionName} = req.params
    res.render('scan')
})

// Add Student Page
app.get('/addStudent/:sectionName', (req, res)=>{
    let {sectionName} = req.params
    res.render('addStudent', {sectionName, registered: false})
})


app.post('/student', async (req, res)=>{
    let {name, uid, mobileNumber, fingerprint, sectionName} = req.body
    await addToArray('section', sectionName, 'students', req.body)
    res.render('addStudent', {sectionName, registered: true})
})


app.listen(3000, ()=>console.log('SERVER STARTED'))