from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Dim_Users(Base):
    __tablename__ = 'Dim_Users'

    User_ID = Column(Integer, primary_key=True, autoincrement=True)
    Name = Column(String(250), nullable=False)
    Email = Column(String(250), nullable=False)
    Password = Column(String(250), nullable=False)
    Role_Type = Column(String(250), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    events_created = relationship("Dim_Events", back_populates="host")
    anchor_profile = relationship("Dim_Anchor_Profiles", back_populates="user", uselist=False)


class Dim_Anchor_Profiles(Base):
    __tablename__ = 'Dim_Anchor_Profiles'

    Profile_ID = Column(Integer, primary_key=True, autoincrement=True)
    User_ID = Column(Integer, ForeignKey('Dim_Users.User_ID'), nullable=False)
    Specialization = Column(String(250))
    Past_Work_Links = Column(String(500))
    Base_Fee = Column(Integer)
    Languages_Spoken = Column(String(250))
    Average_Rating = Column(Float)

    user = relationship("Dim_Users", back_populates="anchor_profile")
    applications = relationship("Fact_Assignments", back_populates="anchor")


class Dim_Events(Base):
    __tablename__ = 'Dim_Events'

    Event_ID = Column(Integer, primary_key=True, autoincrement=True)
    Host_ID = Column(Integer, ForeignKey('Dim_Users.User_ID'), nullable=False)
    Event_Title = Column(String(500), nullable=False)
    Description = Column(String(500))
    Event_Date = Column(DateTime)
    Location = Column(String(250))
    Status = Column(String(250))

    host = relationship("Dim_Users", back_populates="events_created")
    assignments = relationship("Fact_Assignments", back_populates="event")


class Dim_Tickets(Base):
    __tablename__ = 'Dim_Tickets'

    Ticket_ID = Column(Integer, primary_key=True, autoincrement=True)
    Event_ID = Column(Integer, ForeignKey('Dim_Events.Event_ID'), nullable=False)
    User_ID = Column(Integer, ForeignKey('Dim_Users.User_ID'), nullable=False)
    Booking_Date = Column(DateTime, default=datetime.now)


class Fact_Assignments(Base):
    __tablename__ = 'Fact_Assignments'

    Unique_ID = Column(Integer, primary_key=True, autoincrement=True)
    Event_ID = Column(Integer, ForeignKey('Dim_Events.Event_ID'), nullable=False)
    Anchor_ID = Column(Integer, ForeignKey('Dim_Anchor_Profiles.Profile_ID'), nullable=False)
    Host_ID = Column(Integer, ForeignKey('Dim_Users.User_ID'), nullable=False)
    Application_Status = Column(String(250), nullable=False)
    Timestamp = Column(DateTime, default=datetime.now)

    event = relationship("Dim_Events", back_populates="assignments")
    anchor = relationship("Dim_Anchor_Profiles", back_populates="applications")

