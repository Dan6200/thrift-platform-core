# Stage 1: Fetch and prepare data
FROM ubuntu:latest AS data-fetcher
RUN apt-get update && apt-get install -y jq

# Copy the scripts
COPY ./populate-search/fetch_products.sh /opt/src/fetch_products.sh
COPY ./populate-search/populate_search.sh /opt/src/populate_search.sh
COPY ./populate-search/set_searchable_fields.sh /opt/src/set_searchable_fields.sh
COPY ./test/query.sh	/opt/src/run_test.sh

# Ensure the scripts are executable
RUN chmod +x /opt/src/*.sh

# Stage 2: MeiliSearch service
FROM getmeili/meilisearch:latest
EXPOSE 7700

# Install required packages
RUN apk update && apk add jq

# Copy the necessary files and jq binary from the first stage
COPY --from=data-fetcher /opt/src /opt/src

# Ensure the scripts are executable
RUN chmod +x /opt/src/*.sh

# Copy the entrypoint script to /opt/src
COPY entrypoint.sh /opt/src/entrypoint.sh
RUN chmod +x /opt/src/entrypoint.sh

# Use the entrypoint script to start MeiliSearch and then run scripts
ENTRYPOINT ["/opt/src/entrypoint.sh"]

# Default command to keep the container running
CMD ["tail", "-f", "/dev/null"]
