from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

db_url = "mysql+pymysql://root:root@localhost:3306/db"
engine=create_engine(db_url)
SessionLocal=sessionmaker(autocommit= False, autoflush=False, bind=engine)
Base= declarative_base()
