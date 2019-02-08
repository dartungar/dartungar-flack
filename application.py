import os
import random

from utils import Channel, User

from flask import Flask, g, render_template, redirect, request, session, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room

colors = ['green', 'lime', 'yellow', 'blue', 'navy', 'teal', 'purple', 'orange', 'maroon', 'olive', 'red']
current_channel = ''

app = Flask(__name__)
#app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.secret_key = 'secret'
socketio = SocketIO(app)



@app.route("/", methods=['GET', 'POST'])
def index():
   print(g.user)
   if g.user:
      
      global current_channel

      if not current_channel:
         current_channel = Channel('chat')
      print(current_channel.name)
      return render_template('index.html')
   
   return render_template('login.html')

@app.route("/login", methods=['GET', 'POST'])
def login():
   if request.method == 'POST':
      session['username'] = request.form['username']
      session['color'] = random.choice(colors)
      print(session['username'])
      return redirect(url_for('index'))
   
   return render_template('login.html')

# check if user is 'logged in'
@app.before_request
def load_logged_in_user():
   g.user = session.get('username')


@socketio.on('connection')
def connection():
   print('user connected')


@socketio.on('new message')
def new_message(data):
    # TODO
    print(data['message'])
    msg = {
      'username': session['username'],
      'color': session['color'],
      'message': data['message']
      }
    current_channel.add_msg(msg)
    emit('update msglist', current_channel.messages, broadcast=True)


#TODO
@socketio.on('new channel')
def create_channel(name):
    channel = Channel(name)


#TODO
@socketio.on('join')
def join_channel(channel):
   global current_channel
   global user
   current_channel = channel
   emit('user joined channel', 
      {
      'username': user.name, 
      'channel': current_channel
      }, broadcast=True)

# TODO
@socketio.on('user disconnected')
def user_disconnected():
   session.pop('username')




if __name__ == "__main__":
   socketio.run(app)
   
    