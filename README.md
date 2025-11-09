# Thrift E-Commerce Platform

Thrift is a full-stack e-commerce marketplace platform built on a modern technology stack. It provides a robust backend API for managing products, users, and orders, and a responsive web frontend for both customers and vendors. The platform includes features like product variant management, a shopping cart, and a vendor analytics dashboard.

## Tech Stack

- **Monorepo:** [pnpm](https://pnpm.io/) Workspaces
- **Backend (`thrift-api`):** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [PostgreSQL](https://www.postgresql.org/), [Supabase](https://supabase.com/), [Knex.js](https://knexjs.org/)
- **Frontend (`thrift-web`):** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Jotai](https://jotai.org/)
- **Testing:** [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/)

## Project Structure

This project is a monorepo containing the following key packages:

- `packages/thrift-api`: The core backend service. A RESTful API that handles all business logic, data storage, and user authentication.
- `packages/thrift-web`: The primary web interface. A Next.js application providing the customer-facing storefront, product pages, shopping cart, and a dashboard for vendors.
- `packages/cron-jobs`: A service for running scheduled background tasks, such as database maintenance or report generation.
- `packages/thrift-classical-search`: A dedicated service for handling product search and indexing.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd Thrift
    ```

2.  **Install dependencies:**
    Install all dependencies from the root of the monorepo using pnpm.

    ```bash
    pnpm install
    ```

3.  **Setup Backend Environment:**
    The backend relies on a Supabase instance managed via Docker.

    ```bash
    cd packages/thrift-api
    docker-compose up -d
    ```

4.  **Run Development Servers:**
    You can run the backend and frontend services concurrently from the root directory.
    - **Run the API:**
      ```bash
      pnpm --filter thrift-api dev
      ```
    - **Run the Web App:**
      ```bash
      pnpm --filter thrift-web dev
      ```

## Running Tests

To run the backend integration tests, navigate to the `thrift-api` package and use the provided script.

```bash
cd packages/thrift-api
pnpm tests
```
