from flask import jsonify
from PIL import Image
import torch
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import ast

device = "cuda" if torch.cuda.is_available() else "cpu"
mtcnn = MTCNN(image_size=160, margin=0, keep_all=False, device=device, post_process=False)
resnet = InceptionResnetV1(pretrained="vggface2").eval().to(device)

def handle_extract_live_embedding(request):
    if "image" not in request.files:
        return jsonify({"error": "No live image frame provided"}), 400
    
    try:
        file = request.files["image"]
        live_embedding, error = extract_face_embedding(file)
        
        if error:
            return jsonify({"error": error}), 400
        
        if not live_embedding:
            return jsonify({"error": "No embedding extracted"}), 400
            
        return jsonify({"live_embedding": live_embedding}), 200
    
    except Exception as ex:
        return jsonify({"error": f"Processing error: {str(ex)}"}), 500

def extract_face_embedding(file_storage):
    try:
        img = Image.open(file_storage.stream).convert("RGB")
        
        boxes, _ = mtcnn.detect(img)
        if boxes is None:
            return None, "No face detected"
            
        face = mtcnn.extract(img, boxes, save_path=None)
        if face is None:
            return None, "No face detected"

        if isinstance(face, torch.Tensor):
            face = face.to(device)
        else:
            return None, "Could not extract face tensor"

        if face.ndim == 3:
            face = face.unsqueeze(0)

        emb = resnet(face).detach().cpu().numpy().flatten().tolist()
        return emb, None
    except Exception as ex:
        return None, str(ex)