import random

# TODO: как мы будем учитывать заново залогиненных пользователей?
# может всё-таки вынести пользователя в глобальный список?
class User:
    users = []
    colors = ['green', 'lime', 'yellow', 'blue', 'navy', 'teal', 'purple', 'orange', 'maroon', 'olive', 'red']

    def __init__(self, name):
        self.name = name
        self.color = random.choice(User.colors)
        User.users.append(name)


# TODO: channel id или проверка на уникальные названия
class Channel:
    channels = [] # а это правильно? не лучше отдельно список вывести? прозрачнее будет
    msg_capacity = 100
    
    def __init__(self, name):
        
        self.name = name
        self.messages = []
        Channel.channels.append(name)


    def add_msg(self, msg, user='Anonymous'):
        
        if len(self.messages) > Channel.msg_capacity:
            self.messages = self.messages[-Channel.msg_capacity:]
        
        self.messages.append({"message": msg, "user": user})
