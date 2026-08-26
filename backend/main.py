from fastapi import FastAPI

app = FastAPI(title='MediVerse AI')

@app.get('/')
def home():
    return {'message':'MediVerse AI Backend Running'}
