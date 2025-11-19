#!/bin/bash

# Replace with your GCP Project ID
export GCP_PROJECT_ID="thrift-ecommerce-project"

# Replace with your desired region (e.g., us-central1, europe-west1)
export REGION="us-central1"

# Choose a name for your Artifact Registry repository
export REPO_NAME="thrift-images"

# Choose a name for your Cloud Run service
export SERVICE_NAME="thrift-classical-search"

# Construct the full image tag
export IMAGE_TAG="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"

echo "Configuration set:"
echo "Project ID: ${GCP_PROJECT_ID}"
echo "Region: ${REGION}"
echo "Image Tag: ${IMAGE_TAG}"
