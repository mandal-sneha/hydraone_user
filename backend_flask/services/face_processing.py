from PIL import Image
import torch
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity

device = "cpu"
mtcnn = MTCNN(image_size=160, margin=0, keep_all=False, device=device)
resnet = InceptionResnetV1(pretrained="vggface2").eval().to(device)

def extract_face_embedding(file_storage):
    try:
        img = Image.open(file_storage.stream).convert("RGB")
        face = mtcnn(img)
        if face is None:
            return None, "No face detected"
        face = face.unsqueeze(0).to(device)
        emb = resnet(face).detach().cpu().numpy().flatten().tolist()
        return emb, None
    except Exception as ex:
        return None, str(ex)

def compare_face_embeddings(file_storage, stored_embedding):
    try:
        current_embedding, error = extract_face_embedding(file_storage)
        if error:
            return None, error
        stored_emb_array = np.array(stored_embedding).reshape(1, -1)
        current_emb_array = np.array(current_embedding).reshape(1, -1)
        similarity_score = cosine_similarity(stored_emb_array, current_emb_array)[0][0]
        return float(similarity_score), None
    except Exception as ex:
        return None, str(ex)