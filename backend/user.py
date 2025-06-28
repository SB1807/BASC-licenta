from pydantic import BaseModel, EmailStr
from datetime import datetime

# Folosit la crearea unui user (POST)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# Folosit la răspunsul din API (GET)
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True