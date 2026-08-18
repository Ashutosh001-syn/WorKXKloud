# PMO Resource Change Request — Backend API Requirements & Specification

This document provides the complete API contracts, request/response payloads, database schema recommendations, and error handling guidelines required by the backend development team to integrate the **PMO Resource Change Request** module.

---

## 📌 Summary of Required Endpoints

| # | Action | HTTP Method | Endpoint | Authorization | Description |
|---|---|---|---|---|---|
| **1** | **List All Requests** | `GET` / `POST` | `/api/admin/resource_change_requests` | PMO / Admin Bearer Token | Returns all submitted resource change requests with filters & pagination. |
| **2** | **Get Request Details** | `POST` | `/api/admin/resource_change_request_detail` | PMO / Admin Bearer Token | Returns complete details of a specific request (allocations, PM note, attachments, activity log). |
| **3** | **Approve Request** | `POST` | `/api/admin/approve_resource_change` | PMO / Admin Bearer Token | Approves the change request and immediately applies the new resource allocation to the project. |
| **4** | **Reject Request** | `POST` | `/api/admin/reject_resource_change` | PMO / Admin Bearer Token | Rejects the change request with mandatory rejection reason. |
| **5** | **Ask for Clarification** | `POST` | `/api/admin/clarify_resource_change` | PMO / Admin Bearer Token | Sends a query/clarification note back to the Project Manager. |
| **6** | **Submit Request (PM Side)** | `POST` | `/api/projectManager/create_resource_change_request` | PM Bearer Token | Submits a new resource change request from PM workspace to PMO queue. |

---

## 🚀 Detailed API Specifications

### 1. List All Resource Change Requests
- **Endpoint**: `POST /api/admin/resource_change_requests` (or `GET`)
- **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
- **Request Body** (Optional filters & pagination):
  ```json
  {
    "status": "Pending PMO Review", // "All" | "Pending PMO Review" | "Approved" | "Rejected" | "Clarification Requested"
    "priority": "High", // "All" | "High" | "Medium" | "Low"
    "search": "Website Redesign", // searches request_id, project_name, pm_name
    "page": 1,
    "limit": 10
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Resource change requests retrieved successfully",
    "data": {
      "summary": {
        "total": 12,
        "pending": 3,
        "approved": 7,
        "rejected": 2
      },
      "requests": [
        {
          "id": "RCR-2026001",
          "project_id": "PJ-2026001",
          "project_name": "Website Redesign",
          "project_manager": "Ankit Sharma",
          "department": "IT",
          "priority": "High",
          "status": "Pending PMO Review",
          "due_date": "2026-06-30",
          "requested_on": "2025-05-31T11:30:00.000Z",
          "resources_added_count": 2,
          "resources_removed_count": 1,
          "resources_unchanged_count": 2
        }
      ],
      "pagination": {
        "current_page": 1,
        "total_pages": 2,
        "total_records": 12
      }
    }
  }
  ```

---

