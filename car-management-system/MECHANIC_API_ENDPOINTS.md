# Mechanic Page API Endpoints Documentation

## Base URL
`https://localhost:7092`

## Authentication
All requests require Bearer token in Authorization header. The token is automatically added by the api interceptor from localStorage.

---

## 1. GET User Schedules
**Endpoint:** `/api/MaintenanceRequest/user/{userId}/schedules`  
**Method:** GET  
**Description:** Fetches all maintenance schedules assigned to or owned by the user  
**Frontend Usage:** `Mechanic.jsx` line 145

**Response:**
```json
[
  {
    "id": "string",
    "maintenanceRequestId": "string",
    "scheduledDate": "2025-01-01T00:00:00Z",
    "reason": "string",
    "assignedMechanicId": "string",
    "assignedMechanicName": "string",
    "status": "Scheduled|In Progress|Completed|Cancelled",
    "comments": "string",
    "vehicleId": "string",
    "vehicleMake": "string",
    "vehicleModel": "string",
    "licensePlate": "string",
    "repairType": "string",
    "completedDate": "2025-01-01T00:00:00Z"
  }
]
```

---

## 2. GET Cost Deliberation Requests
**Endpoint:** `/api/MaintenanceRequest/cost-deliberation-requests/{userId}`  
**Method:** GET  
**Description:** Fetches all cost deliberation requests for a specific mechanic  
**Frontend Usage:** `Mechanic.jsx` line 170

**Response:**
```json
[
  {
    "maintenanceRequestId": "string",
    "requestTitle": "string",
    "vehicleInfo": "string",
    "requestedBy": "string",
    "status": "MechanicsSelected|Proposed|Negotiated|Accepted",
    "proposedCost": 1000.00,
    "negotiatedCost": 950.00,
    "finalCost": 950.00,
    "costDeliberationStatus": "string",
    "costDeliberationComments": "string"
  }
]
```

---

## 3. GET Progress Updates
**Endpoint:** `/api/MaintenanceRequest/{requestId}/progress-updates`  
**Method:** GET  
**Description:** Fetches all progress updates for a specific maintenance request  
**Frontend Usage:** `Mechanic.jsx` line 208

**Alternative Endpoints:**
- `/api/MaintenanceRequest/progress-updates` - Get all progress updates
- `/api/MaintenanceRequest/progress-updates/user/{userId}` - Get updates by user
- `/api/MaintenanceRequest/progress-updates/vehicle/{vehicleId}` - Get updates by vehicle
- `/api/MaintenanceRequest/progress-updates/request/{requestId}` - Get updates by request

---

## 4. POST Progress Update
**Endpoint:** `/api/MaintenanceRequest/{id}/progress-update`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Submit a progress update for a maintenance request  
**Frontend Usage:** `Mechanic.jsx` line 285

**Request Body:**
```json
{
  "expectedCompletionDate": "2025-01-01T00:00:00Z",
  "comment": "string"
}
```

---

## 5. Logistics Management Endpoints

### 5.1 GET Logistics Snapshot
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/logistics-snapshot`  
**Method:** GET  
**Description:** Get current logistics information for a schedule  
**Frontend Usage:** `Mechanic.jsx` line 302

### 5.2 POST Plan Logistics
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/plan-logistics`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Plan logistics for vehicle pickup and return  
**Frontend Usage:** `Mechanic.jsx` line 353

**Request Body:**
```json
{
  "pickupRequired": true,
  "pickupAddress": "string",
  "pickupWindowStart": "2025-01-01T00:00:00Z",
  "pickupWindowEnd": "2025-01-01T12:00:00Z",
  "returnRequired": true,
  "returnAddress": "string",
  "returnWindowStart": "2025-01-01T00:00:00Z",
  "returnWindowEnd": "2025-01-01T12:00:00Z",
  "contactName": "string",
  "contactPhone": "string",
  "notes": "string"
}
```

### 5.3 POST Vehicle Received
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/received`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Mark vehicle as received at the shop  
**Frontend Usage:** `Mechanic.jsx` line 363

**Request Body:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "note": "string"
}
```

### 5.4 POST Vehicle Pickup
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/pickup`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Mark vehicle as picked up  
**Frontend Usage:** `Mechanic.jsx` line 363

**Request Body:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "note": "string"
}
```

### 5.5 POST Work Start
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/work-start`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Mark work as started on the vehicle  
**Frontend Usage:** `Mechanic.jsx` line 363

**Request Body:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "note": "string"
}
```

### 5.6 POST Ready for Return
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/ready-for-return`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Mark vehicle as ready for return  
**Frontend Usage:** `Mechanic.jsx` line 363

**Request Body:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "note": "string"
}
```

