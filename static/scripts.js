// connect to socket

var socket = io.connect('http://'+ document.domain + ':' + location.port)

function addMessage(list, message) {
    const li = document.createElement('li');
    li.innerHTML = message;
    list.append(li);
};

// test
socket.on('connect',  () => {
    console.log('a user connected')
});

socket.on('disconnect', () => {
    console.log('a user disconnected')
});


document.addEventListener('DOMContentLoaded', function () {

    // on submit broadcast message to all
    document.querySelector('#send').addEventListener('click', function(event) {
        // try to prevent page reloading
        event.preventDefault();
        // get message from input field
        const message = document.querySelector('#m').value;

        if (message != '') {
            // emit message
            socket.emit('new message', {'message': message}); 
            
            let msglist = document.querySelector('#messages');
        
            addMessage(msglist, message );   
            // debug: log message
            console.log(message);
            // clean input form
            document.querySelector('#m').value = '';
        };
        
        // do not submit the form
        return false;
    }); 

    socket.on('new message', msg => {
        const msglist = document.querySelector('#messages');
    
        addMessage(msglist, msg);
    });
    
});




