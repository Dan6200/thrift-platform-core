# Things to remember in this Project

The Product Data "Recipe": How the Tables Work Together

Think of the tables as a recipe for defining a product and all its possible variations. This structure is designed to be very flexible and avoid data
duplication.

1.  `products` (The Main Dish)

    - Purpose: This is the core table. It stores the essential information about a product that doesn't change between its variations, like the title
      ("T-Shirt"), description, and the main category.
    - Example Data: product_id: 101, title: 'Classic T-Shirt', description: 'A comfortable cotton t-shirt.'

2.  `product_options` (The Variation Types)

    - Purpose: This table defines the types of variations a specific product can have. It answers the question, "How does this product vary?"
    - Relation: It links directly to the products table.
    - Example Data:
      - option_id: 1, product_id: 101, option_name: 'COLOR'
      - option_id: 2, product_id: 101, option_name: 'SIZE'

3.  `product_option_values` (The Ingredients for Each Variation)

    - Purpose: This table stores the actual values for each option type.
    - Relation: It links to the product_options table.
    - Example Data:
      - value_id: 10, option_id: 1 (COLOR), value: 'BLUE'
      - value_id: 11, option_id: 1 (COLOR), value: 'RED'
      - value_id: 12, option_id: 2 (SIZE), value: 'S'
      - value_id: 13, option_id: 2 (SIZE), value: 'M'

4.  `product_variants` (The Final, Plated Dishes)

    - Purpose: This is the most important table for inventory and sales. Each row represents a specific, sellable version of the product (also known as a
      SKU). It has its own price, SKU number, and inventory count.
    - Relation: It links back to the main products table.
    - Example Data:
      - variant_id: 500, product_id: 101, sku: 'TS-BLU-S', quantity_available: 50
      - variant_id: 501, product_id: 101, sku: 'TS-RED-M', quantity_available: 30

5.  `variant_to_option_values` (The Recipe Card)
    - Purpose: This is the "glue" that holds everything together. It connects a specific, sellable variant to the specific option values that define it.
    - Relation: It's a "join table" that links product_variants and product_option_values.
    - Example Data:
      - variant_id: 500, value_id: 10 (links variant "TS-BLU-S" to "BLUE")
      - variant_id: 500, value_id: 12 (links variant "TS-BLU-S" to "S")
      - variant_id: 501, value_id: 11 (links variant "TS-RED-M" to "RED")
      - variant_id: 501, value_id: 13 (links variant "TS-RED-M" to "M")

---

How the create-query Adds Data to These Tables

The logic in create-query.ts is designed to populate these tables correctly when you send a request to create a new product. It does this within a database
transaction, which means all steps must succeed. If any single step fails, the entire operation is cancelled, and no data is saved, ensuring your data
remains consistent.

Here is the step-by-step flow:

1.  Create the Base Product: It starts by inserting the main product details (title, description, etc.) into the products table.

2.  Check for Variants: It looks at the request to see if a variants array was provided.

    - If NO variants are provided: It creates a single, default entry in product_variants with a basic SKU. This ensures the product exists as a sellable
      item, even if it has no options.
    - If variants ARE provided: It begins a loop to process each one.

3.  Process Each Variant: For every variant in the request (e.g., a Small, Blue T-Shirt), it does the following:
    - Get or Create Options: For each option in the variant (e.g., option_name: 'COLOR'), it checks the product_options table. If the "COLOR" option doesn't
      already exist for this product, it creates it.
    - Get or Create Option Values: It then does the same for the value (e.g., value: 'BLUE'). It checks the product_option_values table. If "BLUE" doesn't
      exist for the "COLOR" option, it creates it. This prevents duplicate option and value entries.
    - Create the Variant: It then inserts the specific variant into the product_variants table with its unique SKU, price, and quantity.
    - Link Everything: Finally, it creates the crucial links in the variant_to_option_values table, connecting the new variant to the "COLOR" and "BLUE"
      entries (and "SIZE" and "S", etc.).

This entire process is repeated for every variant in the request, ensuring that by the end, the product and all its variations are perfectly structured in
the database.

---

## Locations & Inventory

I've added two new tables, locations and inventory, to provide a more robust system for managing your product stock. Here’s how they work and how
they connect to your existing products and product_variants tables:

**1. locations Table**

- Purpose: This table defines the different physical places where you store inventory. Think of these as warehouses, different store branches, or even
  specific stock rooms.
- Key Columns:
  - location_id: A unique ID for each location.
  - store_id: This links each location to one of your stores, so you know which store owns which location.
  - location_name: A descriptive name like "Main Warehouse" or "Downtown Store Backroom".
  - address_id: This connects to your existing address table to store the physical address of the location.
