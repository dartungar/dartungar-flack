
document.addEventListener('DOMContentLoaded', function () {

    // define variables
    var channelList = document.querySelector('#channels');
    var msglist = document.querySelector('#messages');
    var userList = document.querySelector('#users');
    var sendbtn = document.querySelector('#send');
    var createChannelBtn = document.querySelector('#create-channel');
    
    var socket = io.connect('http://'+ document.domain + ':' + location.port);

    var currentChannel = '';

    // проверим чо там с листенерами
    var numListeners = 0;

    // some logic
    // dont blame me!

    // TODO: все функции recreate-append похожи, надо из 6 штук сделать 2, но сложные (наверное)
    // хотя бы appendToList - они ваще одинаковые

    

    var appendMessage =  (list, msg) => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="color:${msg.color}; font-weight:bold">${msg.username}</span>: ${msg.message}`
        list.append(li);
    };

    //
    var recreateMsgList = messages => {
        messages.forEach(msg => {
            appendMessage(msglist, msg)
        });
    }


    var appendChannel = (list, channel) => {
        const li = document.createElement('li');
        const id = `channel-${channel}`;
        li.innerHTML = `<a href='#' class="link-channel" id="${id}">${channel}</a>`;
        list.append(li);
        //updateChannelLinkListener(); // ВОТ В ЭТОЙ ХУЙНЕ ДЕЛО! АААА TODO FIXME FUCKYOU
        // надо бы отсюда вынести эту хуйню
        //updateChannelLinkListener(id);
    }

    // тут какие-то проблемы, кажется
    // добавил логи для проверки
    var recreateChannelList = channels => {
        console.log('recreating channel list');
        channels.forEach(channel => {
            //console.log(`appending channel ${channel}`);
            appendChannel(channelList, channel);
            //console.log(`appended channel ${channel}! yay!`);
        });
        updateChannelLinkListeners();
    }

    // FIXME
    // бля, пробелы нельзя в id!!
    // => new channel не канает
    // ищи другой путь, без id
    var updateChannelLinkListener = function (id) {
        id = `#${id}`;
        const channelLink = document.querySelector(id);
        //console.log(`updating channel link listener ${id}`);
        // какие-то проблемы, пока вырубем
        const newChannel = channelLink.innerHTML;
        channelLink.addEventListener('click', switchChannel(currentChannel, newChannel));
        //console.log(`added event listener to ${newChannel} link`);
    }

    
    var updateChannelLinkListeners = function() {
        var channelLinks = document.querySelectorAll('.link-channel');
        channelLinks.forEach(link => {
            const newChannel = link.innerHTML;
            link.addEventListener('click', () => {
                switchChannel(currentChannel, newChannel);
            });
        });
    };
    

    var switchChannel = (currentChannel, newChannel) => {
        console.log(`new channel is ${newChannel}`);
        if (newChannel != currentChannel) {
            leaveChannel(currentChannel);
            joinChannel(newChannel);            
        };             
    };

    var joinChannel = (newChannel) => {
        socket.emit('join channel', {'channel': newChannel});
        console.log(`joining channel ${newChannel}`);
    }

    var leaveChannel = (currentChannel) => {
        socket.emit('leave channel', {'channel': currentChannel});
        console.log(`leaving channel ${currentChannel}`);
    }

    var createChannel = () => {
        const channel = 'new channel'; // TODO: промпт на название канала
        socket.emit('new channel', {'channel': channel});
        // TODO: поделить функцию на две, сначала сервер сайд проверка 
        // только потом аппенд
        //appendChannel(channelList, channel);
        
    }


    var recreateUserList = users => {
        users.forEach(user => {
            appendUser(userList, user);
        });
    }

    var appendUser = (list, user) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href='#' class="link-user">${user}</a>`;
        list.append(li);
    }

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
            socket.emit('new message', {'message': message});       
            
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

    createChannelBtn.addEventListener('click', createChannel);



    // socket events

    socket.on('connect',  () => {
        console.log('you have been connected!');
        socket.emit('user connected');
        // ставим дефолтный канал
        // надо сделать так чтобы какое-то взаимодействие с сервера было
        // коряво. TODO
        if (currentChannel == '') {
            currentChannel = 'global';
        };     
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        socket.emit('user disconnected');
    });

    socket.on('reconnect',  () => {
        console.log('successfully reconnected!');      
    });

    socket.on('recreate lists', data => {
        recreateChannelList(data['channels']);
        recreateMsgList(data['messages']);
        recreateUserList(data['users']);
    });

    socket.on('update msglist', messages => {
        // build message list anew
        msglist.innerHTML = '';
        recreateMsgList(messages);          
        // debug: log message
        //console.log(data.message);
    });

    // КАРОЧ
    // решил вообще без append channel обойтись
    // тупо список каналов перезагружать буду
    socket.on('append channel', data => {
        appendChannel(channelList, data['channel']);
    });

    socket.on('user joined channel', data =>{
        const message = {
            'username': 'Server',
            'message': `user ${data['username']} joined channel!`
        }
        appendMessage(msglist, message);
        currentChannel = data['channel'];
    });

    socket.on('user left channel', data => {
        const message = {
            'username': 'Server',
            'message':`user ${data['username']} left channel`
        }
        appendMessage(msglist, message);
    });
    
    
    
});




