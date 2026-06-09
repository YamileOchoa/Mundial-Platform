from pydantic import BaseModel
from typing import Optional

class PlayerCreate(BaseModel):
    nombre: str
    pais: str
    posicion: str
    foto_url: Optional[str] = None

class PlayerResponse(BaseModel):
    id: int
    nombre: str
    pais: str
    posicion: str
    foto_url: Optional[str] = None

    class Config:
        from_attributes = True
