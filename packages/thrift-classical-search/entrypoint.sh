#!/bin/sh

# Start Meilisearch in the background
meilisearch --master-key $API_KEY &

# Wait for meilisearch to be ready

while ! curl -s http://localhost:7700/health | grep '"status":"available"'; do
	echo "Waiting for Meilisearch to be available..."
	sleep 2
done

# Execute the data fetching script
/opt/src/fetch_products.sh

# Run scripts
/opt/src/populate_search.sh
echo "Waiting for Meilisearch to be populated..."
sleep 3
/opt/src/set_searchable_fields.sh
/opt/src/run_test.sh "acer"

# Keep the container running
exec "$@"
