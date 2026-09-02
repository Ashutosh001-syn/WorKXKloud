# Backend API Requirements

The application currently runs on mock/dummy data for two features (Notifications, Workload). The Kanban Board is now **mostly live** — see status column below.

- **Live** — integrated and working against the real backend today.
- **Ready** — endpoint already exists in `src/config/api.js` and the frontend code is already written for it (currently commented out). Needs a real backend implementation, then it will be enabled.
- **New** — does not exist yet. Needs to be designed together.

## Summary — Kanban Board

| # | Endpoint | Status | What's blocked without it |
|---|---|---|---|
| 1 | `CREATE_BOARD` (`create_board`) | ✅ **Live** | — |
| 2 | `GET_BOARD` (`getBoard`) | ✅ **Live** | — |
| 3 | `RESOURCE_LIST` (`resource_list`) | ✅ **Live** | — |
| 4 | `UPDATE_BOARD` (`update_board`) | ⏳ Ready, not confirmed | Editing a card's title/priority/due date/assignee doesn't save — resets on refresh |
| 5 | `UPDATE_BOARD_STATUS` (`update_boardStatus`) | ⏳ Ready, not confirmed | Dragging a card / "Move to" doesn't save — resets on refresh |
| 6 | `DELETE_BOARD` (`delete_board`) | ⏳ Ready, not confirmed | Deleting a card doesn't save — reappears on refresh |
| 7 | Priority + due date on board rows | 🆕 New (suggested field addition) | Every card shows "Medium" priority and "—" due date — the board API has neither field yet |
| 8 | Labels, checklist, comments, attachments, custom columns | 🆕 New | All local-only (browser storage), not shared between users/devices |

**Bottom line for this sprint:** create + read are done and live. Everything else on the board (edit, move, delete) still only changes what's on screen — it reverts the moment the page is refreshed, since there's nothing yet to actually save those 3 actions to the server. **#4, #5, #6 are the next priority.**

---

## 1. Kanban Board

### Create task — `CREATE_BOARD` ✅ Live
`POST /users/create_board`

Request: `{ project_id, task_id, status, resource_id, pm_id }`

Response: `{ success, message }`

Links a card to an existing Schedule task (`task_id`, from `get_project_schedule`) — it does not take a free-text title. The response has no `board_id`, so after a successful create the frontend re-calls `GET_BOARD` to pick up the real row.

### Get board — `GET_BOARD` ✅ Live
`POST /projectManager/getBoard`

Request: `{ pm_id, project_id }`

Response (confirmed live shape):
```json
{
  "success": true,
  "message": "Board data fetched successfully",
  "data": {
    "in_discussion": [],
    "to_do": [
      { "id": 10, "project_id": 4, "task_id": 2, "resource_id": 10, "status": "to_do", "pm_id": 4, "created_at": "2026-08-05T13:21:33.000Z" }
    ],
    "in_work": [],
    "in_progress": [],
    "completed": []
  }
}
```

Cards are grouped under exactly these 5 status keys — `in_discussion`, `to_do`, `in_work`, `in_progress`, `completed` — which is what `status` on `CREATE_BOARD`/`UPDATE_BOARD_STATUS` must also use. There's no "Review" status on the backend; the board's 5 default columns (In Discussion / To Do / In Work / In Progress / Completed) map 1:1 to these.

**Gap:** a row has no `task_name`, `priority`, or `due_date` — the frontend currently resolves the title by cross-referencing `task_id` against `get_project_schedule`, and shows a hardcoded "Medium" priority / "—" due date since there's no source for either. See #7 below.

### Assignee list — `RESOURCE_LIST` ✅ Live
`GET /admin/resource_list`

Already used elsewhere (Resource Master, Create Project wizard) and now wired into the Board too, for the assignee picker and for resolving `resource_id` → name on each card. Response: `{ success, data: [{ id, name, role, ... }] }`.

### Edit task — `UPDATE_BOARD` — not confirmed live
`POST /users/update_board`

Request: `{ board_id, [field]: value }`, field is one of `title`, `priority`, `due_date`, `resource_id`, `description`.

Response: `{ success, message }`

