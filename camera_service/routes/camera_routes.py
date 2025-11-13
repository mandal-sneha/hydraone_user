from flask import Blueprint, request
from services.camera_controller import handle_extract_live_embedding

camera_bp = Blueprint(
    "camera_bp",
    __name__
)

@camera_bp.route("/extract-live-embedding", methods=["POST"])
def extract_live_embedding_route():
    return handle_extract_live_embedding(request)