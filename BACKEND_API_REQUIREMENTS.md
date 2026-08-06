# Backend API Requirements

The application currently runs on mock/dummy data for two features (Notifications, Workload) and is **partially** live for the Kanban Board — see status column below. None of the "New" rows are connected to a real server yet.

- **Live** — integrated and working against the real backend today.
- **Ready** — endpoint already exists in `src/config/api.js` and the frontend code is already written for it (currently commented out). Needs a real backend implementation, then it will be enabled.
- **New** — does not exist yet. Needs to be designed together.

## Summary

| Feature | Endpoint | Method | Status |
|---|---|---|---|
| Board | Create task | `CREATE_BOARD` | **Live** |
| Board | **Get tasks (list boards)** | `GET_BOARDS_BY_RESOURCE` | **Ready — blocking, see note** |
| Board | Edit task | `UPDATE_BOARD` | Ready |
| Board | Move task (status) | `UPDATE_BOARD_STATUS` | Ready |
| Board | Delete task | `DELETE_BOARD` | Ready |
| Board | Assignee list | `RESOURCE_LIST` | Already working elsewhere — needs Board wiring |
| Board | Labels, checklist, comments, attachments, custom columns | — | New |
| Notifications | Get list | `GET_NOTIFICATIONS` | Ready |
| Notifications | Mark one read | `MARK_NOTIFICATION_READ` | Ready |
| Notifications | Mark all read | `MARK_ALL_NOTIFICATIONS_READ` | Ready |
| Notifications | Clear all | `CLEAR_ALL_NOTIFICATIONS` | Ready |
| Notifications | Delete one | `DELETE_NOTIFICATION` | Ready |
| Workload | Get workload data | `get_workload` (suggested) | New |

> **Blocking note (get tasks / list boards):** without this endpoint, a created/edited/moved card only lives in the browser's `localStorage` — it will not show up for another user or another device, and clearing browser data loses it. This is the single most important Board endpoint left.

---

## 1. Kanban Board

### Create task — `CREATE_BOARD` ✅ Live
`POST /users/create_board`

Request: `{ project_id, task_id, status, resource_id, pm_id }`

Response: `{ success, message }`

Links a card to an existing Schedule task (`task_id`, from `get_project_schedule`) — it does not take a free-text title. The response has no `board_id`, so the frontend cannot ask "what did I just create" — see the note under the next endpoint.

### Get tasks (list boards) — `GET_BOARDS_BY_RESOURCE`
`POST /users/get_BoardsByResource`

Request
```json
{ "resource_id": "string", "type": "role", "project_id": "string" }
```

Response
```json
{
  "success": true,
  "data": [
    {
      "board_id": 1,
      "task_id": 9,
      "task_name": "Research & Analysis",
      "project_name": "Website Redesign",
      "project_id": "P-2026071",
      "priority": "High",
      "due_date": "2024-07-09",
      "status": "To Do",
      "resource_id": "res-1",
      "resource_name": "Dianne Russell",
      "resource_role": "UI/UX Designer"
    }
  ]
}
```

Needed for two things: (1) showing the real list of cards on page load instead of the mock seed list, and (2) letting the frontend refetch right after `create_board` succeeds (since that response doesn't return a `board_id`) so the new card shows its real `board_id` instead of a locally-generated placeholder one.

### Edit task — `UPDATE_BOARD`
`POST /users/update_board`

Request: `{ board_id, [field]: value }`, where field is one of `title`, `priority`, `due_date`, `resource_id`, `description`.

Response: `{ success, message }`

### Move task — `UPDATE_BOARD_STATUS`
`POST /users/update_boardStatus`

Triggered on drag-and-drop or "Move to" a different column.

Request: `{ board_id, status }`

Response: `{ success, message }`

### Delete task — `DELETE_BOARD`
`POST /users/delete_board`

Request: `{ board_id }`

Response: `{ success, message }`

### Assignee list — `RESOURCE_LIST`
`GET /admin/resource_list`

Already implemented and used elsewhere in the application. No backend work needed. The response should include `id` and `name` (or `first_name` / `last_name`) for each resource.

### Labels, checklist, comments, attachments, custom columns
These currently exist only in the browser's localStorage and are not shared between users or devices. Real endpoints are needed for:

- Labels — attach/detach a label (from a shared palette) to a task
- Checklist / subtasks — add, toggle done, delete, per task
- Comments — add and list, with author and timestamp, per task
- Attachments — add/delete, link-style only (no file upload yet), per task
- Custom columns — add/rename/delete/reorder, with an optional WIP limit, per project

This is the largest gap for multi-user use and should be prioritized accordingly.

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

## 3. Workload Page

### Get workload data
No endpoint exists yet. Suggested: `POST /users/get_workload`

```json
{
  "activeProject": {
    "id": "proj-website-redesign",
    "name": "Website Redesign",
    "priority": "High",
    "methodology": "Predictive",
    "startDate": "2024-03-27",
    "progress": 35
  },
  "resources": [
    {
      "id": "res-1",
      "name": "Dianne Russell",
      "role": "UI/UX Designer",
      "projects": [
        {
          "id": "p-website-redesign",
          "name": "Website Redesign",
          "weekdayHours": [4, 4, 5, 5, 4],
          "monthly": [133, 125, 147, 170, 176, 147, 155, 162, 170, 155, 147, 133],
          "exceptions": { "6": true }
        }
      ]
    }
  ]
}
```

Field notes:
- `weekdayHours` — planned hours for Monday through Friday, per project, per resource.
- `monthly` — twelve values, one hour total per month.
- `exceptions` — month index mapped to a `true` flag (for example, a planned leave clash).

Open questions for the backend team:

1. Should `monthly` be pre-calculated by the backend, or derived from `weekdayHours` on the frontend?
2. Can daily-level hours be provided? The frontend currently approximates the daily view from `weekdayHours` with a small generated variance; real data would replace that.
3. What condition should set an `exceptions` flag on a given month?
4. Should resource list pagination (currently 5 per page, handled in the browser) move to the server?