The frontend already has the UI for this (detail modal + the card's own quick-edit avatar/date icons) — it just needs this endpoint confirmed working to actually persist.

### Move task — `UPDATE_BOARD_STATUS` — not confirmed live
`POST /users/update_boardStatus`

Triggered on drag-and-drop or "Move to" a different column.

Request: `{ board_id, status }` — `status` uses the same 5 keys as `GET_BOARD` (`to_do`, `in_work`, etc.)

Response: `{ success, message }`

### Delete task — `DELETE_BOARD` — not confirmed live
`POST /users/delete_board`

Request: `{ board_id }`

Response: `{ success, message }`

### Priority + due date on board rows — suggested addition
`GET_BOARD`'s rows currently carry no `priority` or `due_date`. Two options: (a) add both fields to the board row itself (set via `CREATE_BOARD`/`UPDATE_BOARD`), or (b) confirm whether Schedule's `get_project_schedule` already has a date range per task that the board should just borrow. Until one of these exists, every card will keep showing "Medium" / "—".

### Labels, checklist, comments, attachments, custom columns — new
These currently exist only in the browser's localStorage and are not shared between users or devices. Real endpoints are needed for:

- Labels — attach/detach a label (from a shared palette) to a task
- Checklist / subtasks — add, toggle done, delete, per task
- Comments — add and list, with author and timestamp, per task
- Attachments — add/delete, link-style only (no file upload yet), per task
- Custom columns — add/rename/delete/reorder, with an optional WIP limit, per project

Lower priority than #4–6 above — this is a real gap for multi-user use but doesn't block the core "create, see, move, edit, delete a card" flow the way those three do.

---

## 2. Notifications

All five endpoints already exist in `api.js` under `/users/...`.

### Get list — `GET_NOTIFICATIONS`
`GET /users/get_notifications` (Bearer token)

```json
{
  "notifications": [
    {
      "id": "n1",
      "type": "TASK_ASSIGNED",
      "title": "Task assigned to you",
      "message": "...",
      "projectName": "Website Redesign",
      "projectId": "P-2026071",
      "time": "2 min ago",
      "read": false
    }
  ]
}
```

Currently paginated client-side, 6 per page. Server-side pagination would help once the list grows.

### Mark one read — `MARK_NOTIFICATION_READ`
`POST /users/mark_notification_read` — `{ id }`

### Mark all read — `MARK_ALL_NOTIFICATIONS_READ`
`POST /users/mark_all_notifications_read` — no body

### Clear all — `CLEAR_ALL_NOTIFICATIONS`
`DELETE /users/clear_all_notifications` — no body

### Delete one — `DELETE_NOTIFICATION`
`POST /users/delete_notification` — `{ id }`

---

## 3. Workload Page — ✅ RESOLVED, no backend endpoint needed

No new endpoint is being requested for this anymore. Confirmed logic
(2026-08-19): Workload is computed entirely client-side from two endpoints
that already exist and are already live:

- `GET /admin/resource_list` — each resource's `start_time`/`end_time`
  (shift hours) and `monday`..`sunday` working-day flags.
- `POST /admin/get_projectList` — each project's `resource_allocations`
  JSON field (allocation % + workingDays per resource per project).

Formula: `dailyAllocatedHours = (end_time − start_time) × (allocation% / 100)`.
Implemented in `src/utils/workloadCalc.js` (`aggregateWorkload`), consumed by
`src/pages/Workload/WorkloadPage.jsx`. Live-tested against real data —
e.g. a 09:00–18:00 shift (9h capacity) at 25% allocation correctly computes
2.25h/day.

See `workload.todo` in the project root for the full audit trail, the
per-resource weekly-capacity KPI logic, and remaining open product
questions (none of which block backend work — they're UI/definition
questions for whoever owns the Workload page design).

---

## 4. PMO Resource Change Requests

Full detailed specification is documented in [BACKEND_RESOURCE_CHANGE_REQUEST_API.md](./BACKEND_RESOURCE_CHANGE_REQUEST_API.md).

### Summary of Endpoints:
- `POST /admin/resource_change_requests` — List all requests with filters (Status, Priority, Search, Pagination).
- `POST /admin/resource_change_request_detail` — Get complete current vs requested allocations, PM note, attachments, and audit log.
- `POST /admin/approve_resource_change` — Approve changes and apply new allocation directly to project.
- `POST /admin/reject_resource_change` — Reject changes with mandatory reason.
- `POST /admin/clarify_resource_change` — Send query/clarification note to Project Manager.
- `POST /projectManager/create_resource_change_request` — PM side submission.

---

## 5. Project-Resource Dependent Scheduling & Security Validation

Task scheduling and assignment must strictly source from the PMO project-resource allocation (`resource_allocations`).

### 1. Get Project Assigned Resources
- **Endpoint**: `GET /api/projects/:projectId/resources` (or `POST /api/admin/get_project_resources`)
- **Headers**:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
- **Request Body** (if POST):
  ```json
  {
    "project_id": 4
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Assigned project resources fetched successfully",
    "data": [
      {
        "id": "res-101",
        "resource_id": 101,
        "name": "Dhananjay",
        "role": "Developer",
        "allocation": 100,
        "type": "In-house",
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"]
      },
      {
        "id": "res-102",
        "resource_id": 102,
        "name": "Rahul",
        "role": "UI/UX Designer",
        "allocation": 80,
        "type": "In-house",
        "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"]
      }
    ]
  }
  ```

### 2. Backend Security & Data Integrity Validation
When creating or updating schedule tasks (`/projectManager/schedule_project`, `/projectManager/subTask_schedule`, `/projectManager/editTaskScheduleProject`, `/projectManager/editSubTaskSchedule`):
1. The backend **must validate** that the submitted `resource` / `resource_id` belongs to the project's PMO allocations for `project_id`.
2. If `resource_id` is not assigned to `project_id`, reject the request with HTTP `400 Bad Request` or `403 Forbidden`:
   ```json
   {
     "success": false,
     "message": "Resource is not assigned to this project."
   }
   ```

---

## 6. Project Reallocation — 🆕 New

`POST /admin/re-allocated` — route does not exist yet (confirmed 404,
2026-08-20). Frontend call site already exists and is live-tested against
what it sends today: `src/pages/CreateProjectPage.jsx`, `handleConfirmAssignPM()`.

**Request** (multipart/form-data, not JSON):
```
id: <project_id>
pm_id: <project_id>          // ⚠️ see note below
project_manager: <string>    // the new PM's display name
status: "re-allocated"
```

**Response expected**: `{ success, message }`

⚠️ **Existing frontend bug to flag, not something backend should replicate**:
the current code sends `pm_id` as the *project's* id (`payload.append('pm_id',
String(projectId))`), not the newly-assigned PM's actual user/resource id —
this looks like a copy-paste mistake in `CreateProjectPage.jsx` rather than
an intentional contract. Backend should confirm with frontend what `pm_id`
is actually supposed to identify before building around this exact payload,
since implementing it as-is would silently reallocate to a numerically
coincidental id rather than the intended PM.

---

## 7. Update Project Milestone — 🆕 New (no frontend call site yet)

`POST /projectManager/update_project_milestone` — route does not exist yet
(confirmed 404, 2026-08-20). Unlike every other endpoint in this document,
**no frontend code calls this yet** — `API_ENDPOINTS.UPDATE_PROJECT_MILESTONE`
is defined in `src/config/api.js` but unused. The shape below is inferred
from the existing milestone schema (how milestones are created and read
elsewhere), not confirmed against a real request/response pair — treat it
as a starting proposal to align on, not a locked contract.

Milestones are created via `CreateProjectWizardModal.jsx` as part of
project creation (`milestones: [{ milestone, milestone_date, percentage }]`,
sent inside the larger `create_project` form payload) and read back the
same shape via `get_projectList`'s `milestones` array — but there is no
per-milestone `id`, which is the main open question for an update endpoint:

**Suggested request**:
```json
{
  "project_id": 33,
  "milestone": "BRD Sign-off",
  "milestone_date": "2026-08-26",
  "percentage": 100
}
```

**Open question for backend team**: without a stable milestone `id`, how
should an update target a specific milestone when a project can have
several with the same `milestone` name (e.g. two "Sign-off" milestones on
different phases)? Recommend adding an `id`/`milestone_id` column to
whatever table stores these, returned in `get_projectList`'s `milestones`
array, and required on this endpoint's request — matching how every other
"update a specific row" endpoint in this app (`UPDATE_BOARD`, etc.) keys
off a real row id rather than matching by name.

**Response expected**: `{ success, message }`