### 5.7 POST Vehicle Returned
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule/returned`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Mark vehicle as returned to owner  
**Frontend Usage:** `Mechanic.jsx` line 363

**Request Body:**
```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "note": "string"
}
```

---

## 6. Cost Deliberation Endpoints

### 6.1 POST Propose Cost
**Endpoint:** `/api/MaintenanceRequest/{id}/cost-deliberation/propose`  
**Method:** POST  
**Query Params:** `userId={userId}`  
**Description:** Submit a cost proposal for a maintenance request  
**Frontend Usage:** `Mechanic.jsx` line 375

**Request Body:**
```json
{
  "proposedCost": 1000.00,
  "comments": "string"
}
```

### 6.2 POST Negotiate Cost
**Endpoint:** `/api/MaintenanceRequest/{id}/cost-deliberation/negotiate`  
**Method:** POST  
**Query Params:** `userId={userId}`  
**Description:** Submit a negotiated cost counter-offer  
**Frontend Usage:** `Mechanic.jsx` line 396

**Request Body:**
```json
{
  "negotiatedCost": 950.00,
  "comments": "string"
}
```

### 6.3 POST Accept Cost
**Endpoint:** `/api/MaintenanceRequest/{id}/cost-deliberation/accept`  
**Method:** POST  
**Query Params:** `userId={userId}`  
**Description:** Accept the final negotiated cost  
**Frontend Usage:** `Mechanic.jsx` line 417

**Request Body:**
```json
{
  "comments": "string"
}
```

### 6.4 GET Cost Deliberation History
**Endpoint:** `/api/MaintenanceRequest/{id}/cost-deliberation/history`  
**Method:** GET  
**Description:** Get the cost negotiation history for a request

### 6.5 GET Accepted Mechanic
**Endpoint:** `/api/MaintenanceRequest/{id}/accepted-mechanic`  
**Method:** GET  
**Description:** Get the accepted mechanic for a maintenance request

---

## 7. Complete Maintenance with Invoice
**Endpoint:** `/api/MaintenanceRequest/{id}/complete-with-invoice`  
**Method:** POST  
**Query Params:** `user={userId}`  
**Description:** Complete maintenance and submit invoice  
**Frontend Usage:** `Mechanic.jsx` line 268 (but incorrect endpoint used)

**⚠️ ISSUE FOUND:** Line 268 uses `/api/MaintenanceRequest/${selectedSchedule.id}/complete` but should use `/complete-with-invoice`

**Request Body:**
```json
{
  "Invoice": {
    "LaborHours": 5.5,
    "TotalCost": 1000.00,
    "PartsUsed": [
      {
        "PartName": "string",
        "Quantity": 1,
        "UnitPrice": 100.00
      }
    ]
  }
}
```

---

## Additional Available Endpoints (Not Currently Used)

### GET All Schedules
**Endpoint:** `/api/MaintenanceRequest/schedules`  
**Method:** GET  
**Description:** Get all maintenance schedules (admin view)

### GET Schedule by ID
**Endpoint:** `/api/MaintenanceRequest/scheduled/{id}`  
**Method:** GET  
**Description:** Get a specific schedule by ID

### POST Schedule Maintenance
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule`  
**Method:** POST  
**Description:** Create a new maintenance schedule

### PUT Update Schedule
**Endpoint:** `/api/MaintenanceRequest/{id}/schedule`  
**Method:** PUT  
**Description:** Update an existing maintenance schedule

### GET Mechanic Proposals
**Endpoint:** `/api/MaintenanceRequest/{id}/mechanic-proposals`  
**Method:** GET  
**Description:** Get all mechanic proposals for a request

### POST Accept Proposal
**Endpoint:** `/api/MaintenanceRequest/{id}/proposal/{proposalId}/accept`  
**Method:** POST  
**Description:** Accept a mechanic's proposal

### POST Reject Proposal
**Endpoint:** `/api/MaintenanceRequest/{id}/proposal/{proposalId}/reject`  
**Method:** POST  
**Description:** Reject a mechanic's proposal

---

## Issues Found in Mechanic.jsx

1. **Line 268:** Incorrect endpoint for completing maintenance
   - Current: `/api/MaintenanceRequest/${selectedSchedule.id}/complete`
   - Should be: `/api/MaintenanceRequest/${selectedSchedule.id}/complete-with-invoice`
   - Also missing invoice data in request body

2. **Missing Invoice Form:** The complete maintenance function doesn't collect invoice data

3. **Error Handling:** Some endpoints have basic error handling but could be improved with specific error messages

---

## Recommendations

1. Fix the complete maintenance endpoint
2. Add invoice form/modal for completing maintenance
3. Add loading states for all async operations
4. Improve error messages with specific feedback
5. Add retry logic for failed requests
6. Consider adding offline support with request queuing










