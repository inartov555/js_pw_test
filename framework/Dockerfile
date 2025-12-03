FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Copy the tests
COPY . /tests

WORKDIR /tests

# Install Node dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Install Playwright browsers & system deps
RUN npx playwright install --with-deps

# Ensure Xvfb is available for headed runs under a virtual display
USER root

# Ensure non-root user (provided by the Playwright base image) owns the workspace
RUN chown -R pwuser:pwuser /tests
USER pwuser

# Default behavior: run the tests suite (with a virtual display)
CMD ["bash", "-lc", "xvfb-run -a -s '-screen 0 1920x1080x24' npx playwright test"]  # headless = 0
# CMD ["bash", "-lc", "pytest -q"]  # headless = 1