### 2. Get Request Details
- **Endpoint**: `POST /api/admin/resource_change_request_detail`
- **Request Body**:
  ```json
  {
    "request_id": "RCR-2026001"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Request details fetched successfully",
    "data": {
      "id": "RCR-2026001",
      "status": "Pending PMO Review",
      "priority": "High",
      "department": "IT",
      "requested_on": "2025-05-31T11:30:00.000Z",
      
      "project": {
        "id": "PJ-2026001",
        "name": "Website Redesign",
        "project_manager": "Ankit Sharma",
        "start_date": "2025-01-15",
        "due_date": "2026-06-30",
        "duration": "180 days",
        "budget": 1850000,
        "billing_type": "Fixed Price Milestone",
        "methodology": "Agile Scrum",
        "technology": "React 19, Tailwind CSS, Node.js, PostgreSQL",
        "scope": "Complete redesign of corporate client portal, incorporating multi-tenant dashboards, high-speed reporting, and role-based permissions."
      },

      "client": {
        "name": "Acme Cloud Solutions Inc.",
        "code": "CL-8802",
        "contact_person": "David Miller",
        "role": "VP of Engineering",
        "email": "david.miller@acmecloud.com",
        "phone": "+1 (555) 349-2810",
        "address": "450 Mission St, Suite 1200, San Francisco, CA 94105",
        "timezone": "PST (UTC-8)"
      },

      "request_summary": "PM has requested changes in the resource allocation for better project execution.",
      "pm_reason": "Ravi is overloaded in another critical project. Need Aman for UI development. Also need one additional QA resource.",
      "pm_note": "Ravi Sharma is currently allocated to another high priority project and will not be able to meet the timelines. Requesting to replace with Aman Singh who is available and experienced in similar projects. Also requesting one additional QA resource to improve testing coverage.",

      "current_allocation": [
        {
          "sr_no": 1,
          "resource_id": 101,
          "resource_name": "Ravi Sharma",
          "role": "UI Developer",
          "allocation": 100,
          "working_days": ["M", "T", "W", "T", "F"]
        },
        {
          "sr_no": 2,
          "resource_id": 102,
          "resource_name": "Sagar Patel",
          "role": "Backend Developer",
          "allocation": 100,
          "working_days": ["M", "T", "W", "T", "F"]
        },
        {
          "sr_no": 3,
          "resource_id": 103,
          "resource_name": "Anita Verma",
          "role": "QA Engineer",
          "allocation": 70,
          "working_days": ["M", "T", "W", "T", "F"]
        }
      ],

      "requested_allocation": [
        {
          "sr_no": 1,
          "resource_id": 104,
          "resource_name": "Aman Singh",
          "role": "UI Developer",
          "allocation": 100,
          "working_days": ["M", "T", "W", "T", "F"],
          "change": "Added"
        },
        {
          "sr_no": 2,
          "resource_id": 102,
          "resource_name": "Sagar Patel",
          "role": "Backend Developer",
          "allocation": 100,
          "working_days": ["M", "T", "W", "T", "F"],
          "change": "Unchanged"
        },
        {
          "sr_no": 3,
          "resource_id": 103,
          "resource_name": "Anita Verma",
          "role": "QA Engineer",
          "allocation": 70,
          "working_days": ["M", "T", "W", "T", "F"],
          "change": "Unchanged"
        },
        {
          "sr_no": 4,
          "resource_id": null,
          "resource_name": "New QA Resource",
          "role": "QA Engineer",
          "allocation": 50,
          "working_days": ["M", "T", "W", "T", "F"],
          "change": "Added"
        }
      ],

      "attachments": [
        {
          "id": 1,
          "name": "Resource_Justification.pdf",
          "size": "245 KB",
          "url": "https://cdn.workxkloud.com/attachments/Resource_Justification.pdf",
          "uploaded_at": "2025-05-31T11:25:00.000Z"
        }
      ],

      "payment_milestones": [
        {
          "id": 1,
          "milestone": "UI/UX Design System & Architectural Blueprint",
          "percentage": 20,
          "amount": 370000,
          "status": "Completed",
          "due_date": "2025-02-28"
        },
        {
          "id": 2,
          "milestone": "Core Frontend Modules & Authentication Integration",
          "percentage": 30,
          "amount": 555000,
          "status": "In Progress",
          "due_date": "2025-07-15"
        }
      ],

      "activity_log": [
        {
          "id": 1,
          "timestamp": "2025-05-31T11:30:00.000Z",
          "author": "Ankit Sharma (Project Manager)",
          "action": "Resource Change Request Submitted",
          "details": "Requested replacement of Ravi Sharma with Aman Singh and added 1 QA resource (50% allocation)."
        }
      ]
    }
  }
  ```

---

### 3. Approve Resource Change Request
- **Endpoint**: `POST /api/admin/approve_resource_change`
- **Request Body**:
  ```json
  {
    "request_id": "RCR-2026001",
    "pmo_id": 1,
    "pmo_remarks": "Approved. Aman Singh is assigned to Website Redesign."
  }
  ```
