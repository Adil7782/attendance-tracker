import {
  Airplay,
  AlignHorizontalDistributeCenter,
  BarChart3,
  BarChartHorizontal,
  Blocks,
  Cable,
  Cog,
  FileCog,
  FileSpreadsheet,
  icons,
  LayoutDashboard,
  LayoutPanelTop,
  Mail,
  PlusSquare,
  ScissorsLineDashed,
  Send,
  ServerCog,
  Settings,
  Sliders,
  Table,
  UserRoundCog,
  TableProperties,
  UserRoundPlus,
  LineChart,
  LocateFixed,
  QrCode,
  UserRound,
  QrCodeIcon,
  User2,
  UserX2,
  LucideUserCheck2,
  Server,
  FileBarChart,
  FileLineChart,
  FileCheck,
  Boxes,
  Box,
  FileBox,
  Terminal,
  TerminalSquare,
  TerminalIcon,
  User,
  UserPen,
  CalendarClock,
  CalendarSearch,
  Gauge,
  ChartScatter,
  ChartColumnDecreasing,
} from "lucide-react";



export const SIDEBAR_ROUTES = [

  {
    categoryName: "Dashboard",
    icon: LayoutDashboard,
     href: "/dashboard",
    routes: [
      {
        label: "Dashboard",
        href:  "/dashboard",
        icon: UserRoundPlus,
      },
    
    ],
  },
  {
    categoryName: "Timeline",
    icon: CalendarClock,
    
    routes: [
      {
        label: "Task Timeline Manager",
        href:  "/analytics/timeline",
        icon: CalendarSearch,
      },
    
    ],
  },
  {
    categoryName: "Portal Users",
    icon: UserRound,
    routes: [
      {
        label: "Add Portal User",
        href: "/portal-users/create-new/",
        icon: UserRoundPlus,
      },
      {
        label: "Manage Users",
        href: "/portal-users",
        icon: FileCog,
      },
    ],
  },
  {
    categoryName: "Projects",
    icon: Boxes,
    routes: [
      {
        label: "Add Project",
        href: "/projects/create-new",
        icon: Box,
      },
      {
        label: "Manage Projects",
        href: "/projects/",
        icon: FileBox,
      },
    ],
    },
    {
      categoryName: "Tasks",
      icon: TerminalIcon,
      routes: [
        {
          label: "Add Task",
          href: "/analytics/tasks/create-new",
          icon: Terminal,
        },
        {
          label: "Manage Tasks",
          href: "/analytics/tasks/",
          icon: TerminalSquare,
        },
      

      ],
    },
    {
      categoryName: "Analytics",
      icon: ChartScatter,
      routes: [
        {
          label: "Projects",
          href: "/analytics/graphs/projects",
          icon: ChartColumnDecreasing,
        },
       
      

      ],
    },
     {
    categoryName: "Dashboard",
    icon: LayoutDashboard,
     href: "/se-dashboard/",
    routes: [
      {
        label: "Dashboard",
            href: "/se-dashboard/",

        icon: Gauge,
      },
    
    ],
  },
    {
      categoryName: "User",
      icon: User,
      routes: [
    
        {
          label: "Update Profile",
          href: "/se-dashboard/profile/",
          icon: UserPen,
        },
      

      ],
    },
     {
    categoryName: "Timeline",
    icon: CalendarClock,
    
    routes: [
      {
        label: "Task Timeline Manager",
        href:  "/se-dashboard/timeline",
        icon: CalendarSearch,
      },
    
    ],
  },
  {
      categoryName: "Analytics",
      icon: ChartScatter,
      routes: [
        {
          label: "Projects",
          href: "/se-dashboard/graphs/projects",
          icon: ChartColumnDecreasing,
        },
       
      

      ],
    },
    {
      categoryName: "Tasks",
      icon: TerminalIcon,
      routes: [
    
      {
        label: "Self Assign Tasks",
        href: "/se-dashboard/tasks/create-new",
        icon: TerminalSquare,
      },
     
      {
        label: "Manage Tasks",
        href: "/se-dashboard/tasks/",
        icon: TerminalSquare,
      },
     

    ],
  },
  
];

