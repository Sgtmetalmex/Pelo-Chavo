const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');
const arduinosens = require('./models/arduinoSensors');
const mongoose = require('mongoose');
const { classroomId } = require('./models/classroomData');
var url = 'mongodb+srv://admin:admin@azielongas-rztzj.mongodb.net/PArduino?retryWrites=true&w=majority';
app.use(require('express').static(__dirname + '../node_modules/socket.io-client/dist'));

app.use(morgan('dev'));
app.use(require('express').urlencoded({ extended: true }))
app.set('port', process.env.PORT || 3000);

mongoose.connect(url)
.then(db => console.log('Conectado'))
.catch(db => console.log('No Conectado'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"))
});

const server = app.listen(app.get('port'), () => {
  console.log('server', app.get('port'));
});

var io = require('socket.io')(server);

var classroomData = {}

io.on('connection', (socket) => {
  console.log("Socket connected");
  
  socket.on('roomData', (id) => {
    socket.emit('initialData', classroomData[id])
    socket.join(id)
  });
  
  socket.on('arduinoUpdate', async ({ arduinoUpdate }) => {
    let searchParams = new URLSearchParams(arduinoUpdate);
    let classroomId = searchParams.get("id")
    
    if (!(classroomId in classroomData)) {
      classroomData[classroomId] = []
    }
    
    let currentIndex = -1
    for (const [key, value] of searchParams) {
      if (currentIndex !== -1) {
        classroomData[classroomId][currentIndex] = {}
        let boolValue = null
        switch (key) {
          case "AC":
          boolValue = parseFloat(value) <= 20
          classroomData[classroomId][currentIndex].true = {
            description: "AC on",
            iconId: "cmd_air_conditioner"
          }
          classroomData[classroomId][currentIndex].false = {
            iconId: "cmd_air_conditioner",
            description: "AC off"
          }
          case "Windows":
          boolValue = parseFloat(value) <= 5
          classroomData[classroomId][currentIndex].true = {
            iconId: "cmd_window_closed_variant",
            description: "All windows closed"
          }
          classroomData[classroomId][currentIndex].false = {
            iconId: "cmd_window_open_variant",
            description: "One or more windows open"
          }
          case "Lights":
          boolValue = parseFloat(value) <= 400
          classroomData[classroomId][currentIndex].true = {
            iconId: "cmd_lightbulb_outline",
            description: "All lights off"
          }
          classroomData[classroomId][currentIndex].false = {
            iconId: "cmd_lightbulb_on",
            description: "One or more lights off"
          }
          case "Projector":
          boolValue = parseFloat(value) === 1
          classroomData[classroomId][currentIndex].true = {
            iconId: "cmd_projector",
            description: "Projector off"
          }
          classroomData[classroomId][currentIndex].false = {
            iconId: "cmd_projector",
            description: "Projector on"
          }
        }
        classroomData[classroomId][currentIndex].name = key
        classroomData[classroomId][currentIndex].status = boolValue
        await arduinosens.updateOne({id: classroomId},{$set:{[key]:boolValue}})
      }
      ++currentIndex
    }
    console.log(classroomData)
    socket.to(classroomId).emit("updateData", classroomData[classroomId]);
  });
});