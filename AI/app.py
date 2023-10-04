from flask import Flask, jsonify, request
from transformers import AutoModelForImageClassification
from torchvision import transforms
import torch
import json
from flask import Flask, jsonify, request
import torch
from PIL import Image
import requests
import numpy as np
from io import BytesIO
from torchvision.transforms import (
    CenterCrop,
    Compose,
    Normalize,
    RandomRotation,
    RandomResizedCrop,
    RandomHorizontalFlip,
    RandomAdjustSharpness,
    Resize,
    ToTensor,
)

app = Flask(__name__)
model = AutoModelForImageClassification.from_pretrained("./model")

PREPROCESS_CONFIG = "./model/preprocessor_config.json"
MODEL_CONFIG = "./model/config.json"


def preprocess_image(image, config):
    if config["do_resize"]:
        new_size = (config["size"]["width"], config["size"]["height"])
        image = image.resize(new_size, resample=Image.BILINEAR)

    if config["do_rescale"]:
        image = image.point(lambda i: i * config["rescale_factor"])

    if config["do_normalize"]:
        image = normalize_image(image, config["image_mean"], config["image_std"])

    return image


def normalize_image(image, mean, std):
    image = image.convert("RGB")
    im_np = np.array(image)
    for i in range(3):
        im_np[:, :, i] = (im_np[:, :, i] - mean[i] * 255) / (std[i] * 255)
    return Image.fromarray(im_np)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        with open(MODEL_CONFIG, "r") as config_file:
            config = json.load(config_file)
        labels = config["id2label"]
        print(labels)
        data = request.get_json()
        image_url = data.get("image_url", "")

        response = requests.get(image_url)
        print(response)
        image = Image.open(BytesIO(response.content))

        with open(PREPROCESS_CONFIG, "r") as config_file:
            preprocess_config = json.load(config_file)

        processed_image = preprocess_image(image, preprocess_config)
        image_mean, image_std = (
            preprocess_config["image_mean"],
            preprocess_config["image_std"],
        )
        normalize = Normalize(mean=image_mean, std=image_std)

        transform = Compose(
            [
                Resize((224, 224)),
                ToTensor(),
                normalize,
            ]
        )
        input_tensor = transform(processed_image).unsqueeze(0)  # Add batch dimension

        with torch.no_grad():
            predictions = model(input_tensor)
        print(predictions.logits)
        # Post-process the prediction: get class index
        predicted_class_idx = torch.argmax(predictions.logits, dim=1).item()

        prediction = labels[predicted_class_idx.__str__()]
        return jsonify({"prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8082)
