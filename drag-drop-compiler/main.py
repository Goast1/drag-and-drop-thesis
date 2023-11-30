from fastapi import FastAPI, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import io
import sys
import io
import Session
from user import User
from CodeBlock import *
from schema import AddBlockSchema, CompileArgs, RemoveBlockArgs, UpdateBlockSchema, LoadArgs, LoginArgs, RegisterArgs, \
    SaveArgs, GetProjects
from database import Database
from utils import hash_password, validate_user

app = FastAPI()
origins = ['https://gentle-bush-0205a5703.4.azurestaticapps.net', 'http://localhost:5500', 'http://127.0.0.1:5500']
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods='*', allow_headers='*')
db = Database("Python_learning_app.db")
session_manager = Session.SessionManager(db)
session_manager.cleanup(30)

db.create_table("users", table_data={
    "user_id": "TEXT PRIMARY KEY",
    "username": "TEXT",
    "password": "TEXT"
})

db.create_table('sessions', {
    'session_id': 'TEXT PRIMARY KEY',
    'code': 'TEXT',
    'indents': 'INTEGER',
    'sequence': 'TEXT',
    'latest_activity': 'TEXT'
})

db.create_table("projects", table_data={
    "user_id": "TEXT",
    "session_id": "TEXT",
    "file_name" : "TEXT",
    "file_content": "TEXT"
}, foreign_keys={"user_id": "users(user_id)", "session_id": "sessions(session_id)"})




@app.get('/')
async def start():
    return "Drag Drop Compiler BE"


@app.get('/init_session')
async def init_session():
    session = await create_session(session_manager)
    return session


@app.post("/add-block")
async def add_block(args: AddBlockSchema):
    args = args.model_dump()
    session = args.pop('session_id')
    seq_item = args.pop('seq_item')
    curr_code = "\t" * session_manager.get_session(session).get('indents') + CodeBlock(**args).extract()
    if indent(seq_item):
        session_manager.add_indent(session)
    if remove_indent(curr_code):
        session_manager.remove_indent(session)
        curr_code = ''
    session_manager.append_code(session, curr_code, seq_item)
    return curr_code


@app.post("/compile")
async def compile_code(args: CompileArgs):
    session_id = args.model_dump().get('session_id')
    session = session_manager.get_session(session_id)
    lines = session.get('code')
    print(lines)
    code = ""
    for line in lines:
        code += line + "\n"
    origin_std = sys.stdout
    sys.stdout = io.StringIO()
    try:
        print(exec(code))
    except Exception as e:
        print(e)
    output = sys.stdout.getvalue()
    sys.stdout = origin_std
    return output.replace('None', '')


@app.post("/remove_block")
async def remove_block(args: RemoveBlockArgs):
    args = args.model_dump()
    session_id = args.get('session_id')
    index = args.get('index')
    session_manager.remove_code(session_id, index)
    return "SUCCESS"


@app.post('/update_block')
async def update_block(args: UpdateBlockSchema):
    args = args.model_dump()
    session = args.pop('session_id')
    index = args.pop('index')
    actual_code = session_manager.get_session(session).get('code')
    curr_code = "\t" * actual_code[index].count('\t') + CodeBlock(**args).extract()
    session_manager.update_code(session, curr_code, index)
    return curr_code


@app.post('/save')
async def save(args: SaveArgs):
    buffer = io.BytesIO()
    data = args.model_dump()
    session_id = data.get('session_id')
    file_name = "code.py"
    session = session_manager.get_session(session_id)
    lines = session.get('code')
    for line in lines:
        buffer.write(line.encode('utf-8') + "\n".encode('utf-8'))
    buffer.write("SEQ\n".encode('utf-8'))
    for x in session_manager.get_session(session_id).get('sequence', []):
        buffer.write(f'{x}\n'.encode('utf-8'))
    buffer.seek(0)
    data["file_content"] = buffer.getvalue().decode('utf-8')
    db.insert("projects", data=data)
    buffer.seek(0)
    response = Response(content=buffer.getvalue())
    response.headers['Content-Disposition'] = 'attachment; filename="code.lcws"'
    response.media_type = "text/plain"
    return response


@app.post('/load')
async def load(args: LoadArgs):
    args = args.model_dump()
    session_id = args.get('session_id')
    print(session_id)
    user_id = args.get('user_id')
    file_name = args.get('file_name')
    file = db.select("projects", "file_content", conditions={
        "user_id": user_id, "file_name": file_name
    })
    code_list = file[0].split('SEQ')[0].strip().split('\n')
    seq_list = file[0].split('SEQ')[1].strip().split('\n')
    for code in code_list:
        seq = seq_list[code_list.index(code)]
        session_manager.append_code(session_id, code, seq)
    return {'code': code_list, 'elements': seq_list}


@app.get("/projects/{user_id}")
async def get_projects(user_id: str):
    return [x[0] for x in db.select("projects", "file_name", conditions={"user_id": user_id}, fetchall=True)]


@app.post('/login')
async def login(args: LoginArgs):
    data = args.model_dump()
    user = db.select("users", "username, password, user_id", conditions={
        "username": data.get("username")
    })
    if validate_user(user[1], data.get("password")):
        return {'user_id': user[2]}
    else:
        raise HTTPException(status_code=401, detail='Invalid credentials')


@app.post('/register')
async def register(args: RegisterArgs):
    data = args.model_dump()
    username = data.get("username")
    if db.select("users", "username", conditions={
        "username": username
    }) is not None:
        raise HTTPException(status_code=409, detail="User already registered")
    user = User(**data)
    data["user_id"] = user.user_id
    data["password"] = hash_password(data["password"])
    db.insert("users", data)
    return {"user_id": user.user_id}
