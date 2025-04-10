# TradingBot

This project is to create a trading bot for Luno. The frontend must have an analytics section where one could select and label data points on a graph of crypto prices to train a model. It must also have a way to run existing models from the backend model library. It must also have a produciton section that the model can run as data is pulled on Luno and do actions like buy or sell.

## Technologies:
Frontend:
- Next.js (14.2.7b)
- Tailwind CSS
- FastAPI
- Websockets
- shadcn

Backend:
- Python
- FastAPI
- Websockets

## Project structure:

Application frontend is located in ./frontend/tradingbot
Application backend is located in ./backend/app

## Preferences:

Frontend:
- Keep dark theme for all Web UI components
- Make sure the front end looks beautiful
- I prefer bun or bunx to install react modules

Backend:
- Use the luno-python library for interacting with luno
- Please conform to Pylinting standards on Python code

# Coding Best Practices Guide

This document outlines coding best practices and conventions for our project, covering the frontend (Next.js, Tailwind CSS, shadcn/ui, WebSockets) and backend (Python, FastAPI, WebSockets). Adhering to these practices ensures code quality, maintainability, consistency, and performance.

## General Coding Best Practices (Apply Everywhere)

* **Readability:** Write clear, concise, and self-explanatory code. Use meaningful variable and function names. Keep functions short and focused on a single task.
* **Consistency:** Follow consistent naming conventions, formatting (use linters/formatters like Prettier, Black), and architectural patterns throughout the codebase.
* **DRY (Don't Repeat Yourself):** Avoid duplicating code. Use functions, components, classes, or modules to encapsulate reusable logic.
* **Comments:** Write comments to explain *why* something is done, not *what* it does (the code should explain the 'what'). Explain complex logic, assumptions, or workarounds.
* **Error Handling:** Implement robust error handling. Anticipate potential failures (network requests, invalid input, etc.) and handle them gracefully (e.g., using try-catch blocks, appropriate HTTP status codes, logging).
* **Security:** Be mindful of security best practices (e.g., input validation, output encoding, authentication, authorization, dependency vulnerability scanning). Never trust user input.
* **Testing:** Write unit, integration, and end-to-end tests to ensure code correctness and prevent regressions.
* **Version Control (Git):** Use clear commit messages, branch effectively, and participate in code reviews.

## Frontend: Next.js (v14+ App Router)

* **App Router:** Embrace the App Router paradigm. Use Server Components by default for better performance and reduced client-side JavaScript.
* **Server Components:** Perform data fetching, access backend resources directly, and keep sensitive logic (e.g., API keys) out of the client bundle.
* **Client Components:** Use `'use client'` only when necessary (for interactivity, state, lifecycle effects, browser-only APIs). Keep Client Components small and push state management down the tree as much as possible.
* **Data Fetching:** Use `fetch` with `async/await` in Server Components. Leverage Next.js caching and revalidation strategies (`cache`, `next.revalidate`). Handle loading and error states gracefully, potentially using `loading.js` and `error.js` conventions.
* **API Routes:** Use Next.js API routes (`app/api/...`) for simple backend tasks or BFF (Backend-for-Frontend) patterns if not using a separate dedicated backend. Otherwise, interact with the main FastAPI backend.
* **Performance:** Optimize images (use `next/image`), leverage code splitting (automatic with App Router), minimize client-side bundle size, and use dynamic imports (`next/dynamic`) for large components/libraries not needed immediately.
* **Environment Variables:** Use `.env.local` for environment variables. Prefix client-side accessible variables with `NEXT_PUBLIC_`.

## Frontend: Tailwind CSS

* **Utility-First:** Embrace the utility-first approach. Compose styles directly in the HTML/JSX rather than writing custom CSS classes for most styling needs.
* **Readability:** Keep class strings readable. Consider using tools/plugins that sort Tailwind classes automatically (e.g., Prettier plugin). Group related utilities (e.g., layout, typography, color).
* **Configuration (`tailwind.config.js`):** Define custom theme values (colors, spacing, fonts) in the config file to maintain consistency and avoid magic numbers/values in templates.
* **Component Abstraction:** For complex, reusable UI elements with many utilities, consider creating a dedicated component (e.g., a `Button` or `Card` component) that encapsulates the Tailwind classes.
* **Avoid `@apply` where possible:** Use `@apply` sparingly in global CSS files, primarily for base styles or abstracting highly complex/repeated patterns that can't be easily componentized. Prefer component encapsulation.
* **Purging:** Ensure PurgeCSS (integrated into Tailwind) is configured correctly to remove unused styles in production builds.

## Frontend: shadcn/ui

* **Use the CLI:** Add components using the `shadcn-ui` CLI to ensure they are copied into your project correctly.
* **Customization:** Customize components by directly editing the component files within your codebase after adding them. Leverage Tailwind CSS for styling adjustments.
* **Composition:** Build complex UI elements by composing multiple shadcn/ui components together (e.g., using `Dialog` with `Form` components).
* **Accessibility:** Rely on the built-in accessibility features provided by Radix UI (which shadcn/ui uses internally), but always test for accessibility.

## Backend: Python & FastAPI

* **Project Structure:** Organize your FastAPI project logically (e.g., using routers for different domains, separating models, services, database logic).
* **Async/Await:** Use `async def` for path operation functions and any I/O-bound operations (database calls, network requests) to leverage FastAPI's asynchronous capabilities. Use `await` correctly.
* **Pydantic:** Use Pydantic models extensively for request body validation, response serialization, and settings management. Define clear, typed data structures.
* **Dependency Injection:** Utilize FastAPI's dependency injection system for reusable logic, database sessions, authentication, etc.
* **Routers (`APIRouter`):** Split endpoints into multiple files using `APIRouter` for better organization as the application grows.
* **Error Handling:** Use FastAPI's `HTTPException` for standard HTTP errors. Implement custom exception handlers for application-specific errors.
* **Type Hinting:** Use Python type hints consistently for function signatures and variables. This improves code clarity and enables static analysis.
* **PEP 8:** Follow the PEP 8 style guide for Python code (use linters like Flake8 and formatters like Black).
* **Testing:** Use `pytest` and FastAPI's `TestClient` to write effective tests for your endpoints and business logic.

## WebSockets (Frontend - JS/Next.js & Backend - Python/FastAPI)

* **Connection Management (Backend):** Implement a robust system (e.g., a manager class) on the backend to track active connections, handle joins/leaves, and manage broadcasting.
* **Message Format:** Define a clear and consistent message format (e.g., JSON) for communication between client and server. Include message types or actions.
    ```json
    { "type": "chat_message", "payload": { "user": "Alice", "text": "Hello!" } }
    { "type": "user_joined", "payload": { "user": "Bob" } }
    ```
* **Error Handling:** Implement error handling on both client and server for connection issues, message parsing errors, and authorization failures. Handle graceful disconnections.
* **Reconnection Logic (Frontend):** Implement logic on the client-side to automatically attempt reconnection if the WebSocket connection drops unexpectedly. Consider exponential backoff.
* **Security:** Authenticate WebSocket connections (e.g., using tokens passed during the initial handshake or as the first message). Authorize actions received over the WebSocket. Be cautious about data broadcasted to prevent information leaks.
* **Scalability (Backend):** For larger applications, consider using a message broker (like Redis Pub/Sub) to handle broadcasting across multiple backend instances.

---

By adhering to these best practices, we can build a robust, maintainable, and high-quality application. Remember that these are guidelines, and context matters – always strive for the clearest and most effective solution for the specific problem. Participate in code reviews to share knowledge and maintain standards.
