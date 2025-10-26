import json

with open('/home/darealestninja/dev-projects/thrift/thrift-monorepo/packages/thrift-api/media_data.txt', 'r') as f:
    lines = f.readlines()

images_data = []
# The first 2 lines are headers, the last line is the count of rows
for line in lines[2:-1]:
    parts = line.split('|')
    if len(parts) == 2:
        filename = parts[0].strip()
        description = parts[1].strip()
        
        product_name = filename.replace('_', ' ').replace('.jpg', '')
        
        prompt = f"A professional ecommerce product photo of a {product_name}, with the following features: {description}. The product should be on a clean, white background, with studio lighting."
        filepath = f"/home/darealestninja/dev-projects/thrift/thrift-monorepo/packages/thrift-api/generated_images/{filename}"
        
        images_data.append({
            "prompt": prompt,
            "filepath": filepath
        })

with open('/home/darealestninja/dev-projects/thrift/thrift-monorepo/packages/thrift-api/image_generation_prompts.json', 'w') as f:
    json.dump(images_data, f, indent=2)

print(f"Successfully created image_generation_prompts.json with {len(images_data)} prompts.")
