# Use Python 3.11 as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /code

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application code
COPY . .

# Hugging Face Spaces uses port 7860 by default
ENV PORT=7860
EXPOSE 7860

# Start the application
# We use app.main:app because the app folder is in the root of the backend directory
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
