import React, { useState, useMemo } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  TableContainer,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TablePagination,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as ViewIcon,
  AccountTree as DiffIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface DynamicLink {
  name: string;
  url: string;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  executionId?: string;
  config: Record<string, any>;
  
  triggeredBy?: string;
  [key: string]: any; // Allow additional fields like awxJob1-link
}

interface ProcessedAudit {
  timestamp: string;
  timestampMs: number;
  action: string;
  /** Per audit: triggeredBy, else entity spec.owner */
  triggeredBy?: string;
  executionId?: string;
  config: Record<string, any>;
  formattedDate: string;
  relativeTime: string;
  dynamicLinks: DynamicLink[];
}

export const TimelineTable = () => {
  const { entity } = useEntity();
  const [selectedAudit, setSelectedAudit] = useState<ProcessedAudit | null>(
    null,
  );
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedAudits, setSelectedAudits] = useState<
    [ProcessedAudit, ProcessedAudit] | null
  >(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const formatTime = (
    timestamp: number,
  ): { date: string; time: string; relative: string } => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let relative = '';
    if (days > 0) relative = `${days}d ago`;
    else if (hours > 0) relative = `${hours}h ago`;
    else if (minutes > 0) relative = `${minutes}m ago`;
    else relative = `${seconds}s ago`;

    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative,
    };
  };

  const allAudits = useMemo(() => {
    const auditData = entity?.metadata?.audits;
    if (!auditData || typeof auditData !== 'object') {
      return [];
    }

    const specOwnerRaw = entity?.spec?.owner;
    const specOwner =
      typeof specOwnerRaw === 'string' && specOwnerRaw.trim().length > 0
        ? specOwnerRaw.trim()
        : undefined;

    return Object.entries(auditData as unknown as Record<string, unknown>)
      .flatMap(([timestamp, raw]) => {
        if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
          return [];
        }
        const audit = raw as AuditEntry;

        const timestampMs = parseInt(timestamp, 10);
        const timeFormatted = formatTime(timestampMs);

        const triggeredByCandidate = audit.triggeredBy;
        const fromAudit =
          typeof triggeredByCandidate === 'string' &&
          triggeredByCandidate.trim().length > 0
            ? triggeredByCandidate.trim()
            : undefined;
        const triggeredBy = fromAudit ?? specOwner;

        // Extract dynamic links (fields ending with -link)
        const dynamicLinks: DynamicLink[] = [];
        Object.entries(audit).forEach(([key, value]) => {
          if (key.endsWith('-link') && typeof value === 'string' && value.trim()) {
            // Extract friendly name by removing '-link' suffix
            const friendlyName = key.replace(/-link$/, '');
            dynamicLinks.push({
              name: friendlyName,
              url: value,
            });
          }
        });

        return [
          {
            timestamp,
            timestampMs,
            action: audit.action ?? '',
            triggeredBy,
            executionId: audit.executionId,
            config: audit.config ?? {},
            formattedDate: `${timeFormatted.date} ${timeFormatted.time}`,
            relativeTime: timeFormatted.relative,
            dynamicLinks,
          } as ProcessedAudit,
        ];
      })
      .sort((a, b) => b.timestampMs - a.timestampMs);
  }, [entity]);

  const filteredAudits = useMemo(() => {
    if (actionFilter === 'all') return allAudits;
    return allAudits.filter(
      audit =>
        (audit.action ?? '').toLowerCase() === actionFilter,
    );
  }, [allAudits, actionFilter]);

  const paginatedAudits = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAudits.slice(start, start + rowsPerPage);
  }, [filteredAudits, page, rowsPerPage]);

  const availableActions = ['create', 'update', 'delete'];

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleViewConfig = (audit: ProcessedAudit) => {
    setSelectedAudit(audit);
  };

  const handleShowDiff = (currentIndex: number) => {
    if (currentIndex < paginatedAudits.length - 1) {
      const current = paginatedAudits[currentIndex];
      const previous = paginatedAudits[currentIndex + 1];
      setSelectedAudits([previous, current]);
      setDiffDialogOpen(true);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <FormControl size="small"  sx={{ minWidth: 180 }}>
              <InputLabel>Filter by Action</InputLabel>
              <Select
                value={actionFilter}
                label="Filter by Action"
                
                onChange={e => setActionFilter(e.target.value as string)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      display: 'block',
                      '& .MuiMenuItem-root': {
                        display: 'block',
                        width: '100%',
                        paddingY: "8px",   
                        paddingX: "12px" 
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">All Actions</MenuItem>
                {availableActions.map(action => (
                  <MenuItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Time</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Triggered by</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Action</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Resource</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Organization</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Project</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Module</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Links</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAudits.map((audit, index) => (
                  <TableRow key={audit.timestamp} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {audit.relativeTime}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {audit.formattedDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {audit.triggeredBy ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      >
                        {audit.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer' }}
                        >
                          {audit.config.resource_name || entity?.metadata?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Type: {audit.config.type || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entity?.metadata?.org_name || 'CDK_Prod'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entity?.metadata?.project_name ||
                          'Enterprise IT - IOPS'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: 'secondary.light',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontSize: '10px' }}
                          >
                            TF
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {audit.config.module_name?.split('/').pop() ||
                            'terraform-module'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {audit.executionId && (
                          <Tooltip title={audit.executionId} arrow>
                            <IconButton
                              size="small"
                              component="a"
                              href={audit.executionId}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.light' },
                              }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {audit.dynamicLinks.map((link) => (
                          <Tooltip 
                            key={link.name} 
                            title={
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                  {link.name}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', wordBreak: 'break-all' }}>
                                  {link.url}
                                </Typography>
                              </Box>
                            } 
                            arrow
                          >
                            <IconButton
                              size="small"
                              component="a"
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: 'primary.main',
                                fontSize: '11px',
                                minWidth: 'auto',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'primary.light',
                                '&:hover': { 
                                  backgroundColor: 'transparent',
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {link.name}
                            </IconButton>
                          </Tooltip>
                        ))}
                        {!audit.executionId && audit.dynamicLinks.length === 0 && (
                          <Typography variant="caption" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Configuration">
                          <IconButton
                            size="small"
                            onClick={() => handleViewConfig(audit)}
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {index < paginatedAudits.length - 1 && (
                          <Tooltip title="Show Diff">
                            <IconButton
                              size="small"
                              onClick={() => handleShowDiff(index)}
                              color="secondary"
                            >
                              <DiffIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={filteredAudits.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={() => {}}
            labelRowsPerPage=""
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} of ${count} entries`
            }
          />
        </CardContent>
      </Card>

      {/* Configuration Detail Dialog */}
      <Dialog
        open={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          View Details
          <IconButton onClick={() => setSelectedAudit(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAudit && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(selectedAudit.config, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Diff Dialog */}
      <Dialog
        open={diffDialogOpen}
        onClose={() => setDiffDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Configuration Diff
          <IconButton onClick={() => setDiffDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAudits && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="error">
                  Previous: {selectedAudits[0].formattedDate}
                </Typography>
                <Typography variant="subtitle2" color="success.main">
                  Current: {selectedAudits[1].formattedDate}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper sx={{ flex: 1, p: 2, backgroundColor: '#fff5f5' }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Previous Configuration
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 400,
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {JSON.stringify(selectedAudits[0].config, null, 2)}
                    </pre>
                  </Box>
                </Paper>

                <Paper sx={{ flex: 1, p: 2, backgroundColor: '#f0fff4' }}>
                  <Typography
                    variant="subtitle2"
                    color="success.main"
                    gutterBottom
                  >
                    Current Configuration
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 400,
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {JSON.stringify(selectedAudits[1].config, null, 2)}
                    </pre>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
