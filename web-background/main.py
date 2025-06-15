import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from file_manager import MarkdownFileManager

file_manager = MarkdownFileManager()

app = FastAPI()

# 允许跨域（开发用，生产要改成你的前端域名）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FileContent(BaseModel):
    content: str

@app.get("/api/files")
def list_files():
    files = file_manager.list_files()
    return {"files": files}

@app.get("/api/files/{filename}")
def get_file(filename: str):
    content = file_manager.get_file(filename)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found")
    return {"content": content}

@app.put("/api/files/{filename}")
def save_file(filename: str, file: FileContent):
    try:
        file_manager.save_file(filename, file.content)
        return {"success": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/files/{filename}")
def delete_file(filename: str):
    result = file_manager.delete_file(filename)
    if not result:
        raise HTTPException(status_code=404, detail="File not found")
    return {"success": True}

def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()