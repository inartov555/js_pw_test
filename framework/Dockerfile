FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Copying package files first for caching
COPY package*.json ./

WORKDIR /tests

# Install Node dependencies first for better caching
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy the tests
COPY . .

# Install Playwright browsers & system deps
RUN npx playwright install --with-deps

# Ensure Xvfb is available for headed runs under a virtual display
USER root

# Ensure non-root user (provided by the Playwright base image) owns the workspace
RUN chown -R pwuser:pwuser /tests
USER pwuser

# Default behavior: run the tests suite (with a virtual display)
# headless = 0
CMD bash -lc "xvfb-run -a -s '-screen 0 1920x1080x24' npx playwright test"
# CMD ["bash", "-lc", "pytest -q"]  # headless = 1
