from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
from typing import Optional
import io
import os
import uvicorn
import requests

app = FastAPI(
    title="Clique YOLO Service", 
    description="Object detection for Clique App", 
    version="1.0.0"
)

# Load the YOLOv8 Nano model (lightweight and fast)
print("Loading YOLO model...")
model = YOLO('yolov8n.pt')
print("Model loaded successfully")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "yolo-detection"}


@app.post("/detect")
async def detect_objects(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None)
):
    if not file and not image_url:
        raise HTTPException(
            status_code=400, 
            detail="Must provide either file or image_url"
        )

    try:
        # Get image contents
        if file:
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="File must be an image")
            contents = await file.read()
            filename = file.filename
        else:
            response = requests.get(image_url)
            response.raise_for_status()
            contents = response.content
            filename = image_url.split("/")[-1]

        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Run YOLO inference
        results = model(image)
        
        # Extract detected objects
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = model.names[cls_id]
                
                # Get bounding box coordinates
                xyxy = box.xyxy[0].tolist()
                
                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "bbox": xyxy
                })
        
        # Return unique classes with their highest confidence
        unique_tags = {}
        for d in detections:
            c = d["class"]
            if c not in unique_tags or d["confidence"] > unique_tags[c]:
                unique_tags[c] = d["confidence"]
        
        tags = [{"class": k, "confidence": v} for k, v in unique_tags.items()]
        
        return JSONResponse(content={
            "success": True,
            "filename": filename,
            "tags": tags,
            "detections": detections
        })

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Error processing image")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
