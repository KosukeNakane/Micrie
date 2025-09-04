FROM python:3.10-slim-bookworm
WORKDIR /app

# System deps
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python deps
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir --upgrade pip
COPY requirements_freeze.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt \
    && pip check

# Create non-root user for runtime
RUN useradd -m -u 10001 -r -s /usr/sbin/nologin appuser

# App code and start script (owned by non-root)
COPY --chown=appuser:appuser . .
RUN chmod +x /app/start

ENV PORT=8080

# Select module by args or env via /app/start
USER appuser
ENTRYPOINT ["/app/start"]
# Default: integrated (all APIs). To run pitch-only, pass "pitch" as arg.
CMD ["all"]
