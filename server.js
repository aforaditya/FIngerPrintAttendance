const express = require('express')
const {getCollection, addToArray, set, deleteDoc, get}  = require('./utils/db')
const { getCurrentDate, getCurrentTime } = require('./utils/dateTime')
const session = require('express-session')



const app = express()
app.use(express.urlencoded({extended: true, limit: '50mb' }))
app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(session({
    secret: 'secretaaaaa787da7da89',
    resave: false,
    saveUninitialized: false
  }));


function checkAuthentication(req, res, next){

    console.log(req.path.split('/')[1]);

    let paths = ['/', '/createNewSection', '/viewAttendance', '/markAttendance', '/addStudent', '/deleteSection']
    if( (paths.includes(req.path) || paths.includes('/'+req.path.split('/')[1])) && !(req.session.user))
    res.redirect('/login')
    else
    next()
}

app.use(checkAuthentication)



// Home Page
app.get('/', async (req, res)=>{

    let classes = await getCollection('section')
    res.render('home', {classes, attendanceMarked: 'attendanceMarked' in req.query})
})

// Mark Attendance
app.get('/markAttendance/:sectionId', async (req, res)=>{
    let {sectionId} = req.params
    let {sectionName, subjectName, students} = await get('section', sectionId)
    res.render('scan', {sectionName, subjectName, students, sectionId})
})

// View Attendance
app.get('/viewAttendance/:sectionId', async (req, res)=>{
    let {sectionId} = req.params
    let {sectionName, subjectName, students} = await get('section', sectionId)
    let attendanceList = (await get('section', sectionId)).attendance
    res.render('viewAttendance', {sectionName, subjectName, students, attendanceList, sectionId})
})

app.get('/viewAttendance/:sectionId/:sessionIndex', async (req, res)=>{
    let {sectionId, sessionIndex} = req.params
    let {sectionName, subjectName, students} = await get('section', sectionId)
    let {attendanceList, date, time} = (await get('section', sectionId)).attendance[parseInt(sessionIndex)]
    const present = attendanceList.filter(student=> student.status == 'PRESENT')
    const presentCount = present.length
    const absentCount = students.length - presentCount
    res.render('viewSessionAttendance', {sectionName, subjectName, students, attendanceList, date, time, presentCount, absentCount})
})

// Submit attendance
app.post('/submitAttendance', async (req, res)=>{
    const {sectionId, presentUids} = req.body
    let allStudents = (await get('section', sectionId)).students
    let attendance = allStudents.map(student=>{
        return{
        ...student,
        'status': presentUids.includes(student.uid) ? 'PRESENT' : 'ABSENT'
        }
            })

    await addToArray('section',  sectionId, 'attendance', {
        date: getCurrentDate(),
        time: getCurrentTime(),
        attendanceList: attendance
    })

    res.json({success: true})
})



// Add Student Page
app.get('/addStudent/:sectionName', (req, res)=>{
    let {sectionName} = req.params
    res.render('addStudent', {sectionName, registered: false})
})

// Create New Section
app.get('/createNewSection', (req, res)=>{
    res.render('createNewSection')
})

app.post('/createNewSection', async (req, res)=>{
    let {sectionName} = req.body
    await set('section', undefined, {students: [], ...req.body, attendance: []})
    res.redirect('/')
})

app.get('/deleteSection/:sectionName', async (req, res)=>{
    await deleteDoc('section', req.params.sectionName)
    res.redirect('/')
})


app.post('/student', async (req, res)=>{
    let {name, uid, mobileNumber, fingerprint1, fingerprint2, fingerprint3, fingerprint4, fingerprint5, sectionName} = req.body

    // Add fingerprints to Python Matcher

    fetch('http://127.0.0.1:5000/saveStudent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        uid: uid,
        name: name,
        sectionName: sectionName,
        fingerprint1: fingerprint1,
        fingerprint2: fingerprint2,
        fingerprint3: fingerprint3,
        fingerprint4: fingerprint4,
        fingerprint5: fingerprint5
    }),
})


    await addToArray('section', sectionName, 'students', { 
        name,
        uid,
        mobileNumber
    })
    res.render('addStudent', {sectionName, registered: true})
})

app.get('/allStudents/:sectionId', async (req, res)=>{
    let {sectionId} = req.params
    let allStudents = (await get('section', sectionId )).students
    res.json(allStudents)
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login', (req, res)=>{
    if(req.body.username == 'E123' && req.body.password == '123'){
    req.session.user = {...req.body}
    res.redirect('/')
    }
    else
    res.redirect('/login?failed')
})


app.get('/logout', (req, res)=>{
    req.session.user = undefined
    res.redirect('/login')
})


app.listen(process.env.PORT || 3000, ()=>console.log('SERVER STARTED'))