const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io')

// Init Nexmo
const nexmo = new Nexmo({
    apiKey: '83b35130',
    apiSecret: 'IN20iwFw1rt6hvCp'
}, {debug: true});

// Init app
const app = express();

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body Parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const PORT = process.env.PORT || 5000;

// Index route
app.get('/', (req, res) => {
    res.render('index');
    //res.json('It is working');
})

// Catch form submit
app.post('/', (req, res) => {
    //res.json(req.body);
    //console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms(
        'Vonage APIs',
        number,
        text,
        { type: 'unicode'},
        (err, responseData) => {
            if (err) {
                console.log(err)
            } else {
                console.dir(responseData);
                // Get data from response

                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

                // Emit to the client
                io.emit('smsStatus', data);
            }
        }
    );
})


const server = app.listen(PORT, () => {
    console.log(`Server us running on port: ${PORT}`);
})

// Connect to socket.io
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('Socket Connected');

    io.on('disconnect', () => {
        console.log('Disconnected')
    })
})