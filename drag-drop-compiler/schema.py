from pydantic import BaseModel
from fastapi import UploadFile
from typing import Any


class AddBlockSchema(BaseModel):
    session_id: str
    identifier: int
    code: str
    var: str
    val: str
    valto: str
    tag: str
    seq_item: str


class UpdateBlockSchema(BaseModel):
    session_id: str
    identifier: int
    code: str
    var: str
    val: str
    valto: str
    tag: str
    index: int


class CompileArgs(BaseModel):
    session_id: str


class SaveArgs(BaseModel):
    user_id: str
    session_id: str
    file_name: str


class RemoveBlockArgs(BaseModel):
    session_id: str
    index: list


class LoadArgs(BaseModel):
    user_id: str
    session_id: str
    file_name: str


class RegisterArgs(BaseModel):
    username: str
    password: str


class LoginArgs(BaseModel):
    username: str
    password: str


class UserPassword(LoginArgs):
    password: str


class GetProjects(BaseModel):
    user_id: str
