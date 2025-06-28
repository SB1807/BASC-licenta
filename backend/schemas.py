from datetime import datetime
from pydantic import BaseModel

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Coordinates(BaseModel):
    x:float
    y:float
    z:float
    grip: float

class Angles(BaseModel):
    base:float
    shoulder:float
    elbow:float
    gripper:float

class AutoCommand(BaseModel):
    x: float
    y: float
    z: float
    grip: float
    hour: int
    minute: int

class IngredientOut(BaseModel):
    id: int
    name: str
    x:float
    y:float
    z:float
    nav:bool
    in_stock:int

class ProgramareCreate(BaseModel):
    hour:int
    minute: int
    ingredient_out: int
    executed: bool

class ServoScheduleCreate(BaseModel):
    x: float
    y: float
    z: float
    scheduled_time: datetime

class ScheduleByIngredientCreate(BaseModel):
    ingredient_id: int
    scheduled_time: datetime