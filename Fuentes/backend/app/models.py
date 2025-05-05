from app import db
from datetime import datetime

class tbldifficulty(db.Model):
    __tablename__ = 'tbldifficulty'

    iddifficulty = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(15))
    active = db.Column(db.Boolean, default=True)


class tbltemplate(db.Model):
    __tablename__ = 'tbltemplate'

    idtemplate = db.Column(db.Integer, primary_key=True)
    iddifficulty = db.Column(db.Integer, db.ForeignKey('tbldifficulty.iddifficulty'))
    grid = db.Column(db.JSON)
    active = db.Column(db.Boolean, default=True)


class tblplayed(db.Model):
    __tablename__ = 'tblplayed'

    idplayed = db.Column(db.Integer, primary_key=True)
    idtemplate = db.Column(db.Integer, db.ForeignKey('tbltemplate.idtemplate'))
    nickname = db.Column(db.String(20))
    timeused = db.Column(db.Interval)
    playedat = db.Column(db.TIMESTAMP(timezone=True), server_default=db.func.current_timestamp())
