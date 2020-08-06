const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');
const classStatus = require('./models/arduinoSensors');
const mongoose = require('mongoose');
var url = 'mongodb+srv://admin:admin@azielongas-rztzj.mongodb.net/PArduino?retryWrites=true&w=majority';
app.use(require('express').static(__dirname + '../node_modules/socket.io-client/dist'));

app.use(morgan('dev'));
app.use(require('express').urlencoded({ extended: true }))

app.set('port', process.env.PORT || 3000);

mongoose.connect(url)
  .then(db => console.log('Conectado'))
  .catch(db => console.log('No Conectado'));


app.get('/',  (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"))
  // console.log(`Temperature:  ${req.body.temp}`);
  //console.log(`Humidity: ${req.body.hum}`);
});

const server = app.listen(app.get('port'), () => {
  console.log('server', app.get('port'));
});

var io = require('socket.io')(server);

// app.post('/', async  (req, res) =>{

//  console.log(`Temperature:  ${req.body.temp}`);
//    console.log(`Humidity: ${req.body.hum}`);

// await arduinosens.updateOne({id:'1'}, {temp: req.body.temp, hum: req.body.hum}, function (err, docs) { 
//   if (err){ 
//      console.log(err); 
//  } 
//  else{ 
//     console.log(docs);            
// } 
//  }); 
//  });

io.on('connection', (socket) => {
  console.log("Socket connected");
  socket.on('roomData', (id) => {
    socket.emit('initialData', classroomData[id])
    socket.join(id)
  });
  socket.on('arduinoUpdate',async ({ arduinoUpdate }) => {
    var searchParams = new URLSearchParams(arduinoUpdate);
    for (let d of searchParams) {
      switch(d){
       case ('temp' <= 20):
       await arduinosens.updateOne({ id: '1' }, { ac: false }); 
        case ('temp' > 20):
       await arduinosens.updateOne({ id: '1' }, { ac: true }); 
        case ('dstnc'<= 5):
        await arduinosens.updateOne({ id: '1' }, { door: false});
        case ('dstnc'> 5):
        await arduinosens.updateOne({ id: '1' }, { door: true}, function (err, docs) { 
            if (err){ 
                console.log(err); 
            } 
            else{ 
               console.log(docs);            
            }
          });         
        case ('light'<= 400):
        await arduinosens.updateOne({ id: '1' }, { light: false});
        case ('light' > 400):
        await  arduinosens.updateOne({ id: '1' }, { light: true});        
      }
      console.log(d);
      //socket.to(id).emit("updateData", classroomData[id])
    }
  });
}); 