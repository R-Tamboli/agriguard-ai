"""Train a MobileNetV3 classifier on PlantVillage raw/color."""
import argparse
import json
import random
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, models, transforms
from torchvision.models import MobileNet_V3_Small_Weights


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="C:/Users/rehan/Downloads/PlantVillage-Dataset-master/raw/color")
    parser.add_argument("--output", default="models/plantvillage_mobilenet_v3_small.pt")
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--image-size", type=int, default=160)
    parser.add_argument("--workers", type=int, default=2)
    args = parser.parse_args()

    torch.hub.set_dir(str(Path(__file__).parent / ".runtime" / "torch-hub"))
    random.seed(42)
    torch.manual_seed(42)
    torch.set_num_threads(max(1, min(8, torch.get_num_threads())))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    size = args.image_size
    mean, std = (0.485, 0.456, 0.406), (0.229, 0.224, 0.225)
    train_transform = transforms.Compose([
        transforms.Resize((size, size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(12),
        transforms.ColorJitter(brightness=0.12, contrast=0.12, saturation=0.12),
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
    ])
    eval_transform = transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
    ])
    source = datasets.ImageFolder(args.data)
    if len(source.classes) != 38:
        print(f"Warning: expected 38 classes, found {len(source.classes)}", flush=True)

    by_class = [[] for _ in source.classes]
    for index, (_, label) in enumerate(source.samples):
        by_class[label].append(index)
    train_indices, val_indices = [], []
    for indices in by_class:
        random.shuffle(indices)
        split = max(1, int(len(indices) * 0.85))
        train_indices.extend(indices[:split])
        val_indices.extend(indices[split:])

    train_data = datasets.ImageFolder(args.data, transform=train_transform)
    val_data = datasets.ImageFolder(args.data, transform=eval_transform)
    train_loader = DataLoader(Subset(train_data, train_indices), batch_size=args.batch_size, shuffle=True,
                              num_workers=args.workers, pin_memory=device.type == "cuda")
    val_loader = DataLoader(Subset(val_data, val_indices), batch_size=args.batch_size, shuffle=False,
                            num_workers=args.workers, pin_memory=device.type == "cuda")

    weights = MobileNet_V3_Small_Weights.DEFAULT
    model = models.mobilenet_v3_small(weights=weights)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(source.classes))
    model.to(device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    best_accuracy = 0.0
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    print(json.dumps({"device": str(device), "classes": len(source.classes), "images": len(source),
                      "train": len(train_indices), "validation": len(val_indices), "epochs": args.epochs}), flush=True)

    for epoch in range(args.epochs):
        # Warm up the classifier head, then fine-tune the final feature blocks.
        for parameter in model.features.parameters():
            parameter.requires_grad = epoch >= 2
        optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad),
                                     lr=0.0007 if epoch < 2 else 0.00008, weight_decay=0.0001)
        model.train()
        total_loss = 0.0
        for batch, (images, labels) in enumerate(train_loader, 1):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad(set_to_none=True)
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            if batch % 100 == 0:
                print(f"epoch {epoch + 1}/{args.epochs} batch {batch}/{len(train_loader)} loss {loss.item():.4f}", flush=True)

        model.eval()
        correct = seen = 0
        with torch.inference_mode():
            for images, labels in val_loader:
                outputs = model(images.to(device))
                correct += (outputs.argmax(1).cpu() == labels).sum().item()
                seen += labels.size(0)
        accuracy = correct / max(seen, 1)
        print(f"epoch {epoch + 1}/{args.epochs}: loss={total_loss / max(len(train_loader), 1):.4f}, validation_accuracy={accuracy:.4f}", flush=True)
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            torch.save({"state_dict": model.cpu().state_dict(), "classes": source.classes,
                        "image_size": size, "validation_accuracy": best_accuracy}, output)
            model.to(device)
            print(f"saved best model: {output} ({best_accuracy:.4f})", flush=True)

    print(f"Training complete. Best validation accuracy: {best_accuracy:.4f}. Model: {output}", flush=True)


if __name__ == "__main__":
    main()
