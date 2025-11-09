from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.auth.router import router as auth_router
from src.users.router import router as users_router
from contextlib import asynccontextmanager
from src.database import engine, Base
from src.settings import ROOT_PATH


@asynccontextmanager
async def db_creation_lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

origins = [
    "http://localhost:5173",  # para recibir requests desde app React (puerto: 5173)
]

app = FastAPI(root_path=ROOT_PATH, lifespan=db_creation_lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
