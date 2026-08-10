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