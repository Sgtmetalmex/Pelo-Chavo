const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');
const arduinosens = require('./models/arduinoSensors');
const mongoose = require('mongoose');
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

io.on('connection', (socket) => {
  console.log("Socket connected");
  socket.on('roomData', (id) => {
    var classroomData = arduinosens.find();
    socket.emit('initialData', classroomData[id])
    socket.join(id)
  });
  socket.on('arduinoUpdate', async ({ arduinoUpdate }) => {
    const datos = await arduinosens.findOne({ id: '1' });
    var searchParams = new URLSearchParams(arduinoUpdate);
    for (let [key, value] of searchParams) {
      console.log(key, value);
      switch (key) {
        case "temp":
          if (parseFloat(value) <= 20)//If temp is less than 20 we send a false cuz the temperature is not the normal temperature in Chihuahua(too cold)(red COlor)   
          { await arduinosens.updateOne({id: '1'}, { $set: {ac: false}});}
          else 
          { await arduinosens.updateOne({id: '1'}, { $set: {ac: true}});}
        case "dstnc":
          if (parseFloat(value) <= 5)//If dstnc is less than 5 we send a true cuz the windows are closed(Green color) 
          { await arduinosens.updateOne({id: '1'}, { $set: {window: true}});}
          else 
          { await arduinosens.updateOne({id: '1'}, { $set: {window: false}});}
        case "light":
          if (parseFloat(value) <= 400)//if light is less than 400 it is enviromental light and its ok so we send a true(Green Color) 
          {await arduinosens.updateOne({id: '1'}, { $set: {light: true }});}
          else
          { await arduinosens.updateOne({id: '1'}, { $set: {light: false }});}
        case "Wifi":
          if (parseInt(value) === 1)//If Wifi is on the, proyector is On too so we send a false(Red Color)
          {await arduinosens.updateOne({id: '1'},{$set: {wifi: false}});}
          else
          {await arduinosens.updateOne({id: '1'},{$set: {wifi: true}});} 
      }
        //socket.to(id).emit("updateData", classroomData[id]);
    }
  });
});

