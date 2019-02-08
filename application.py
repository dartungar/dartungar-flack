import os
import random

from utils import Channel, User

from flask import Flask, g, render_template, redirect, request, session, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room

colors = ['green', 'lime', 'yellow', 'blue', 'navy', 'teal', 'purple', 'orange', 'maroon', 'olive', 'red']
channels = {}
users = []
#current_channel = ''

app = Flask(__name__)
#app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.secret_key = 'secret'
socketio = SocketIO(app)


@app.route("/", methods=['GET', 'POST'])
def index():
   print(g.user)
   if g.user:
            
      print(session['current_channel'])
      init_lists()
      return render_template('index.html')
   
   return render_template('login.html')

@app.route("/login", methods=['GET', 'POST'])
def login():
   if request.method == 'POST':

      session['username'] = request.form['username']
      session['color'] = random.choice(colors)
      users.append(session['username'])
      #print(session['username'])
      return redirect(url_for('index'))
   
   return render_template('login.html')

# check if user is 'logged in'
# also init message list and channels list
@app.before_request
def before_req():
   g.user = session.get('username')
   
   if not session.get('current_channel'):
         session['current_channel'] = 'global'
         #channels[session['current_channel']] = {'messages': [], 'users': []}
         create_channel(session['current_channel'])


# FIXME
def init_lists():
   
   channel_list = list(channels.keys())
   messages = channels[session['current_channel']]['messages']
   socketio.emit(
      'init lists', 
      {
      'channels': channel_list, 
      'messages': messages
      })

   print(f'initting lists: channels - {channels.keys()} & messages {len(messages)}')


@socketio.on('connection')
def connection():
   print('user connected')


@socketio.on('new message')
def new_message(data):
    print(data['message'])
    
    msg = {
      'username': session['username'],
      'color': session['color'],
      'message': data['message']
      }
    
    add_msg(session['current_channel'], msg)
    
    emit('update msglist', channels[session['current_channel']]['messages'], broadcast=True)


#TODO
@socketio.on('new channel')
def create_channel(name):
   if name not in channels:
      channels[name] = {'messages': [], 'users': []}
   else:
      pass #TODO что делаем, если канал уже есть?


#TODO
@socketio.on('join')
def join_channel(channel):
   
   session['current_channel'] = channel
   emit('user joined channel', 
      {
      'username': session['username'], 
      'channel': session['current_channel']
      }, broadcast=True)

@socketio.on('leave')
def leave_channel(channel):
   channels[channel][session['current_channel']]['users'].pop(session['username'])


# TODO
#@socketio.on('user disconnected')
#def user_disconnected():
#   users.pop(session['username'])


def add_msg(channel, message):
   msg_capacity = 100
   channels[channel]['messages'].append(message)
   if len(channels[channel]['messages']) > msg_capacity:
      channel['messages'] = channel['messages'][-msg_capacity:] 


if __name__ == "__main__":
   socketio.run(app)
   
    