
document.addEventListener('DOMContentLoaded', function () {

    // define variables
    var channelList = document.querySelector('#channels');
    var msglist = document.querySelector('#messages');
    var userList = document.querySelector('#users');
    var sendbtn = document.querySelector('#send');
    var createChannelBtn = document.querySelector('#create-channel');
    
    var socket = io.connect('http://'+ document.domain + ':' + location.port);



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
        msglist.innerHTML = '';
        messages.forEach(msg => {
            appendMessage(msglist, msg)
        });
    }


    var appendChannel = (list, channel) => {
        const li = document.createElement('li');
        const id = `channel-${channel}`;
        li.innerHTML = `<a href='#' class="link-channel" id="${id}">${channel}</a>`;
        list.append(li);
    }


    var recreateChannelList = channels => {
        console.log('recreating channel list');
        channelList.innerHTML = '';
        channels.forEach(channel => {
            //console.log(`appending channel ${channel}`);
            appendChannel(channelList, channel);
            //console.log(`appended channel ${channel}! yay!`);
        });
        updateChannelLinkListeners();
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
        
        if (newChannel != currentChannel) {
            leaveChannel(currentChannel);
            joinChannel(newChannel);
            console.log(`new channel is ${newChannel}`);            
        };             
    };

    var joinChannel = (newChannel) => {
        socket.emit('join channel', {'channel': newChannel});
        console.log(`joining channel ${newChannel}`);
        currentChannel = newChannel;
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
        userList.innerHTML = '';
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
        
        if (!localStorage.getItem('current_channel')) {
            localStorage.setItem('current_channel', 'global');
        };
        currentChannel = localStorage.getItem('current_channel');
        // TODO: он не будет дублировать джоин с серверсайдом?..
        socket.emit('join channel', {'channel': currentChannel});

        socket.emit('user connected');   
        console.log(`you have been connected on channel ${currentChannel}!`); 
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        socket.emit('user disconnected');
        localStorage.setItem('current_channel', currentChannel);
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
    // правда, дублируются каналы и юзеры...почемуто
    // TODO: сделать рекреейт всех списков при аппенде чаннела
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




