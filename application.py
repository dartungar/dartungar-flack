import os

from chat import Channel

from flask import Flask, g, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


def get_channels():
   if 'channels' not in g:
      g.channels = []
   
   return g.channels

def get_current_channel():
   if 'current_channel' not in g:
      g.current_channel = ''
   
   return g.current_channel


@app.route("/")
def index():
    # TODO
    # если юзер новый, то промптим на имя
   # return render_template("index.html", channels = g.channels, current_channel = g.current_channel)
   get_channels()
   get_current_channel()
   return render_template('index.html')

#@socketio.on('new message')
#def new_message(data):
    # TODO
    # определяем канал
    #emit('broadcast new message', message, broadcast=True)

#TODO
#@socketio.on('create channel')
#def create_channel(name):
#    channel = Channel(name)
#    channels.append(channel)


#TODO
#@socketio.on('switch channel')
#def switch_channel(channel):
#    current_channel = channel




if __name__ == "__main__":
    socketio.run(app)
    