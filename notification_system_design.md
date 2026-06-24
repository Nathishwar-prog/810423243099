# Campus Notification System Design Document

This design document outlines the system architecture, database schema, scaling strategies, and algorithms required to support a large-scale, real-time Campus Notification System.

---

## Stage 1: REST API Design

To provide a clean contract between the frontend dashboard and backend services, we define a standard RESTful API surface. All endpoints return JSON payloads and standard HTTP status codes.

### 1. List Notifications
* **Endpoint**: `GET /notifications`
* **Query Parameters**:
  * `page` (integer, default: 1) - Page number for pagination.
  * `limit` (integer, default: 10) - Number of items per page.
  * `type` (string, optional) - Filter by category (`Event`, `Result`, `Placement`).
  * `priority` (string, optional) - Filter by level (`High`, `Medium`, `Low`).
  * `isPriorityInbox` (boolean, optional) - If true, returns only high-priority alerts.
* **Success Response (200 OK)**:
  ```json
  {
    "notifications": [
      {
        "id": "101",
        "type": "Placement",
        "title": "TCS Off-Campus Drive 2026",
        "message": "TCS has announced registrations for Ninja profiles. Registrations close by Friday.",
        "timestamp": "2026-06-24T10:00:00Z",
        "read": false,
        "priority": "High"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 48,
      "limit": 10
    }
  }
  ```

### 2. Create Notification
* **Endpoint**: `POST /notifications`
* **Request Body**:
  ```json
  {
    "type": "Placement",
    "title": "Google Placement Talk",
    "message": "Join us tomorrow at 2:00 PM in the auditorium.",
    "priority": "High"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": "102",
    "type": "Placement",
    "title": "Google Placement Talk",
    "message": "Join us tomorrow at 2:00 PM in the auditorium.",
    "timestamp": "2026-06-24T12:00:00Z",
    "read": false,
    "priority": "High"
  }
  ```

### 3. Retrieve Single Notification
* **Endpoint**: `GET /notifications/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "id": "101",
    "type": "Placement",
    "title": "TCS Off-Campus Drive 2026",
    "message": "TCS has announced registrations for Ninja profiles. Registrations close by Friday.",
    "timestamp": "2026-06-24T10:00:00Z",
    "read": false,
    "priority": "High"
  }
  ```
* **Error Response (404 Not Found)**:
  ```json
  { "message": "Notification with id 101 not found" }
  ```

### 4. Mark Notification as Read
* **Endpoint**: `PATCH /notifications/:id/read`
* **Success Response (200 OK)**:
  ```json
  {
    "id": "101",
    "read": true
  }
  ```

### 5. Delete Notification
* **Endpoint**: `DELETE /notifications/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "id": "101",
    "success": true
  }
  ```

---

## Stage 2: Database Design

To handle multi-recipient academic broadcasts efficiently, we separate raw **notifications** (the content) from **user delivery states** (whether a specific user has read/deleted the notification).

```
  +--------------+          +-------------------------+          +--------------+
  |    users     |          |   user_notifications    |          | notifications|
  +--------------+          +-------------------------+          +--------------+
  | id (PK)      |<--------| user_id (FK, PK)        |    +----| id (PK)      |
  | name         |          | notification_id (FK, PK)|<---+    | title        |
  | email        |          | read (boolean)          |         | message      |
  | roll_no      |          | deleted (boolean)       |         | type         |
  +--------------+          | delivered_at (timestamp)|         | priority     |
                            +-------------------------+         | created_at   |
                                                                +--------------+
```

### SQL Table Schema

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Notifications Table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Event', 'Result', 'Placement')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Notification Delivery Junction Table
CREATE TABLE user_notifications (
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    notification_id VARCHAR(50) REFERENCES notifications(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, notification_id)
);
```

---

## Stage 3: Query Optimization Analysis

In a campus ecosystem with 20,000+ students, loading notifications must be near-instantaneous. The most frequent query is fetching a student's paginated, filtered, chronological inbox.

### Primary Query
```sql
SELECT n.id, n.title, n.message, n.type, n.priority, n.created_at, un.read
FROM user_notifications un
JOIN notifications n ON un.notification_id = n.id
WHERE un.user_id = 'user_999'
  AND un.deleted = FALSE
  AND n.type = 'Placement' -- Optional Filter
