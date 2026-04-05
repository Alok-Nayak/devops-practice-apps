# 🔗 URL Shortener API + Web App

A full-stack URL shortener application with a web interface, REST API, and built-in monitoring. This project is designed for real-world DevOps practice including containerization, observability, and Kubernetes deployment.

---

## 🚀 Features

- Shorten long URLs
- Redirect using short links
- View all URLs with click tracking
- Delete individual URLs
- Clear all URLs
- Web UI for easy interaction
- Health and readiness endpoints
- Prometheus metrics integration

---

## ⚙️ Technology Stack

- Node.js
- Express.js
- TypeScript
- HTML, CSS, JavaScript (Frontend)
- Prometheus (metrics)
- Docker

---

## 📡 API Endpoints

| Endpoint | Description |
|----------|------------|
| `/` | Web UI |
| `/health` | Health check |
| `/ready` | Readiness check |
| `/metrics` | Prometheus metrics |
| `POST /api/shorten` | Create short URL |
| `GET /api/urls` | List all URLs |
| `GET /api/urls/:code` | Get URL stats |
| `DELETE /api/urls/:code` | Delete specific URL |
| `DELETE /api/urls` | Clear all URLs |

---

## 🐳 Docker

### Build

```bash
docker build -t url-shortener-api .
# 🔗 URL Shortener API + Web App

A full-stack URL shortener application with a web interface, REST API, and built-in monitoring. This project is designed for real-world DevOps practice including containerization, observability, and Kubernetes deployment.

---

## 🚀 Features

- Shorten long URLs
- Redirect using short links
- View all URLs with click tracking
- Delete individual URLs
- Clear all URLs
- Web UI for easy interaction
- Health and readiness endpoints
- Prometheus metrics integration

---

## ⚙️ Technology Stack

- Node.js
- Express.js
- TypeScript
- HTML, CSS, JavaScript (Frontend)
- Prometheus (metrics)
- Docker

---

## 📡 API Endpoints

| Endpoint | Description |
|----------|------------|
| `/` | Web UI |
| `/health` | Health check |
| `/ready` | Readiness check |
| `/metrics` | Prometheus metrics |
| `POST /api/shorten` | Create short URL |
| `GET /api/urls` | List all URLs |
| `GET /api/urls/:code` | Get URL stats |
| `DELETE /api/urls/:code` | Delete specific URL |
| `DELETE /api/urls` | Clear all URLs |

---

## 🐳 Docker

### Build

```bash
docker build -t url-shortener-api .

docker run -p 3000:3000 url-shortener-api
```
---

## 🐳 Docker Hub Image

Pull the pre-built image:

```bash
docker pull kubealok/url-shortener-api:latest`
```
