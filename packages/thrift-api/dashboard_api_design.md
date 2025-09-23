## API Design for E-commerce Dashboard

The API will be designed using RESTful principles, focusing on clear endpoints, appropriate HTTP methods, and intuitive request/response structures. All endpoints will be under a `/v1/dashboard` prefix and will require authentication and authorization (ensuring a store owner can only access their `store_id`'s data).

### Base URL

`GET /v1/dashboard/{storeId}/...`

Where `{storeId}` is the unique identifier for the tenant's store. This ensures multitenancy is handled by scoping all requests to a specific store.

### API Endpoints

#### 1. High-Level Overview

**1.1. Get Key Performance Indicators (KPIs)**

- **Endpoint**: `/v1/dashboard/{storeId}/kpis`
- **Method**: `GET`
- **Description**: Retrieves aggregated key performance indicators for the specified store and timeframe.
- **Query Parameters**:
  - `startDate` (optional, string, ISO 8601 date): Start date for data aggregation.
  - `endDate` (optional, string, ISO 8601 date): End date for data aggregation.
- **Response (JSON)**:
  ```json
  {
    "totalRevenue": 123456.78,
    "totalOrders": 1234,
    "averageOrderValue": 100.0,
    "newCustomers": 50,
    "returningCustomers": 70,
    "conversionRate": null // Assumed external data, will be null or omitted if not integrated
  }
  ```
- **Data Source**: `orders` table (for revenue, orders, AOV), `profiles` table (for new/returning customers via `created_at` and `customer_id` join with `orders`).

**1.2. Get Revenue Trends**

- **Endpoint**: `/v1/dashboard/{storeId}/revenue-trends`
- **Method**: `GET`
- **Description**: Retrieves time-series revenue data for charting.
- **Query Parameters**:
  - `startDate` (required, string, ISO 8601 date): Start date.
  - `endDate` (required, string, ISO 8601 date): End date.
  - `interval` (optional, string): Aggregation interval (`day`, `week`, `month`, `year`). Default: `day`.
- **Response (JSON)**:
  ```json
  [
    { "date": "2025-07-01", "revenue": 1000.0 },
    { "date": "2025-07-02", "revenue": 1200.5 }
    // ...
  ]
  ```
- **Data Source**: `orders` table (`order_date`, `total_amount`).

#### 2. Detailed Analytics Sections

**2.1. Sales Performance**

**2.1.1. Get Sales Analytics**

- **Endpoint**: `/v1/dashboard/{storeId}/sales-analytics`
- **Method**: `GET`
- **Description**: Retrieves various sales performance reports for the specified store and timeframe, differentiated by the `type` query parameter.
- **Query Parameters**:
  - `type` (required, string): Specifies the type of sales report.
    - `by-product`: Sales breakdown by product.
    - `by-category`: Sales breakdown by category.
    - `recent-orders`: Lists recent orders.
  - `startDate`, `endDate` (optional, ISO 8601 date): Timeframe filters, applicable to all types.
  - `limit` (optional, int): Number of records to return. Default: 10. (Applicable to `by-product` and `recent-orders`)
  - `offset` (optional, int): Offset for pagination. (Applicable to `by-product` and `recent-orders`)
  - `sortBy` (optional, string): Field to sort by (`unitsSold`, `totalRevenue`). Default: `unitsSold`. (Applicable to `by-product`)
  - `sortOrder` (optional, string): `asc` or `desc`. Default: `desc`. (Applicable to `by-product`)
  - `status` (optional, string): Filter by order status (e.g., `pending`, `completed`, `cancelled`). (Applicable to `recent-orders`)
- **Response (JSON)**:
  ```json
  // Example for type=by-product
  [
    {
      "productId": 1,
      "productTitle": "Laptop",
      "unitsSold": 150,
      "totalRevenue": 150000.0
    },
    {
      "productId": 2,
      "productTitle": "Smartphone",
      "unitsSold": 120,
      "totalRevenue": 100000.0
    }
  ]
  // Example for type=by-category
  [
    {
      "categoryId": 1,
      "categoryName": "Electronics",
      "totalRevenue": 250000.0
    },
    { "categoryId": 2, "categoryName": "Apparel", "totalRevenue": 50000.0 }
  ]
  // Example for type=recent-orders
  [
    {
      "orderId": 1001,
      "customerName": "John Doe",
      "totalAmount": 125.5,
      "status": "completed",
      "orderDate": "2025-07-25T14:30:00Z"
    },
    {
      "orderId": 1002,
      "customerName": "Jane Smith",
      "totalAmount": 200.0,
      "status": "pending",
      "orderDate": "2025-07-25T14:00:00Z"
    }
  ]
  ```
- **Data Source**: Varies based on `type`:
  - `by-product`: `order_items` (quantity, `price_at_purchase`) joined with `products` (title), `orders` (for `store_id` and `order_date`).
  - `by-category`: `order_items` joined with `products` and `categories`, `orders` (for `store_id`).
  - `recent-orders`: `orders` joined with `profiles` (for customer name).

**2.2. Customer Insights**

**2.2.1. Get Customer Acquisition Trends**

- **Endpoint**: `/v1/dashboard/{storeId}/customers/acquisition-trends`
- **Method**: `GET`
- **Description**: Shows customer acquisition trends over time.
- **Query Parameters**:
  - `startDate`, `endDate` (required, ISO 8601 date): Timeframe.
  - `interval` (optional, string): Aggregation interval (`day`, `week`, `month`, `year`). Default: `month`.
- **Response (JSON)**:
  ```json
  [
    { "date": "2025-05-01", "newCustomers": 30 },
    { "date": "2025-06-01", "newCustomers": 45 }
    // ...
  ]
  ```
- **Data Source**: `profiles` table (`created_at`). Requires filtering profiles by those associated with orders from the given `store_id`.

**2.2.2. Get Customers by Location**

- **Endpoint**: `/v1/dashboard/{storeId}/customers/by-location`
- **Method**: `GET`
- **Description**: Breakdown of customers by geographic location.
- **Query Parameters**:
  - `locationType` (optional, string): `country` or `city`. Default: `country`.
- **Response (JSON)**:
  ```json
  [
    { "location": "Nigeria", "customerCount": 500 },
    { "location": "Ghana", "customerCount": 100 },
    { "location": "Lagos", "customerCount": 250 } // if locationType is 'city'
  ]
  ```
- **Data Source**: `profiles` table (`country`, `city` from `address` table joined via `delivery_info` or a direct link from `profiles` to `address` if customers have a primary address).

**2.2.3. Get Customer Lifetime Value (CLV)**

- **Endpoint**: `/v1/dashboard/{storeId}/customers/clv`
- **Method**: `GET`
- **Description**: Lists customers with their calculated Lifetime Value.
- **Query Parameters**:
  - `limit`, `offset` (optional, int): Pagination.
  - `sortBy` (optional, string): Field to sort by (`clv`, `customerName`). Default: `clv`.
  - `sortOrder` (optional, string): `asc` or `desc`. Default: `desc`.
- **Response (JSON)**:
  ```json
  [
    { "customerId": "uuid-1", "customerName": "Jane Doe", "clv": 5000.0 },
    { "customerId": "uuid-2", "customerName": "Peter Jones", "clv": 3500.0 }
  ]
  ```
- **Data Source**: Aggregated `total_amount` from `orders` for each `customer_id`, joined with `profiles`.

**2.3. Product Performance**

**2.3.1. Get Top-Selling Products**

- **Endpoint**: `/v1/dashboard/{storeId}/products/top-selling`
- **Method**: `GET`
- **Description**: Lists top-selling products by units or revenue. (Similar to Sales by Product, but can be distinct for "top-N" list).
- **Query Parameters**:
  - `startDate`, `endDate` (optional, ISO 8601 date): Timeframe filters.
  - `sortBy` (optional, string): `units` or `revenue`. Default: `units`.
  - `limit` (optional, int): Number of top products to return. Default: 10.
- **Response (JSON)**:
  ```json
  [
    {
      "productId": 1,
      "productTitle": "Laptop",
      "unitsSold": 150,
      "totalRevenue": 150000.0
    },
    {
      "productId": 2,
      "productTitle": "Smartphone",
      "unitsSold": 120,
      "totalRevenue": 100000.0
    }
  ]
  ```
- **Data Source**: `order_items` joined with `products`, `orders`.

**2.3.2. Get Low Stock Products**

- **Endpoint**: `/v1/dashboard/{storeId}/products/low-stock`
- **Method**: `GET`
- **Description**: Lists products with critically low stock levels.
- **Query Parameters**:
  - `threshold` (optional, int): Only return products with `quantity_available` below this value. Default: 20.
  - `limit`, `offset` (optional, int): Pagination.
- **Response (JSON)**:
  ```json
  [
    { "productId": 5, "productTitle": "Mousepad", "quantityAvailable": 10 },
    { "productId": 6, "productTitle": "USB Drive", "quantityAvailable": 5 }
  ]
  ```
- **Data Source**: `products` table (`quantity_available`), filtered by `store_id`.

**2.3.3. Get Product Performance (Views vs. Purchases)**

- **Endpoint**: `/v1/dashboard/{storeId}/products/performance`
- **Method**: `GET`
- **Description**: Compares product purchases (views are external).
- **Query Parameters**:
  - `startDate`, `endDate` (optional, ISO 8601 date): Timeframe filters.
  - `limit`, `offset` (optional, int): Pagination.
- **Response (JSON)**:
  ```json
  [
    {
      "productId": 1,
      "productTitle": "Laptop",
      "purchases": 150,
      "views": null
    },
    {
      "productId": 3,
      "productTitle": "Headphones",
      "purchases": 80,
      "views": null
    }
  ]
  ```
- **Data Source**: `order_items` joined with `products`, `orders`.

### General API Considerations

- **Authentication & Authorization**: As noted, all endpoints must be authenticated and authorized. The `storeId` in the path should be verified against the authenticated user's permissions.
- **Error Handling**: Implement consistent error responses (e.g., 400 Bad Request, 401 Unauthorized, 403 Unauthorized, 404 Not Found, 500 Internal Server Error).
- **Data Validation**: Validate all incoming query parameters (e.g., date formats, integer values, valid enums for `interval`, `sortBy`, `sortOrder`).
- **Performance**: Implement database indexing on frequently queried columns (e.g., `order_date`, `customer_id`, `store_id`, `created_at`). Server-side caching can also be used for frequently requested, less real-time data.

## Should I use Views for Querying the Data?

**What are Database Views?**
A database view is a virtual table based on the result-set of an SQL query. It does not store data itself but rather presents data stored in base tables. When you query a view, the underlying SQL query defining the view is executed. Materialized views, on the other hand, store the query result as a physical table, which must be refreshed periodically.

**Pros of using Views for this Dashboard:**

1.  **Simplification of Complex Queries**: Many dashboard metrics require joining multiple tables (`orders`, `order_items`, `products`, `profiles`, `categories`, `subcategories`). Views can encapsulate these complex `JOIN` operations and `GROUP BY` clauses, making the queries from your application much simpler and more readable.
    - _Example_: A view `v_store_order_details` could join `orders`, `profiles`, and `delivery_info`, so your application just queries `SELECT * FROM v_store_order_details WHERE store_id = :storeId`.
2.  **Modularity and Reusability**: If certain aggregated or joined datasets are used across multiple API endpoints or dashboard components, defining them as views promotes reusability and reduces redundant SQL code in your application.
3.  **Security (Additional Layer)**: While Row-Level Security (RLS) is enabled on your tables, views can offer another layer of abstraction and control. You could define views that only expose specific columns or pre-filter data relevant to a specific role, simplifying your RLS policies or application logic.
4.  **Abstraction**: Views provide a layer of abstraction between your application and the underlying database schema. If you need to refactor your table structure (e.g., rename a column, split a table), you might only need to update the view definition, minimizing changes in your application code.
5.  **Performance (with Materialized Views)**: For frequently accessed, aggregated data that doesn't need to be real-time down to the second (e.g., daily KPIs, monthly trends), **materialized views** can significantly improve read performance. They pre-compute and store the results, avoiding repeated expensive computations. You would need a strategy to refresh these views (e.g., scheduled cron jobs, database triggers).

**Cons of using Views:**

1.  **Performance (Standard Views)**: For standard (non-materialized) views, the underlying query is executed every time the view is queried. If the view itself involves very complex joins or aggregations on large, frequently changing tables, querying the view might be slower than a direct, hand-optimized query for specific use cases.
2.  **Debugging Complexity**: Debugging performance issues or incorrect data from views can be more challenging, as you need to understand both the view's definition and how your application queries it.
3.  **Overhead for Highly Dynamic Filters**: If every query against a view requires unique and dynamic filters (e.g., highly variable date ranges, complex conditional logic), the benefits of simplification might diminish. The application would still need to apply `WHERE` clauses to the view, and the database might not be able to optimize these combined queries as effectively as a single, optimized direct query.
4.  **Materialized View Refresh Management**: Materialized views require a refresh strategy. This adds operational overhead and introduces a delay in data freshness. You must decide how often they need to be refreshed based on your dashboard's real-time requirements.

**Recommendation:**

**Yes, you should strategically use database views for this dashboard, especially materialized views for certain components.**

Here's a recommended approach:

1.  **High-Level KPIs (Total Revenue, Total Orders, AOV, New vs. Returning Customers)**:

    - **Strong Candidates for Materialized Views**: These are aggregate numbers where a few minutes or hours of data staleness might be acceptable for improved performance. Create materialized views that aggregate these metrics per `store_id` for common timeframes (e.g., daily, weekly, monthly aggregates).
    - _Example_: `mv_daily_store_kpis (store_id, date, total_revenue, total_orders, aov, new_customers, returning_customers)`

2.  **Time-Series Data (Revenue Trends, Customer Acquisition Trends)**:

    - **Good Candidates for Materialized Views**: Aggregating data by day, week, or month is ideal for materialized views. This would pre-compute the points for your charts.
    - _Example_: `mv_monthly_revenue_trends (store_id, month, total_revenue)`

3.  **Detailed Lists (Recent Orders, Low Stock Products)**:

    - **Good Candidates for Standard Views**: These lists require dynamic filtering (e.g., by status, by stock threshold, pagination). A standard view can simplify the `SELECT` statement by pre-joining tables (e.g., `orders` with `profiles` for customer name), but the filtering and pagination will still be handled by your application's query against the view.
    - _Example_: `v_detailed_orders (order_id, customer_id, customer_name, total_amount, status, order_date, store_id)`

4.  **Complex Aggregations (Sales by Product/Category, CLV, Top-Selling Products)**:
    - **Consider Materialized Views for Aggregates, Standard Views for Joins**: For the aggregated results (e.g., total sales per product), materialized views can be beneficial. For simply presenting joined data (like product details with sales figures), standard views can simplify the join logic.

**Implementation Strategy:**

1.  **Develop API Endpoints with Direct Queries First**: This allows you to understand the exact data requirements and query patterns.
2.  **Profile and Optimize**: Use database tools to analyze the performance of your queries. Identify the slowest queries or those that are executed most frequently.
3.  **Introduce Views Iteratively**: For identified bottlenecks or repetitive complex joins, define appropriate views (materialized or standard). Refactor your API queries to use these views.
4.  **Manage Materialized View Refreshes**: If you use materialized views, set up a robust system for refreshing them (e.g., PostgreSQL's `REFRESH MATERIALIZED VIEW CONCURRENTLY` in a cron job or triggered by data changes).
5.  **Monitor Continuously**: Always monitor your API and database performance, adjusting your view strategy as data grows or usage patterns change.

By strategically combining direct queries with standard and materialized views, you can achieve a balance of performance, maintainability, and code readability for your e-commerce dashboard.

✓ Task Completed

I have provided a comprehensive API design for your e-commerce dashboard, including detailed endpoints for each component (High-Level Overview, Sales Performance, Customer Insights, Product Performance).

I also discussed the pros and cons of using database views, recommending a strategic approach where:

- High-level KPIs and time-series data are strong candidates for **materialized views** to improve performance.
- Detailed lists and complex aggregations can benefit from **standard views** to simplify query logic, and potentially materialized views for the aggregated parts.

The API design follows RESTful principles, with multitenancy handled by scoping requests to a specific `store_id`. General API considerations like authentication, authorization, error handling, and performance optimization (indexing, caching) were also highlighted.
