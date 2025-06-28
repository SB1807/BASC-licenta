from sqlalchemy import Column, DateTime, ForeignKey, Integer, String,Float,Boolean
from database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))


class Ingredient(Base):
    __tablename__ = "ingredient"
    id=Column(Integer, primary_key=True, index=True )
    name = Column(String(30), index=True)
    x= Column(Float)
    y= Column(Float)
    z= Column(Float)
    nav= Column(Boolean)
    in_stock=Column(Integer)

class Programare(Base):
    __tablename__ = "programari"
    id=Column(Integer, primary_key=True, index=True)
    hour=Column(Integer)
    minute= Column(Integer)
    ingredient_id=Column(Integer, ForeignKey("ingredient.id"))
    
    executed = Column(Boolean, default=False)

    ingredient = relationship("Ingredient")

class ServoSchedule(Base):
    __tablename__ = "servo_schedule"

    id = Column(Integer, primary_key=True, index=True)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    z = Column(Float, nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    executed = Column(Boolean, default=False)
