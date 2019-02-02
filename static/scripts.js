
document.addEventListener('DOMContentLoaded', function () {

    // define variables

    var msglist = document.querySelector('#messages');
    var sendbtn = document.querySelector('#send');
    var socket = io.connect('http://'+ document.domain + ':' + location.port);

    // some logic
    // dont blame me!

    var appendMessage = function (list, message) {
        const li = document.createElement('li');
        li.innerHTML = message;
        list.append(li);
    };


    // emit message to server
    var addNewMessage = function(event) {
        // prevent page reloading
        if (event) {
            event.preventDefault();
        }
        
        // get message from input field
        const message = document.querySelector('#m').value;
        if (message != '') {
            // emit message
            socket.emit('new message', {'username': 'user', 'message': message});         
            
            // clean input form
            document.querySelector('#m').value = '';
        };
        // do not submit the form
        return false;
    }; 



    // interface events
    sendbtn.addEventListener('click', addNewMessage);

    window.addEventListener('keydown', e => {
        if (e.keyCode == 13) {
            addNewMessage(event);
        };
    });



    // socket events

    socket.on('connect',  () => {
        console.log('you have been connected!');      
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected')
    });

    socket.on('reconnect',  () => {
        console.log('successfully reconnected!');      
    });

    socket.on('chat message', data => {
        // append message to messages list
        appendMessage(msglist, data.message);            
        // debug: log message
        console.log(data.message);
    });
    
});