export const HEADER_INFO = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutPanelTop,
  },
  {
    label: "Add Production Lines",
    href: "/production-lines/create-new",
    icon: AlignHorizontalDistributeCenter,
  },
  {
    label: "Add ELIoT Devices",
    href: "/eliot-devices/create-new",
    icon: PlusSquare,
  },
  {
    label: "Manage ELIoT Devices",
    href: "/eliot-devices",
    icon: Settings,
  },
  {
    label: "Operator Wise DHU ",
    href: "/analytics/dhu-operator",
    icon: BarChartHorizontal,
  },
  {
    label: "Add Sewing Machines",
    href: "/sewing-machines/create-new",
    icon: PlusSquare,
  },
  {
    label: "Manage Sewing Machines",
    href: "/sewing-machines",
    icon: Settings,
  },
  {
    label: "Sewing Machine types",
    href: "/analytics/machine-type",
    icon: BarChart3,
  },
  {
    label: "Summary Efficiency Report - Line",
    href: "/analytics/RLine-efficiency",
    icon: Table,
  },
  {
    label: "Roaming QC",
    href: "/analytics/roaming-qc",
    icon: AlignHorizontalDistributeCenter,
  },
  // {
  //     label: "Machine Summary",
  //     href: "/analytics/machine-summary",
  //     icon: TableProperties
  // },
  {
    label: "Machine Summary",
    href: "/analytics/machine-summary-new",
    icon: TableProperties,
  },
  {
    label: "Add Sewing Operators",
    href: "/sewing-operators/create-new",
    icon: UserRoundPlus,
  },
  {
    label: "Operator DHU Report",
    href: "/analytics/operator-dhu",
    icon: BarChartHorizontal,
  },
  {
    label: "Manage Sewing Operators",
    href: "/sewing-operators",
    icon: UserRoundCog,
  },
  {
    label: "User Credentials",
    href: "/analytics/qr-generator",
    icon: QrCode,
  },
  {
    label: "Sewing Machine Details",
    href: "/analytics/sm-qr-generator",
    icon: QrCode,
  },
  {
    label: "Add Factory Staff",
    href: "/factory-staffs/create-new",
    icon: UserRoundPlus,
  },
  {
    label: "Manage Factory Staff",
    href: "/factory-staffs",
    icon: UserRoundCog,
  },
  {
    label: "Add Portal Account User",
    href: "/portal-accounts/create-new",
    icon: UserRoundPlus,
  },
  {
    label: "Manage Portal Account Users",
    href: "/portal-accounts",
    icon: UserRoundCog,
  },
  {
    label: "AVG. Efficiency Report - Individual Operator",
    href: "/analytics/operator-report",
    icon: Table,
  },
  {
    label: "Manage Operations",
    href: "/operations",
    icon: Settings,
  },
  {
    label: "Manage Production Lines",
    href: "/production-lines",
    icon: ServerCog,
  },
  {
    label: "Line Individual Efficiency report",
    href: "/analytics/line-efficiency-report",
    icon: Table,
  },
  {
    label: "SMS & Email Alert Logs",
    href: "/alert-logs",
    icon: Mail,
  },
  {
    label: "Create Bulletin",
    href: "/obb-sheets/create-new",
    icon: FileSpreadsheet,
  },
  {
    label: "Manage Bulletin",
    href: "/obb-sheets",
    icon: FileCog,
  },
  {
    label: "Hourly Production Achievements",
    href: "/analytics/hourly-production",
    icon: BarChart3,
  },
  {
    label: "Cycle Time Analysis vs Target SMV",
    href: "/analytics/operation-smv-hourly",
    icon: BarChart3,
  },
  {
    label: "SMV vs Cycle Time",
    href: "/analytics/operation-smv",
    icon: BarChart3,
  },
  {
    label: "Yamuzami Graph",
    href: "/analytics/yamuzami-graph",
    icon: BarChart3,
  },
  {
    label: "Operation Efficiency (60 Minute)",
    href: "/analytics/operation-efficiency-60",
    icon: BarChartHorizontal,
  },
  {
    label: "Production Heatmap (15 Minute)",
    href: "/analytics/operation-efficiency-15",
    icon: BarChartHorizontal,
  },
  {
    label: "Operator Efficiency (60 Minute)",
    href: "/analytics/operator-efficiency-60",
    icon: BarChartHorizontal,
  },
  {
    label: "Operator Efficiency (15 Minute)",
    href: "/analytics/operator-efficiency-15",
    icon: BarChartHorizontal,
  },
  {
    label: "Resource Utilization",
    href: "/analytics/operator-effective-time",
    icon: Table,
  },
  {
    label: "DHU Status",
    href: "/analytics/tls-productions",
    icon: Sliders,
  },

  {
    label: "Opertor Wise DHU",
    href: "/analytics/tls-operators",
    icon: Sliders,
  },
  {
        label: "Hourly Production (Operator)",
        href: "/analytics/operator-hourly",
        icon: BarChartHorizontal,
      },
  {
    label: "Sectional DHU",
    href: "/analytics/defect-chart",
    icon: BarChartHorizontal,
  },

  {
    label: "Daily Target vs Actual - Pieces",
    href: "/analytics/daily-achivement",
    icon: Sliders,
  },
  {
    label: "Daily Target vs Actual (Instance)",
    href: "/analytics/daily-achivement-ins",
    icon: BarChartHorizontal,
  },
  {
    label: "Hourly Production",
    href: "/analytics/production-hourly",
    icon: LocateFixed,
  },
  {
    label: "Overall Performance - Operations (Live Data)",
    href: "/analytics/achievement-rate-operation",
    icon: Sliders,
  },
  {
    label: "Log Records",
    href: "/analytics/log",
    icon: Sliders,
  },
  {
    label: "Overall Operation Efficiency ",
    href: "/analytics/efficiency-rate",
    icon: Sliders,
  },
  {
    label: "Overall Efficiency Report - Detailed",
    href: "/analytics/daily-report",
    icon: Sliders,
  },
  {
    label: "Operation Efficiency-(15minute)",
    href: "/analytics/operation-efficiency-15m",
    icon: Sliders,
  },
  {
    label: "Line Efficiency Resources",
    href: "/line-efficiency-resources",
    icon: Cable,
  },
  {
    label: "Pitch Graph",
    href: "/analytics/pitch-diagram",
    icon: LineChart,
  },
   {
        label: "Operator Efficiency Overview",
        href: "/analytics/overall-operator",
        icon: BarChartHorizontal,
      },
  {
    label: "Capacity Diagram",
    href: "/analytics/capacity-graph",
    icon: LineChart,
  },
  {
    label: "Top Performence Operators",
    href: "/analytics/top-operator",
    icon: BarChartHorizontal,
  },
];
