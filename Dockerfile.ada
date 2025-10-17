# Fly.io ADA Container
# DealershipAI - Python ADA Engine for automotive dealership analysis

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.ada.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.ada.txt

# Copy application code
COPY lib/analysis/ ./lib/analysis/
COPY ada_engine.py .

# Create non-root user
RUN useradd -m -u 1000 ada && chown -R ada:ada /app
USER ada

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uvicorn", "ada_engine:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