- How it Connects:
  - A single store can have multiple locations.
  - Each location has one address.

**2. inventory Table**

- Purpose: This table acts as a detailed ledger for every single inventory movement. Instead of just having a single "quantity available" number, this table
  records every change, giving you a complete history.
- Key Columns:
  - variant_id: This links an inventory change directly to a specific product_variant.
  - location_id: This tells you where the inventory change happened by linking to the new locations table.
  - quantity_change: This is the core of the ledger. It's a number that can be positive (e.g., +50 for a restock) or negative (e.g., -1 for a sale).
  - reason: This explains why the inventory changed (e.g., 'sale', 'restock', 'return', 'damage').
- How it Connects:
  - It replaces the quantity_available column that was previously in your product_variants table.
  - To get the current stock level for any product variant at a specific location, you simply sum up all the quantity_change records for that variant_id and location_id.
  - The inventory table is designed as an append-only ledger, where each record is an immutable transaction. The created_at column tracks when each transaction occurred, and since records are not meant to be updated, an updated_at column is unnecessary. Any corrections should be made through new adjustment transactions to maintain a complete audit trail.

#### How It All Ties Together

1.  The quantity_available column has been removed from your product_variants table.
2.  A new view called product_variant_inventory has been created. This view automatically calculates the current quantity_available for each variant at each
    location by summing the quantity_change values from the inventory table. You can query this view just like a table to get up-to-date stock levels.

---

## Data Analytics Playbooks for Inventory Management

✦ That's a great question. Now that you have a more robust inventory system, you can implement several data analytics playbooks to optimize your inventory
management. Here are some of the most effective ones:

1. Inventory Performance Analysis

This playbook helps you understand how well your inventory is performing and identify which products are driving the most value.

- ABC Analysis:

  - What it is: A method of classifying your inventory into three categories (A, B, and C) based on their value and sales frequency.
    - A-items: Your most valuable products (e.g., top 20% of products that generate 80% of your revenue).
    - B-items: Your mid-range products.
    - C-items: Your low-value, high-volume products.
  - How to do it: Use data from your order_items and products tables to calculate the revenue generated by each product.
  - Why it's useful: It helps you prioritize your inventory management efforts. A-items require close monitoring and careful forecasting, while C-items can
    be managed with more automated processes.

- Inventory Turnover Ratio:
  - What it is: A measure of how many times your inventory is sold and replaced over a specific period.
  - How to do it: Cost of Goods Sold / Average Inventory
  - Why it's useful: A high ratio generally indicates efficient inventory management, but it should be compared to industry benchmarks. A low ratio might
    suggest overstocking or poor sales.

2. Demand Forecasting

This playbook helps you predict future customer demand so you can stock the right amount of inventory.

- Sales Trend Analysis:

  - What it is: Analyzing historical sales data to identify patterns and trends (e.g., seasonality, growth trends).
  - How to do it: Use data from your orders and order_items tables to analyze sales over time.
  - Why it's useful: It helps you anticipate future demand and adjust your inventory levels accordingly. For example, you can stock up on certain products
    before a holiday season.

- Moving Averages:
  - What it is: A technique used to smooth out short-term fluctuations in sales data and identify longer-term trends.
  - How to do it: Calculate the average sales over a specific period (e.g., 30 days) and move that period forward over time.
  - Why it's useful: It provides a more stable and reliable basis for your demand forecasts.

3. Stock Optimization

This playbook helps you maintain the optimal level of inventory to meet demand without overstocking.

- Safety Stock Analysis:

  - What it is: Determining the extra stock you need to hold to avoid stockouts caused by demand or lead time variability.
  - How to do it: Analyze the variability in your sales data and supplier lead times.
  - Why it's useful: It helps you find the right balance between the cost of holding inventory and the cost of lost sales due to stockouts.

- Reorder Point (ROP) Analysis:
  - What it is: Determining the inventory level at which you should place a new order.
  - How to do it: (Average Daily Usage \* Average Lead Time) + Safety Stock
  - Why it's useful: It helps you automate your reordering process and prevent stockouts.

4. Supplier Performance Analysis

This playbook helps you evaluate the performance of your suppliers and make better sourcing decisions.

- Lead Time Analysis:
  - What it is: Analyzing the time it takes for your suppliers to deliver your orders.
  - How to do it: Track the time from when you place an order with a supplier to when you receive the goods.
  - Why it's useful: It helps you identify reliable suppliers, negotiate better terms, and improve the accuracy of your reorder point calculations.
