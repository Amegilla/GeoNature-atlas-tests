# coding: utf-8
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, MetaData, String, Table, Text
from geoalchemy2.types import Geometry
from sqlalchemy.sql.sqltypes import NullType
from sqlalchemy.orm import mapper
from sqlalchemy.ext.declarative import declarative_base
from ...utils import engine

metadata = MetaData()
Base = declarative_base()

class VmMailles(Base):
    __table__ = Table(
    'vm_mailles', metadata,
    Column('id_maille', String(5),primary_key=True, unique=True),
    Column('area_code', String(50)),
    Column('area_name', String(50)),
    Column('the_geom', Geometry(u'MULTIPOLYGON', 2154), index=True),
    schema='atlas', autoload=True, autoload_with=engine
)