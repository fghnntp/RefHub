import os

class MarkdownFileManager:
    def __init__(self, files_root="./markdown_files"):
        self.FILES_ROOT = files_root
        os.makedirs(self.FILES_ROOT, exist_ok=True)

    def list_files(self):
        return [f for f in os.listdir(self.FILES_ROOT) if f.endswith('.md') or f.endswith('.pdf')]

    def get_file(self, filename):
        path = os.path.join(self.FILES_ROOT, filename)
        if not os.path.isfile(path):
            return None
        if filename.endswith('.pdf'):
            from fastapi.responses import FileResponse
            return FileResponse(path, media_type="application/pdf", filename=filename)
        elif filename.endswith('.md'):
            with open(path, "r", encoding="utf-8") as f:
                return f.read()

    def save_file(self, filename, content):
        if not filename.endswith('.md'):
            raise ValueError("Only .md files allowed")
        path = os.path.join(self.FILES_ROOT, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True

    def delete_file(self, filename):
        path = os.path.join(self.FILES_ROOT, filename)
        if not os.path.isfile(path):
            return False
        os.remove(path)
        return True