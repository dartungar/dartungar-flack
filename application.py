import os
import random

from flask import Flask, g, render_template, redirect, request, session, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room

#colors = ['green', 'lime', 'yellow', 'blue', 'navy', 'teal', 'purple', 'orange', 'maroon', 'olive', 'red']
channels = {}
users = []
#current_channel = ''

app = Flask(__name__)
app.debug = True
#app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.secret_key = 'secret'
socketio = SocketIO(app)


@app.route("/", methods=['GET', 'POST'])
def index():
   print(g.user)
   
   if g.user:
      # TODO: читаем имя последнего канала с локал стореджа
      # доработай логику ниже, если надо

      if not channels.get('global'):
         create_channel('global')
         print('created global channel anew...')

      if not session.get('current_channel'):
         session['current_channel'] = 'global'
         # TODO: разобраться, как изначально задать дефолтную комнату

      socketio.emit('join channel', {'channel':session['current_channel']})
      print(session['current_channel'])
      
      return render_template('index.html')
   
   return render_template('login.html')


@app.route("/login", methods=['GET', 'POST'])
def login():
   if request.method == 'POST':

      username = request.form['username']
      session['username'] = username
      #session['color'] = random.choice(colors)
      # thanks Eneko Alonso on StackOverflow for random color trick
      session['color'] = "#%06x" % random.randint(0, 0xFFFFFF)
      users.append(username)
      #print(session['username'])
      return redirect(url_for('index'))
   
   return render_template('login.html')


# check if user is 'logged in'
# also init message list and channels list
@app.before_request
def before_req():
   g.user = session.get('username')
   
   


def recreate_lists():
   
   channel_list = list(channels.keys())
   messages = channels[session['current_channel']]['messages']
   socketio.emit(
      'recreate lists', 
      {
      'channels': channel_list, 
      'messages': messages,
      'users': users
      })

   print(f'initting lists: channels - {channels.keys()} & messages {len(messages)}')


@socketio.on('user connected')
def connection():
   recreate_lists()


@socketio.on('new message')
def new_message(data):
    print(data['message'])
    
    msg = {
      'username': session['username'],
      'color': session['color'],
      'message': data['message']
      }
    
    add_msg(session['current_channel'], msg)
    
    emit('update msglist', 
         channels[session['current_channel']]['messages'], 
         room=session['current_channel']
         )


#TODO
@socketio.on('new channel')
def create_channel_on_event(data):
   name = data['channel']
   new_channel = create_channel(name)
   if new_channel:
      #emit('append channel', {'channel': new_channel})
      recreate_lists()



#TODO
@socketio.on('join channel')
def join_channel(data):
   username = session['username']
   channel = data['channel']
   session['current_channel'] = channel
   #channels[channel]['users'].append(session['username'])
   join_room(channel)
   emit('user joined channel', 
      {
      'username': username, 
      'channel': channel
      }, 
      room=channel)
   
   print(f'user {username} joined channel {channel}!')


@socketio.on('leave channel')
def leave_channel(data):
   channel = data['channel']
   leave_room(channel)
   #channels[session['current_channel']]['users'].pop(session['username'])
   emit('user left channel', {'username': session['username']}, room=channel)


# TODO: сохранить данные о канале на local storage
#@socketio.on('user disconnected')
#def user_disconnected():
#   users.pop(session['username'])


def add_msg(channel, message):
   
   msg_capacity = 100

   channels[channel]['messages'].append(message)

   if len(channels[channel]['messages']) > msg_capacity:
      channel['messages'] = channel['messages'][-msg_capacity:] 


def create_channel(name):
   if name not in list(channels.keys()):
      channels[name] = {'messages': [], 'users': []}
      return name
   else:
      print('channel already exists')
      # TODO: алерт типа ченнел экзистс в самом интерфейсе
      return None




if __name__ == "__main__":
   socketio.run(app)
   
    