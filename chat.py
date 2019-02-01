
class Channel:
    channels = []
    msg_capacity = 100
    
    def __init__(self, name):
        
        self.name = name
        self.messages = []
        Channel.channels.append(name)

    def add_msg(self, msg, user):
        
        if len(self.messages) > Channel.msg_capacity:
            self.messages = self.messages[-Channel.msg_capacity:]
        
        self.messages.append(msg, user)
