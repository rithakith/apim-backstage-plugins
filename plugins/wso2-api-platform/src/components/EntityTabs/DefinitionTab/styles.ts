import { makeStyles } from '@material-ui/core/styles';
import { CODE_FONT_FAMILY } from '../../../styles/fonts';

export const useStyles = makeStyles(theme => ({
  editorContainer: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid #3c3c3c',
    backgroundColor: '#1e1e1e',
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#2d2d2d',
    borderBottom: '1px solid #3c3c3c',
  },
  editorLang: {
    color: '#9d9d9d',
    fontSize: 11,
    fontFamily: CODE_FONT_FAMILY,
    letterSpacing: 1,
  },
  editorActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  monacoTextarea: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: CODE_FONT_FAMILY,
    fontSize: 13,
    lineHeight: 1.6,
    padding: '16px',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    tabSize: 2,
    overflow: 'hidden', // Disable internal scroll to let page handle it
    '&:read-only': {
      cursor: 'default',
      opacity: 0.85,
    },
  },
  editBtn: {
    backgroundColor: '#0e639c',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#1177bb',
    },
  },
  saveBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#22863a',
    },
  },
  cancelBtn: {
    textTransform: 'none',
    color: '#9d9d9d',
    borderColor: '#555',
    '&:hover': {
      borderColor: '#888',
    },
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: CODE_FONT_FAMILY,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  readOnlyBadge: {
    backgroundColor: '#2a2a2a',
    color: '#858585',
    border: '1px solid #444',
  },
  editingBadge: {
    backgroundColor: '#0e639c22',
    color: '#4dc3f7',
    border: '1px solid #0e639c66',
  },
  savedBadge: {
    backgroundColor: '#28a74522',
    color: '#85e89d',
    border: '1px solid #28a74566',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 4,
    backgroundColor: '#3a1a1a',
    border: '1px solid #e74c3c',
    color: '#f97171',
    marginBottom: theme.spacing(1),
    fontSize: 13,
  },
  accordion: {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    marginBottom: theme.spacing(1.5),
    '&:before': {
      display: 'none',
    },
  },
  summary: {
    backgroundColor: theme.palette.background.default,
    minHeight: 72,
    '& .MuiAccordionSummary-content': {
      alignItems: 'center',
      margin: theme.spacing(1.5, 0),
    },
  },
  summaryContent: {
    alignItems: 'center',
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'minmax(160px, 220px) minmax(240px, 1fr) auto',
    width: '100%',
  },
  summaryName: {
    fontWeight: 600,
    lineHeight: 1.4,
  },
  summaryDescription: {
    lineHeight: 1.4,
  },
  summaryMeta: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
    whiteSpace: 'nowrap',
  },
  toolChip: {
    minWidth: 76,
    fontWeight: 700,
  },
  operationValue: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(2),
  },
  operationChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontWeight: 700,
    minWidth: 76,
  },
  details: {
    display: 'block',
    padding: theme.spacing(3),
  },
  fieldBox: {
    marginBottom: theme.spacing(1),
  },
  fieldValue: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    padding: theme.spacing(1.25, 1.5),
    minHeight: 44,
    backgroundColor:
      theme.palette.type === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
  },
  fieldLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '1px',
    marginBottom: theme.spacing(0.25),
    textTransform: 'uppercase',
  },
  schemaBlock: {
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.6,
    margin: 0,
    maxHeight: 360,
    overflow: 'auto',
    padding: theme.spacing(2),
    whiteSpace: 'pre',
  },
}));