- **Backend Business Logic**:
  1. Update `resource_change_requests.status` = `'Approved'`.
  2. Apply the requested staffing allocation to the project's active `resource_allocations` table/JSON.
  3. Release unassigned/replaced resources back to organization availability.
  4. Log entry in `resource_change_activity_logs`.
  5. Trigger notification to the Project Manager (`Ankit Sharma`).
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Resource change request approved and project allocation updated successfully",
    "data": {
      "request_id": "RCR-2026001",
      "status": "Approved",
      "updated_at": "2025-05-31T12:00:00.000Z"
    }
  }
  ```

---

### 4. Reject Resource Change Request
- **Endpoint**: `POST /api/admin/reject_resource_change`
- **Request Body**:
  ```json
  {
    "request_id": "RCR-2026001",
    "pmo_id": 1,
    "rejection_reason": "Aman Singh is currently committed to Project PJ-2026045 until next sprint."
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Resource change request has been rejected",
    "data": {
      "request_id": "RCR-2026001",
      "status": "Rejected",
      "rejection_reason": "Aman Singh is currently committed to Project PJ-2026045 until next sprint."
    }
  }
  ```

---

### 5. Ask for Clarification
- **Endpoint**: `POST /api/admin/clarify_resource_change`
- **Request Body**:
  ```json
  {
    "request_id": "RCR-2026001",
    "pmo_id": 1,
    "clarification_query": "Can you specify the exact dates for which the additional 50% QA resource is needed?"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Clarification requested and notification sent to PM",
    "data": {
      "request_id": "RCR-2026001",
      "status": "Clarification Requested",
      "query": "Can you specify the exact dates for which the additional 50% QA resource is needed?"
    }
  }
  ```

---

## 🗄️ Database Schema Design (Recommended)

### Table: `resource_change_requests`
```sql
CREATE TABLE resource_change_requests (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'RCR-2026001'
    project_id VARCHAR(50) NOT NULL,
    pm_id INT NOT NULL,
    department VARCHAR(100),
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    status ENUM('Pending PMO Review', 'Approved', 'Rejected', 'Clarification Requested') DEFAULT 'Pending PMO Review',
    request_summary TEXT,
    reason_by_pm TEXT,
    pm_request_note TEXT,
    rejection_reason TEXT,
    pmo_remarks TEXT,
    pmo_id INT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: `resource_change_items`
```sql
CREATE TABLE resource_change_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL,
    resource_id INT NULL,
    resource_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    allocation_percentage INT NOT NULL,
    working_days JSON NOT NULL, -- e.g. ["M", "T", "W", "T", "F"]
    change_type ENUM('Added', 'Removed', 'Modified', 'Unchanged') NOT NULL,
    is_requested BOOLEAN DEFAULT TRUE, -- TRUE = Requested side, FALSE = Current side
    FOREIGN KEY (request_id) REFERENCES resource_change_requests(id) ON DELETE CASCADE
);
```

### Table: `resource_change_attachments`
```sql
CREATE TABLE resource_change_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES resource_change_requests(id) ON DELETE CASCADE
);
```

### Table: `resource_change_activity_logs`
```sql
CREATE TABLE resource_change_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL,
    author_id INT NULL,
    author_name VARCHAR(150) NOT NULL,
    action VARCHAR(150) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES resource_change_requests(id) ON DELETE CASCADE
);
```

---

## 🛡️ Error Code Matrix

| HTTP Status | Error Code | Example Message |
|---|---|---|
| `400 Bad Request` | `MISSING_REQUIRED_FIELDS` | `"Rejection reason is required to reject a change request."` |
| `401 Unauthorized` | `INVALID_TOKEN` | `"Session expired or token is invalid."` |
| `403 Forbidden` | `INSUFFICIENT_PERMISSIONS` | `"Only PMO / Admin roles can approve or reject resource change requests."` |
| `404 Not Found` | `REQUEST_NOT_FOUND` | `"Change request RCR-2026001 does not exist."` |
| `409 Conflict` | `ALREADY_DECIDED` | `"This change request has already been approved."` |
| `500 Server Error` | `INTERNAL_SERVER_ERROR` | `"An unexpected error occurred while processing resource change request."` |

---

## 🔄 Frontend Configuration Mapping
The frontend is already configured to consume these exact routes via `src/config/api.js`:
- `API_ENDPOINTS.GET_RESOURCE_CHANGE_REQUESTS`
- `API_ENDPOINTS.GET_RESOURCE_CHANGE_REQUEST_DETAIL`
- `API_ENDPOINTS.APPROVE_RESOURCE_CHANGE_REQUEST`
- `API_ENDPOINTS.REJECT_RESOURCE_CHANGE_REQUEST`
- `API_ENDPOINTS.CLARIFY_RESOURCE_CHANGE_REQUEST`

Once the backend implements the above endpoints, the application can switch from localStorage mock persistence to live server data seamlessly.
