import React, { useState, useMemo } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Tooltip, IconButton, TablePagination, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Visibility, AccountTree, Close } from '@mui/icons-material';
import { createRouteRef, createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

const TimelineTable = () => {
  const { entity } = useEntity();
  const [selectedAudit, setSelectedAudit] = useState(
    null
  );
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedAudits, setSelectedAudits] = useState(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    let relative = "";
    if (days > 0)
      relative = `${days}d ago`;
    else if (hours > 0)
      relative = `${hours}h ago`;
    else if (minutes > 0)
      relative = `${minutes}m ago`;
    else
      relative = `${seconds}s ago`;
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      relative
    };
  };
  const allAudits = useMemo(() => {
    var _a;
    const auditData = (_a = entity == null ? void 0 : entity.metadata) == null ? void 0 : _a.audits;
    if (!auditData || typeof auditData !== "object") {
      return [];
    }
    return Object.entries(auditData).map(([timestamp, audit]) => {
      const timestampMs = parseInt(timestamp, 10);
      const timeFormatted = formatTime(timestampMs);
      return {
        timestamp,
        timestampMs,
        action: audit.action,
        config: audit.config,
        formattedDate: `${timeFormatted.date} ${timeFormatted.time}`,
        relativeTime: timeFormatted.relative
      };
    }).sort((a, b) => b.timestampMs - a.timestampMs);
  }, [entity]);
  const filteredAudits = useMemo(() => {
    if (actionFilter === "all")
      return allAudits;
    return allAudits.filter(
      (audit) => audit.action.toLowerCase() === actionFilter
    );
  }, [allAudits, actionFilter]);
  const paginatedAudits = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAudits.slice(start, start + rowsPerPage);
  }, [filteredAudits, page, rowsPerPage]);
  const availableActions = ["create", "update", "delete"];
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  const handleViewConfig = (audit) => {
    setSelectedAudit(audit);
  };
  const handleShowDiff = (currentIndex) => {
    if (currentIndex < paginatedAudits.length - 1) {
      const current = paginatedAudits[currentIndex];
      const previous = paginatedAudits[currentIndex + 1];
      setSelectedAudits([previous, current]);
      setDiffDialogOpen(true);
    }
  };
  return /* @__PURE__ */ React.createElement(Box, { sx: { width: "100%" } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(CardContent, null, /* @__PURE__ */ React.createElement(Box, { sx: { mb: 2 } }, /* @__PURE__ */ React.createElement(FormControl, { size: "small", sx: { minWidth: 180 } }, /* @__PURE__ */ React.createElement(InputLabel, null, "Filter by Action"), /* @__PURE__ */ React.createElement(
    Select,
    {
      value: actionFilter,
      label: "Filter by Action",
      onChange: (e) => setActionFilter(e.target.value),
      MenuProps: {
        PaperProps: {
          sx: {
            display: "block",
            "& .MuiMenuItem-root": {
              display: "block",
              width: "100%",
              paddingY: "8px",
              paddingX: "12px"
            }
          }
        }
      }
    },
    /* @__PURE__ */ React.createElement(MenuItem, { value: "all" }, "All Actions"),
    availableActions.map((action) => /* @__PURE__ */ React.createElement(MenuItem, { key: action, value: action }, action.charAt(0).toUpperCase() + action.slice(1)))
  ))), /* @__PURE__ */ React.createElement(TableContainer, { component: Paper, sx: { maxHeight: 600 } }, /* @__PURE__ */ React.createElement(Table, { stickyHeader: true }, /* @__PURE__ */ React.createElement(TableHead, null, /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Time")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "User")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Action")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Resource")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Organization")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Project")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Module")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement("strong", null, "Actions")))), /* @__PURE__ */ React.createElement(TableBody, null, paginatedAudits.map((audit, index) => {
    var _a, _b, _c, _d, _e;
    return /* @__PURE__ */ React.createElement(TableRow, { key: audit.timestamp, hover: true }, /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2", sx: { fontWeight: "bold" } }, audit.relativeTime), /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "textSecondary" }, audit.formattedDate))), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, ((_a = entity == null ? void 0 : entity.spec) == null ? void 0 : _a.owner) || "System")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(
      Typography,
      {
        variant: "body2",
        sx: { textTransform: "capitalize", fontWeight: 500 }
      },
      audit.action
    )), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Box, null, /* @__PURE__ */ React.createElement(
      Typography,
      {
        variant: "body2",
        color: "primary",
        sx: { cursor: "pointer" }
      },
      audit.config.resource_name || ((_b = entity == null ? void 0 : entity.metadata) == null ? void 0 : _b.name)
    ), /* @__PURE__ */ React.createElement(Typography, { variant: "caption", color: "textSecondary" }, "Type: ", audit.config.type || "Unknown"))), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, ((_c = entity == null ? void 0 : entity.metadata) == null ? void 0 : _c.org_name) || "CDK_Prod")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, ((_d = entity == null ? void 0 : entity.metadata) == null ? void 0 : _d.project_name) || "Enterprise IT - IOPS")), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: { display: "flex", alignItems: "center", gap: 1 }
      },
      /* @__PURE__ */ React.createElement(
        Box,
        {
          sx: {
            width: 24,
            height: 24,
            backgroundColor: "secondary.light",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }
        },
        /* @__PURE__ */ React.createElement(
          Typography,
          {
            variant: "caption",
            sx: { fontSize: "10px" }
          },
          "TF"
        )
      ),
      /* @__PURE__ */ React.createElement(Typography, { variant: "body2" }, ((_e = audit.config.module_name) == null ? void 0 : _e.split("/").pop()) || "terraform-module")
    )), /* @__PURE__ */ React.createElement(TableCell, null, /* @__PURE__ */ React.createElement(Box, { sx: { display: "flex", gap: 1 } }, /* @__PURE__ */ React.createElement(Tooltip, { title: "View Configuration" }, /* @__PURE__ */ React.createElement(
      IconButton,
      {
        size: "small",
        onClick: () => handleViewConfig(audit),
        color: "primary"
      },
      /* @__PURE__ */ React.createElement(Visibility, { fontSize: "small" })
    )), index < paginatedAudits.length - 1 && /* @__PURE__ */ React.createElement(Tooltip, { title: "Show Diff" }, /* @__PURE__ */ React.createElement(
      IconButton,
      {
        size: "small",
        onClick: () => handleShowDiff(index),
        color: "secondary"
      },
      /* @__PURE__ */ React.createElement(AccountTree, { fontSize: "small" })
    )))));
  })))), /* @__PURE__ */ React.createElement(
    TablePagination,
    {
      rowsPerPageOptions: [],
      component: "div",
      count: filteredAudits.length,
      rowsPerPage,
      page,
      onPageChange: handleChangePage,
      onRowsPerPageChange: () => {
      },
      labelRowsPerPage: "",
      labelDisplayedRows: ({ from, to, count }) => `${from}-${to} of ${count} entries`
    }
  ))), /* @__PURE__ */ React.createElement(
    Dialog,
    {
      open: !!selectedAudit,
      onClose: () => setSelectedAudit(null),
      maxWidth: "md",
      fullWidth: true
    },
    /* @__PURE__ */ React.createElement(
      DialogTitle,
      {
        sx: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      "View Details",
      /* @__PURE__ */ React.createElement(IconButton, { onClick: () => setSelectedAudit(null) }, /* @__PURE__ */ React.createElement(Close, null))
    ),
    /* @__PURE__ */ React.createElement(DialogContent, null, selectedAudit && /* @__PURE__ */ React.createElement(Box, { sx: { mt: 1 } }, /* @__PURE__ */ React.createElement(Box, { sx: { backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 } }, /* @__PURE__ */ React.createElement("pre", { style: { margin: 0, fontSize: "12px", overflow: "auto" } }, JSON.stringify(selectedAudit.config, null, 2)))))
  ), /* @__PURE__ */ React.createElement(
    Dialog,
    {
      open: diffDialogOpen,
      onClose: () => setDiffDialogOpen(false),
      maxWidth: "lg",
      fullWidth: true
    },
    /* @__PURE__ */ React.createElement(
      DialogTitle,
      {
        sx: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      "Configuration Diff",
      /* @__PURE__ */ React.createElement(IconButton, { onClick: () => setDiffDialogOpen(false) }, /* @__PURE__ */ React.createElement(Close, null))
    ),
    /* @__PURE__ */ React.createElement(DialogContent, null, selectedAudits && /* @__PURE__ */ React.createElement(Box, { sx: { mt: 2 } }, /* @__PURE__ */ React.createElement(Box, { sx: { display: "flex", gap: 2, mb: 2 } }, /* @__PURE__ */ React.createElement(Typography, { variant: "subtitle2", color: "error" }, "Previous: ", selectedAudits[0].formattedDate), /* @__PURE__ */ React.createElement(Typography, { variant: "subtitle2", color: "success.main" }, "Current: ", selectedAudits[1].formattedDate)), /* @__PURE__ */ React.createElement(Box, { sx: { display: "flex", gap: 2 } }, /* @__PURE__ */ React.createElement(Paper, { sx: { flex: 1, p: 2, backgroundColor: "#fff5f5" } }, /* @__PURE__ */ React.createElement(Typography, { variant: "subtitle2", color: "error", gutterBottom: true }, "Previous Configuration"), /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          backgroundColor: "#f5f5f5",
          p: 2,
          borderRadius: 1,
          overflow: "auto",
          maxHeight: 400
        }
      },
      /* @__PURE__ */ React.createElement(
        "pre",
        {
          style: {
            margin: 0,
            fontSize: "12px",
            whiteSpace: "pre-wrap"
          }
        },
        JSON.stringify(selectedAudits[0].config, null, 2)
      )
    )), /* @__PURE__ */ React.createElement(Paper, { sx: { flex: 1, p: 2, backgroundColor: "#f0fff4" } }, /* @__PURE__ */ React.createElement(
      Typography,
      {
        variant: "subtitle2",
        color: "success.main",
        gutterBottom: true
      },
      "Current Configuration"
    ), /* @__PURE__ */ React.createElement(
      Box,
      {
        sx: {
          backgroundColor: "#f5f5f5",
          p: 2,
          borderRadius: 1,
          overflow: "auto",
          maxHeight: 400
        }
      },
      /* @__PURE__ */ React.createElement(
        "pre",
        {
          style: {
            margin: 0,
            fontSize: "12px",
            whiteSpace: "pre-wrap"
          }
        },
        JSON.stringify(selectedAudits[1].config, null, 2)
      )
    )))))
  ));
};

const timelineRouteRef = createRouteRef({
  id: "timeline"
});

const timelinePlugin = createPlugin({
  id: "timeline",
  routes: {
    root: timelineRouteRef
  }
});
const TimelinePage = timelinePlugin.provide(
  createRoutableExtension({
    name: "TimelinePage",
    component: () => import('./esm/Router-152748ba.esm.js').then((m) => m.Router),
    mountPoint: timelineRouteRef
  })
);
const EntityTimelineContent = timelinePlugin.provide(
  createRoutableExtension({
    name: "TimelineContent",
    component: () => import('./esm/Router-152748ba.esm.js').then((m) => m.Router),
    mountPoint: timelineRouteRef
  })
);

export { EntityTimelineContent, TimelinePage, TimelineTable, timelinePlugin };
//# sourceMappingURL=index.esm.js.map
