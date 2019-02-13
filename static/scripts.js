
document.addEventListener('DOMContentLoaded', function () {

    // define variables
    var channelList = document.querySelector('#channels');
    var msglist = document.querySelector('#messages');
    var userList = document.querySelector('#users');
    var sendbtn = document.querySelector('#send');
    var createChannelBtn = document.querySelector('#create-channel');
    
    var socket = io.connect('http://'+ document.domain + ':' + location.port);


    // some logic
    // dont blame me!

    // TODO: все функции recreate-append похожи, надо из 6 штук сделать 2, но сложные (наверное)
    // хотя бы appendToList - они ваще одинаковые

    

    var appendMessage =  (list, msg) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="timestamp">${msg.timestamp}  </span><span style="color:${msg.color}; font-weight:bold">${msg.username}</span>: ${msg.message}`
        list.append(li);
    };

    //
    var recreateMsgList = messages => {
        msglist.innerHTML = '';
        messages.forEach(msg => {
            appendMessage(msglist, msg)
        });
        // TODO: список сообщений уползает вниз
        // может, препендить?
    }


    var appendChannel = (list, channel) => {
        const li = document.createElement('li');
        let isActiveLink = '';
        if (channel == currentChannel) {
            isActiveLink = 'link-active';
        };
        li.innerHTML = `<a href='#' class="link-channel ${isActiveLink}">${channel}</a>`;
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
        const channel = getChannelFromPrompt();
        socket.emit('new channel', {'channel': channel});
    }

    var getChannelFromPrompt = () => {
        const channel = prompt('enter new channel name:');
        return channel;
        // изящнее будет какой-то попап с Бутстрапа захуячить
        // проперти хидден может юзать? типа скрыл форму для имени канала прямо в списке каналов
        // а по клику на нью ченнел показываешь
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

    window.addEventListener('beforeunload', () => {
        socket.disconnect();
    });

    sendbtn.addEventListener('click', addNewMessage);

    window.addEventListener('keydown', e => {
        if (e.keyCode == 13) {
            // почему event? почему не e?
            addNewMessage();
        };
    });

    createChannelBtn.addEventListener('click', createChannel);



    // socket events

    socket.on('get channel name',  () => {

        if (!localStorage.getItem('current_channel')) {
            localStorage.setItem('current_channel', 'global');
        };
        currentChannel = localStorage.getItem('current_channel');
        console.log('read channel from local storage')
        socket.emit('receive channel name', {'channel': currentChannel});
    });

    socket.on('disconnect', () => {
        console.log('really disconnected');
        localStorage.setItem('current_channel', currentChannel);
        console.log('saved channel to local storage');
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

    socket.on('append channel', data => {
        appendChannel(channelList, data['channel']);
    });

    socket.on('channel already exists', () => {
        const message = {
            'username': 'Server',
            'message': `channel already exists!`
        }
        appendMessage(msglist, message);
    });

    // TODO: пофиксить таймстемпы
    socket.on('user joined channel', data =>{
        const message = {
            'username': 'Server',
            'message': `user ${data['username']} joined channel!`
        }
        appendMessage(msglist, message);
        currentChannel = data['channel'];
    });

    // FIXME
    socket.on('user left channel', data => {
        const message = {
            'username': 'Server',
            'message':`user ${data['username']} left channel`
        }
        appendMessage(msglist, message);
    });
    
    
    
});




