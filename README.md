<img width="1920" height="1055" alt="image" src="https://github.com/user-attachments/assets/6dc938cb-b077-4ee0-86c7-3c94409b0119" />

# Proesc Notes - A Modern PWA Note-Taking App

This is a modern note-taking application built with a focus on exploring and implementing cutting-edge web technologies. The primary goal of this project was to serve as a learning playground for creating a robust, offline-first Progressive Web App (PWA) using a modern tech stack.

The application is built with:
-   **Backend**: Laravel
-   **Frontend**: React with Inertia.js
-   **Database**: IndexedDB for offline storage, with backend synchronization.
-   **Styling**: Tailwind CSS

---

## Progressive Web App (PWA) Features

This application has been developed as an offline-first Progressive Web App, enabling a user experience similar to that of a native application. The implementation follows the best practices and core concepts outlined in the [MDN Progressive Web Apps documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps).

### Key PWA Components:

#### 1. Web App Manifest

The application includes a `public/manifest.json` file, which is the cornerstone of its PWA capabilities. This file provides the browser with metadata about the app, allowing it to be "installed" on the user's device. Key properties defined in our manifest include:
-   `name` and `short_name`: To identify the application on the home screen.
-   `icons`: A set of icons for different resolutions and contexts.
-   `start_url`: The entry point of the application when launched from the home screen.
-   `display`: Set to `standalone` to provide a native app-like, chromeless window.
-   `background_color` and `theme_color`: For a branded launch experience.

For more details on what each member does, see the [MDN Web App Manifest documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_app_manifest).

#### 2. Service Worker

The service worker, located at `public/sw.js`, acts as a client-side proxy, intercepting network requests and managing caching strategies. This is what enables the rich offline experience.
-   **Offline Support**: The service worker caches essential application assets (the "App Shell") and user data (notes), making them available even without a network connection.
-   **Caching Strategy**: It uses a "cache-first" strategy for static assets and a "network-first" strategy for dynamic data like API calls, ensuring the user always has access to their notes while getting fresh data when online.
-   **Background Sync**: While not fully implemented in this basic version, the groundwork is laid for features like background synchronization, which could push local changes to the server once a connection is re-established.

Learn more about the power of service workers at [MDN Service Worker API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

#### 3. Local-First Storage & Tooling

To achieve a true offline-first experience, this application relies on a robust client-side storage solution and modern tooling:

-   **IndexedDB**: We use the browser's native [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) as the primary storage for all notes. This allows for a large amount of structured data to be stored directly on the user's device, making it instantly accessible regardless of network status.

-   **Dexie.js**: To simplify interactions with IndexedDB, we use [Dexie.js](https://dexie.org/), a powerful and minimalistic wrapper. Dexie.js makes database operations like creating, reading, updating, and deleting notes much more straightforward and readable than using the native IndexedDB API directly.

-   **Vite PWA Plugin**: The `vite-plugin-pwa` is a key part of our development workflow. It automates the generation of the service worker and the web app manifest, injecting the necessary boilerplate and ensuring our PWA is always configured correctly based on our `vite.config.ts` file.

### A Note on Secure Contexts

It's important to note that many PWA features, especially **Service Workers**, require a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) to run. For development purposes, browsers treat `localhost` and `127.0.0.1` as secure contexts.

This means that while running the application locally using `php artisan serve` (which typically serves on `http://127.0.0.1:8000`), all PWA features, including offline support, will work as expected.

However, if you expose your local server to your network and try to access it via its IP address (e.g., `http://192.168.1.100:8000`), the browser will not consider it a secure context, and PWA features will be disabled. For testing on other devices, you would need to set up a secure HTTPS tunnel using a tool like [ngrok](https://ngrok.com/).

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   PHP >= 8.2
-   Composer
-   Node.js and npm
-   A local database (Sqlite, MySQL, PostgreSQL, etc.)

### Installation & Running the App

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lumamontes/proesc-notes.git
    cd proesc-notes
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Create your environment file:**
    Copy the `.env.example` file to a new file named `.env`.
    ```bash
    cp .env.example .env
    ```
    Then, generate an application key:
    ```bash
    php artisan key:generate
    ```

5.  **Configure your database:**
    Open the `.env` file and update the `DB_*` variables with your local database credentials.

6.  **Run database migrations:**
    This will create the `users` and `notes` tables in your database.
    ```bash
    php artisan migrate
    ```

7.  **Run the development servers:**
    You need to run two commands in separate terminal tabs.

    -   **Vite Development Server (compiles frontend assets):**
        ```bash
        npm run dev
        ```
    -   **Laravel Development Server (serves the application):**
        ```bash
        php artisan serve
        ```

8.  **Access the application:**
    Open your browser and navigate to the URL provided by `php artisan serve` (usually `http://127.0.0.1:8000`). 
