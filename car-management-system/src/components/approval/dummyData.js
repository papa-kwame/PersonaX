export const dummyRequests = [
    {
      id: "REQ-1001",
      vehicleId: "VH-2023-001",
      issueDescription: "Engine overheating and unusual noises coming from under the hood",
      urgency: "high",
      status: "pending_hr",
      createdAt: "2023-05-15T09:30:00Z",
      attachments: [],
      submittedBy: "John Smith (Driver)",
      department: "Sales",
      mileage: "45,230 miles"
    },
    {
      id: "REQ-1002",
      vehicleId: "VH-2022-015",
      issueDescription: "Brakes making grinding noise and reduced stopping power",
      urgency: "critical",
      status: "pending_mechanic",
      createdAt: "2023-05-14T14:15:00Z",
      attachments: [],
      submittedBy: "Sarah Johnson (Driver)",
      department: "Marketing",
      mileage: "38,750 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-15T10:45:00Z"
    },
    {
      id: "REQ-1003",
      vehicleId: "VH-2021-008",
      issueDescription: "AC not cooling properly and strange odor when turned on",
      urgency: "medium",
      status: "pending_finance",
      createdAt: "2023-05-12T11:20:00Z",
      attachments: [],
      submittedBy: "Robert Chen (Driver)",
      department: "Operations",
      mileage: "52,100 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-12T15:30:00Z",
      quote: {
        laborCost: 350,
        partsCost: 225,
        totalCost: 575,
        estimatedTime: "3 hours",
        notes: "Need to replace AC compressor and recharge system",
        submittedBy: "AutoCare Center",
        submittedAt: "2023-05-13T16:45:00Z"
      }
    },
    {
      id: "REQ-1004",
      vehicleId: "VH-2023-005",
      issueDescription: "Transmission slipping between 2nd and 3rd gear",
      urgency: "high",
      status: "pending_manager",
      createdAt: "2023-05-10T08:45:00Z",
      attachments: [],
      submittedBy: "Emily Wilson (Driver)",
      department: "Executive",
      mileage: "12,450 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-10T11:20:00Z",
      quote: {
        laborCost: 1200,
        partsCost: 850,
        totalCost: 2050,
        estimatedTime: "2 days",
        notes: "Complete transmission fluid flush and possible solenoid replacement",
        submittedBy: "Precision Transmissions",
        submittedAt: "2023-05-11T14:15:00Z"
      },
      financeReview: {
        reviewedBy: "Lisa Wong",
        reviewedAt: "2023-05-12T09:30:00Z",
        notes: "Within budget allocation for Q2 vehicle maintenance"
      }
    },
    {
      id: "REQ-1005",
      vehicleId: "VH-2020-012",
      issueDescription: "Check engine light on with code P0171 (System too lean)",
      urgency: "medium",
      status: "approved",
      createdAt: "2023-05-08T13:10:00Z",
      attachments: [],
      submittedBy: "David Miller (Driver)",
      department: "IT",
      mileage: "68,900 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-08T16:45:00Z",
      quote: {
        laborCost: 280,
        partsCost: 150,
        totalCost: 430,
        estimatedTime: "4 hours",
        notes: "Replace oxygen sensor and clean MAF sensor",
        submittedBy: "QuickFix Auto",
        submittedAt: "2023-05-09T10:30:00Z"
      },
      financeReview: {
        reviewedBy: "Lisa Wong",
        reviewedAt: "2023-05-09T14:00:00Z",
        notes: "Approved - standard maintenance cost"
      },
      managerApproval: {
        approvedBy: "James Wilson",
        approvedAt: "2023-05-10T09:15:00Z",
        notes: "Proceed with repairs"
      }
    },
    {
      id: "REQ-1006",
      vehicleId: "VH-2022-003",
      issueDescription: "Front right tire has slow leak and needs replacement",
      urgency: "low",
      status: "in_progress",
      createdAt: "2023-05-05T10:20:00Z",
      attachments: [],
      submittedBy: "Jennifer Lee (Driver)",
      department: "HR",
      mileage: "23,450 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-05T14:30:00Z",
      quote: {
        laborCost: 50,
        partsCost: 180,
        totalCost: 230,
        estimatedTime: "1 hour",
        notes: "Replace with same model tire (Michelin Primacy 215/55R17)",
        submittedBy: "Tire Masters",
        submittedAt: "2023-05-06T11:45:00Z"
      },
      financeReview: {
        reviewedBy: "Lisa Wong",
        reviewedAt: "2023-05-08T10:15:00Z",
        notes: "Approved - tire replacement fund"
      },
      managerApproval: {
        approvedBy: "James Wilson",
        approvedAt: "2023-05-08T15:30:00Z",
        notes: "Safety issue - approve immediately"
      },
      workStartedAt: "2023-05-09T08:00:00Z",
      assignedMechanic: "Tony's Auto Repair"
    },
    {
      id: "REQ-1007",
      vehicleId: "VH-2021-007",
      issueDescription: "Complete exterior detailing and interior deep cleaning",
      urgency: "low",
      status: "completed",
      createdAt: "2023-05-01T09:15:00Z",
      attachments: [],
      submittedBy: "Mark Taylor (Driver)",
      department: "Finance",
      mileage: "34,200 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-01T11:45:00Z",
      quote: {
        laborCost: 120,
        partsCost: 30,
        totalCost: 150,
        estimatedTime: "3 hours",
        notes: "Full exterior wash, wax, and interior shampoo",
        submittedBy: "Sparkle Auto Detailing",
        submittedAt: "2023-05-02T10:00:00Z"
      },
      financeReview: {
        reviewedBy: "Lisa Wong",
        reviewedAt: "2023-05-03T09:30:00Z",
        notes: "Approved - quarterly cleaning budget"
      },
      managerApproval: {
        approvedBy: "James Wilson",
        approvedAt: "2023-05-03T14:15:00Z",
        notes: "Client-facing vehicle needs to look professional"
      },
      workStartedAt: "2023-05-04T09:00:00Z",
      workCompletedAt: "2023-05-04T12:30:00Z",
      assignedMechanic: "Sparkle Auto Detailing",
      finalCost: 150,
      completionNotes: "Vehicle looks brand new. Customer very satisfied."
    },
    {
      id: "REQ-1008",
      vehicleId: "VH-2023-002",
      issueDescription: "Windshield has large crack obstructing driver view",
      urgency: "high",
      status: "rejected",
      createdAt: "2023-04-28T15:30:00Z",
      attachments: [],
      submittedBy: "Alex Rodriguez (Driver)",
      department: "Sales",
      mileage: "8,750 miles",
      rejectionReason: "This repair is covered under insurance. Please file a claim first.",
      rejectedBy: "Michael Brown",
      rejectedAt: "2023-04-29T10:15:00Z"
    },
    {
      id: "REQ-1009",
      vehicleId: "VH-2022-010",
      issueDescription: "Oil leak from rear main seal, needs replacement",
      urgency: "high",
      status: "pending_mechanic",
      createdAt: "2023-05-16T08:15:00Z",
      attachments: [],
      submittedBy: "Thomas Wilson (Driver)",
      department: "Operations",
      mileage: "56,320 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-16T10:30:00Z"
    },
    {
      id: "REQ-1010",
      vehicleId: "VH-2023-004",
      issueDescription: "Suspension noise when going over bumps",
      urgency: "medium",
      status: "in_progress",
      createdAt: "2023-05-14T13:45:00Z",
      attachments: [],
      submittedBy: "Lisa Park (Driver)",
      department: "Marketing",
      mileage: "14,780 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-14T16:20:00Z",
      quote: {
        laborCost: 420,
        partsCost: 380,
        totalCost: 800,
        estimatedTime: "1 day",
        notes: "Replace front struts and bushings",
        submittedBy: "Auto Repair Center",
        submittedAt: "2023-05-15T11:15:00Z"
      },
      financeReview: {
        reviewedBy: "Lisa Wong",
        reviewedAt: "2023-05-15T14:45:00Z",
        notes: "Approved - suspension repair budget"
      },
      managerApproval: {
        approvedBy: "James Wilson",
        approvedAt: "2023-05-16T09:30:00Z",
        notes: "Safety critical repair"
      },
      workStartedAt: "2023-05-16T10:00:00Z",
      assignedMechanic: "Auto Repair Center"
    },
    {
      id: "REQ-1011",
      vehicleId: "VH-2021-009",
      issueDescription: "Replace brake pads and rotors all around",
      urgency: "medium",
      status: "completed",
      createdAt: "2023-05-10T09:30:00Z",
      attachments: [],
      submittedBy: "David Kim (Driver)",
      department: "IT",
      mileage: "48,560 miles",
      hrApprovedBy: "Michael Brown",
      hrApprovedAt: "2023-05-10T11:45:00Z",
      quote: {
        laborCost: 280,
        partsCost: 320,
        totalCost: 600,
        estimatedTime: "4 hours",
        notes: "Premium ceramic brake pads and coated rotors",
        submittedBy: "Auto Repair Center",
        submittedAt: "2023-05-11T10:15:00Z"
      },
      financeReview: {
        reviewedBy: "Lisa Wong",
        reviewedAt: "2023-05-11T14:30:00Z",
        notes: "Approved - standard maintenance"
      },
      managerApproval: {
        approvedBy: "James Wilson",
        approvedAt: "2023-05-12T08:45:00Z",
        notes: "Proceed with repair"
      },
      workStartedAt: "2023-05-12T09:00:00Z",
      workCompletedAt: "2023-05-12T13:30:00Z",
      assignedMechanic: "Auto Repair Center",
      finalCost: 600,
      completionNotes: "Completed brake job. Test driven and verified no noises. Brakes feel excellent."
    }
  ];
  
  export const departments = [
    "Sales", "Marketing", "Operations", "IT", "HR", "Finance", "Executive"
  ];
  
  export const urgencyLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical (Vehicle Undrivable)" }
  ];