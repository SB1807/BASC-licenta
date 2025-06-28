from database import Base, engine
from models import User

print("Creating data base tables")
Base.metadata.create_all(bind=engine)

print("done")