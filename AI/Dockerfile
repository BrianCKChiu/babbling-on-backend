FROM python:3.11-slim
RUN apt-get update
RUN apt-get -y install curl
RUN apt-get -y install gcc python3-dev
# Install libraries
COPY ./requirements.txt ./
RUN pip install -r requirements.txt && \
    rm ./requirements.txt

# Setup container directories
RUN mkdir /app

# Copy local code to the container
COPY ./app /app

# launch server with gunicorn
WORKDIR /app
EXPOSE 8080
CMD ["gunicorn", "app:app", "--timeout=0", "--preload", \
     "--workers=1", "--threads=4", "--bind=0.0.0.0:8082"]