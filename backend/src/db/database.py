from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os
# from src import db_models

load_dotenv()
username = os.getenv("MYSQL_USERNAME")
password = os.getenv("MYSQL_PASSWORD")
db_name = os.getenv("DB_NAME")

password = quote_plus(password)
engine = create_engine(f'mysql+pymysql://{username}:{password}@localhost/{db_name}')  

# db_models.Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
