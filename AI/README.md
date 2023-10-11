# ASL Alphabet Hand Gesture Recognition

## Prerequisites

- Python 3.11
- `pip`
- `virtualenv`
- ASL AI Model

## Installation

1. Create a virtual environment `python3.11 -m venv venv`
2. Activate the virtual environment `source venv/bin/activate`
3. Install the requirements using `pip install -r requirements.txt`
4. Run the app using `python app.py`

Flask endpoint to access AI: `http://localhost:8082/predict`

## Creating Docker Image

1. Run `docker build -t asl-hand-gesture-ai .`
2. Start docker image locally `docker run -p 8082:8082 asl-hand-gesture-ai`

### Deploy to GCloud

1. Run `docker build -t gcr.io/babbling-on-2023/asl-hand-gesture-ai .`
2. Run `docker push gcr.io/babbling-on-2023/asl-hand-gesture-ai`
