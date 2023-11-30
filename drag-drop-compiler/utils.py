import config

curr_id = 0


async def create_session(session_manager):
    sessionID = session_manager.create_session()
    if session_manager.get_session(sessionID):
        return sessionID
    else:
        return None


def indent(code: str):
    keyword = code.strip().split(' ')[0]
    if keyword in config.INDENT_KEYWORDS:
        return True
    return False


def remove_indent(code: str):
    keyword = code.strip().split(' ')[0]
    if keyword in config.REMOVE_INDENT_KEYWORDS:
        return True
    return False


def generate_id():
    global curr_id
    curr_id += 1
    return curr_id


def hash_password(password):
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


def validate_user(hashed_password, password):
    import bcrypt
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
