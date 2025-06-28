from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from datetime import datetime

from backend.auth import ALGORITHM, SECRET_KEY
from backend.database import SessionLocal
from backend.models import Programare
from models import p


def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))):
    try:
        payload = JWTError.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
        if user_email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    



#def worker():
 #   while True:
  #      now = datetime.now()
   #     hour, minute = now.hour, now.minute
#
 #       with SessionLocal as db:
  #          programari
