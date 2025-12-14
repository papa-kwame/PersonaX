# 🎯 Cost Deliberation System - Frontend Implementation Guide

## 📋 Overview

The cost deliberation system allows mechanics and reviewers to negotiate costs for maintenance requests during the **Review stage** only. This system provides a structured workflow for cost proposals, negotiations, and final agreements.

## 🚀 How to Use the Cost Deliberation System

### **1. Accessing Cost Deliberation**

#### **From Request Cards:**
- In the **"My Pending Actions"** tab, look for requests in the **Review stage**
- You'll see either:
  - A **"Cost" button** (if no deliberation has started)
  - A **Cost Deliberation Badge** (if deliberation is in progress)

#### **From Request Details:**
- Click on any maintenance request to open details
- In the **Financial Information** section, you'll see:
  - Current estimated cost
  - Cost deliberation badge (if active)
  - "Start Cost Deliberation" button (if in Review stage)

### **2. Cost Deliberation Workflow**

#### **Step 1: Propose Cost (Mechanic)**
1. Click the **"Cost" button** or **"Start Cost Deliberation"**
2. Enter your **proposed cost** in the dollar field
3. Add **comments** explaining the cost breakdown
4. Click **"Propose Cost"**
5. Status changes to **"Cost Proposed"**

#### **Step 2: Negotiate Cost (Reviewer)**
1. When a cost is proposed, reviewers can **negotiate**
2. Enter a **negotiated cost** (usually lower)
3. Add **comments** explaining the negotiation reasoning
4. Click **"Negotiate Cost"**
5. Status changes to **"Cost Negotiating"**

#### **Step 3: Finalize Cost (Any Party)**
1. Once negotiation is complete, **finalize the cost**
2. Enter the **final agreed cost**
3. Add **final agreement comments**
4. Click **"Finalize Cost"**
5. Status changes to **"Cost Agreed"**
6. The **estimated cost** is automatically updated for the rest of the process

### **3. Visual Indicators**

#### **Cost Deliberation Badge Colors:**
- 🔵 **Blue (Primary)**: Cost Proposed
- 🟡 **Yellow (Warning)**: Cost Negotiating  
- 🟢 **Green (Success)**: Cost Agreed

#### **Badge Information:**
- Shows current status
- Displays the most recent cost amount
- Clickable when in Review stage

### **4. Notifications**

#### **Email Notifications:**
- **Cost Proposed**: Reviewers get notified
- **Cost Negotiated**: Mechanics get notified
- **Cost Finalized**: All parties get notified

#### **In-App Notifications:**
- Real-time notifications via SignalR
- Appears in the notification tray
- Shows cost amounts and status changes

### **5. API Endpoints Used**

#### **Get Cost Deliberation Status:**
```javascript
GET /api/MaintenanceRequest/{id}/cost-deliberation
```

#### **Update Cost Deliberation:**
```javascript
POST /api/MaintenanceRequest/{id}/process-stage?userId={userId}
```

**Payload Examples:**

**Propose Cost:**
```json
{
  "comments": "Initial assessment",
  "proposedCost": 1500.00,
  "costDeliberationComments": "Based on parts and labor required"
}
```

**Negotiate Cost:**
```json
{
  "comments": "Budget review",
  "negotiatedCost": 1200.00,
  "costDeliberationComments": "Budget constraints require reduction"
}
```

**Finalize Cost:**
```json
{
  "comments": "Agreement reached",
  "finalCost": 1350.00,
  "costDeliberationComments": "Final agreed amount"
}
```

### **6. Database Fields**

The system tracks these fields in the `MaintenanceRequest` table:

- `ProposedCost` - Mechanic's proposed cost
- `NegotiatedCost` - Reviewer's counter-offer
- `FinalCost` - Agreed final cost
- `CostDeliberationStatus` - Current status
- `CostDeliberationComments` - Comments during deliberation
- `CostProposedDate` - When cost was first proposed
- `CostNegotiatedDate` - When cost was negotiated
- `CostFinalizedDate` - When cost was finalized
- `CostProposedByUserId` - Who proposed the cost
- `CostNegotiatedByUserId` - Who negotiated the cost
- `CostFinalizedByUserId` - Who finalized the cost

### **7. Validation Rules**

#### **Stage Restriction:**
- Cost deliberation only works in **Review stage**
- Other stages show the badge but don't allow interaction

#### **Workflow Validation:**
- **Propose**: Only when no cost is proposed or status is "Proposed"
- **Negotiate**: Only when there's already a proposed cost
- **Finalize**: Only when there's been negotiation or direct agreement

#### **Cost Validation:**
- All costs must be positive numbers
- Costs are stored as decimal values
- Currency formatting is handled in the frontend

### **8. Error Handling**

#### **Common Errors:**
- **"Cost deliberation is only available during the Review stage"**
- **"Failed to update cost deliberation"**
- **"Failed to load cost deliberation data"**

#### **Troubleshooting:**
1. Ensure you're in the Review stage
2. Check your permissions for the request
3. Verify the request exists and is active
4. Check network connectivity

### **9. Best Practices**

#### **For Mechanics:**
- Provide detailed cost breakdowns in comments
- Justify parts and labor costs
- Be realistic with initial proposals

#### **For Reviewers:**
- Consider budget constraints
- Provide clear reasoning for negotiations
- Be fair in counter-offers

#### **For All Parties:**
- Communicate clearly in comments
- Respond promptly to cost proposals
- Document agreement reasons

### **10. Integration Points**

#### **With Existing Workflow:**
- Integrates seamlessly with existing `ProcessRequestStage` endpoint
- Uses existing notification system
- Follows current authentication patterns

#### **With Frontend Components:**
- Uses existing Material-UI components
- Follows current styling patterns
- Integrates with existing state management

## 🎉 Summary

The cost deliberation system provides a structured, user-friendly way to handle cost negotiations for maintenance requests. It ensures transparency, proper documentation, and smooth workflow integration while maintaining the existing system's architecture and patterns.






























