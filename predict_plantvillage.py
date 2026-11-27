"""Run the trained PlantVillage model against one base64 image on stdin."""
import base64
import json
import sys
from io import BytesIO
from pathlib import Path

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image


def main():
    model_path = Path(sys.argv[1] if len(sys.argv) > 1 else "models/plantvillage_mobilenet_v3_small.pt")
    payload = sys.stdin.read().strip()
    if not model_path.exists():
        print(json.dumps({"error": "Trained PlantVillage model not found. Run train_plantvillage.py first."}))
        raise SystemExit(2)

    data = json.loads(payload)
    encoded = data.get("image", "").split(",", 1)[-1]
    image = Image.open(BytesIO(base64.b64decode(encoded))).convert("RGB")
    checkpoint = torch.load(model_path, map_location="cpu", weights_only=True)
    model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(checkpoint["classes"]))
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()
    size = checkpoint.get("image_size", 160)
    image_tensor = transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225)),
    ])(image).unsqueeze(0)
    with torch.inference_mode():
        probabilities = model(image_tensor).softmax(dim=1)[0]
    scores, indices = probabilities.topk(3)
    predictions = []
    for score, index in zip(scores.tolist(), indices.tolist()):
        label = checkpoint["classes"][index]
        plant, _, disease = label.partition("___")
        predictions.append({"label": label, "plant": plant.replace("_", " ").replace(",", ""),
                            "disease": disease.replace("_", " ").strip() or "Unknown",
                            "confidence": round(score, 4)})
    print(json.dumps({"prediction": predictions[0], "alternatives": predictions,
                      "validationAccuracy": checkpoint.get("validation_accuracy")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