ORDER BY n.created_at DESC
LIMIT 10 OFFSET 0;
```

### Indexing Strategy
To optimize this JOIN query, we construct the following indexes:

1. **Junction Index**:
   ```sql
   CREATE INDEX idx_user_notifications_query 
   ON user_notifications(user_id, deleted, read, notification_id);
   ```
   * **Why**: This forms a covering index that allows the database engine to quickly filter out deleted items for a specific student without looking up the table row data initially.

2. **Cron Sort Index**:
   ```sql
   CREATE INDEX idx_notifications_filter_sort 
   ON notifications(created_at DESC, type, priority);
   ```
   * **Why**: Avoids "file-sort" operations by matching the sorting requirements of the chronological inbox directly in the index b-tree structure.

---

## Stage 4: Scalability Strategy

To handle high traffic bursts (e.g., when semester exam results are released), we employ the following scalability layers:

1. **Database Read Replicas**:
   * Direct 90% of dashboard read traffic (`GET /notifications`) to read replicas, preserving the primary write database for mutations (`POST /notifications` and `PATCH /notifications/:id/read`).
2. **Redis Cache Layer**:
   * **Unread Counter Cache**: Store pre-calculated unread notifications count in Redis under the key `user:unread_count:{user_id}`. Increment/decrement this counter atomically during mutations.
   * **Page 1 Cache**: Cache the first page of notifications for active users in Redis. Invalidate this cache when a new notification is posted.
3. **Database Sharding**:
   * Shard the `user_notifications` table across database instances using a hash of the `user_id`. This distributes user specific inbox tables evenly.

---

## Stage 5: Large-Scale Notification Delivery Design

When a campus coordinator publishes a "Placement Alert" to all 20,000 students, writing 20,000 rows to the database synchronously causes API timeouts. We solve this using a distributed messaging queue system:

```
  [Coordinator UI]
         | (POST /notifications)
         v
  [Broadcast Service]
         |
         +--> Publishes event to [Kafka Topic: "notifications-outbox"]
                                       |
       +-------------------------------+-------------------------------+
       v                               v                               v
[Delivery Worker 1]             [Delivery Worker 2]             [Delivery Worker 3]
       |                               |                               |
       +------- Write rows in batches of 1,000 to Database ------------+
                                       |
                                       v
                             [user_notifications DB]
                                       |
                       +---------------+---------------+
                       v                               v
             [WebSocket Server]             [Push Notification Gateway]
                       |                               |
              (Real-time Banner)               (Mobile Toast)
```

1. **Kafka Outbox Pattern**: The publish action writes once to the `notifications` table, publishes a message to a RabbitMQ/Kafka queue, and returns success to the teacher instantly.
2. **Batch Delivery Workers**: Background workers pull from the queue and write rows to `user_notifications` in batches of 1,000.
3. **Real-time Push**: Once row insertion completes, workers publish to a WebSocket server cluster, notifying active browsers to pull updates in real-time.

---

## Stage 6: Priority Inbox Algorithm

The Priority Inbox segregates high-importance alerts from standard student communications. 

### Importance Scoring Model
Each notification receives an initial score $S$ calculated as:

$$S = W_{sender} \times W_{category} - \lambda(T_{now} - T_{created})$$

Where:
* **$W_{sender}$ (Sender Weight)**: Chancellor/Dean = 10, Department Head = 7, Student Club Lead = 2.
* **$W_{category}$ (Category Weight)**: Exam Results = 5, Placement Drive = 4, Course Syllabus = 3, Social Event = 1.
* **$\lambda$ (Decay Factor)**: Exponential time decay to ensure old notifications drop out of priority views over time.
* **Urgent Flag**: Any notification containing keywords like `URGENT`, `MANDATORY`, `DEADLINE EXTENDED`, or explicitly marked `priority="High"` bypasses scoring thresholds and enters the Priority Inbox immediately.

---

## Stage 7: Frontend Architecture

The frontend is built on **React** combined with **Material UI (MUI)**.

* **State Layer**: Managed via a custom hook `useNotifications.ts`, which coordinates request states, paging offsets, active filters, and logs operations.
* **Telemetry**: Integrated with the custom logging service, sending event packages directly to the evaluation telemetry receiver.
* **Responsive Layout**: Designed using MUI's `<Grid>`, `<Container>`, and CSS flex columns to render cleanly on both mobile viewports and large desktop monitors.
