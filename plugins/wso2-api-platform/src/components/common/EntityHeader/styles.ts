import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  '@global': {
    '[class*="BackstageHeaderTabs-tabsWrapper"]': {
      backgroundColor:
        theme.palette.type === 'dark' ? 'transparent' : '#ffffff',
      paddingLeft: theme.spacing(3),
      paddingTop: theme.spacing(3),
    },
    '[class*="BackstageHeaderTabs-tabsWrapper"] .MuiTabs-root': {
      minHeight: '40px !important',
    },
    '[class*="BackstageHeaderTabs-tabsWrapper"] .MuiTabs-flexContainer': {
      gap: theme.spacing(0.5),
      flexWrap: 'wrap',
    },
    '[class*="BackstageHeaderTabs-tabsWrapper"] .MuiTabs-indicator': {
      display: 'none !important',
      height: '0 !important',
      backgroundColor: 'transparent !important',
    },
    '[class*="BackstageHeaderTabs-tabsWrapper"] [class*="PrivateTabIndicator-root"]':
      {
        display: 'none !important',
        height: '0 !important',
        backgroundColor: 'transparent !important',
      },
    '[class*="PrivateTabIndicator-root"]': {
      display: 'none !important',
      height: '0 !important',
      backgroundColor: 'transparent !important',
    },
    '[class*="BackstageHeaderTabs-defaultTab"]': {
      minHeight: '40px !important',
      height: '40px !important',
      padding: '0 20px !important',
      border: '0 !important',
      borderRadius: '6px 6px 0 0',
      backgroundColor: 'transparent',
      color:
        theme.palette.type === 'dark'
          ? theme.palette.text.secondary
          : '#304271',
      fontFamily: theme.typography.fontFamily,
      fontWeight: 700,
      textTransform: 'none',
      opacity: 1,
      transition:
        'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, color 160ms ease',
    },
    '[class*="BackstageHeaderTabs-tabRoot"]:hover': {
      backgroundColor:
        theme.palette.type === 'dark' ? theme.palette.action.hover : '#eef3fb',
      color:
        theme.palette.type === 'dark' ? theme.palette.text.primary : '#304271',
    },
    '[class*="BackstageHeaderTabs-selected"]': {
      backgroundColor: '#304271 !important',
      border: '0 !important',
      color: '#ffffff !important',
      boxShadow: 'none',
      position: 'relative',
    },
    '[class*="BackstageHeaderTabs-selectedButton"]': {
      color: '#ffffff',
      borderBottom: '0',
      boxShadow: 'none',
    },
    '[class*="BackstageHeaderTabs-selected"] *': {
      color: '#ffffff',
    },
    '[class*="BackstageHeaderTabs-selectedButton"]::after': {
      display: 'none',
    },
    '[class*="BackstageHeaderTabs-tabsWrapper"] [role="tab"][aria-selected="true"]':
      {
        marginBottom: '0 !important',
        outline: '0 !important',
        border: '0 !important',
        borderBottom: '0 !important',
        boxShadow: 'none !important',
        backgroundImage: 'none !important',
      },
    '[class*="BackstageHeaderTabs-tabsWrapper"] [role="tab"][aria-selected="true"]::before':
      {
        display: 'none !important',
        borderBottom: '0 !important',
      },
    '[class*="BackstageHeaderTabs-tabsWrapper"] [role="tab"][aria-selected="true"]::after':
      {
        display: 'none !important',
        content: 'none !important',
        borderBottom: '0 !important',
      },
    '[class*="BackstageHeaderTabs-tabsWrapper"] [role="tab"][aria-selected="true"] *':
      {
        borderBottom: '0 !important',
        boxShadow: 'none !important',
        backgroundImage: 'none !important',
        textDecoration: 'none !important',
      },
    '[class*="BackstageHeaderTabs-selected"]:hover': {
      backgroundColor: '#304271 !important',
      color: '#ffffff !important',
    },
    '[class*="BackstageHeaderTabs-selected"]:hover *': {
      color: '#ffffff !important',
    },
    '[class*="EntityTabsPanel-root"]': {
      paddingTop: 0,
    },
    '[class*="EntityTabsPanel-root"] > :first-child': {
      marginTop: 0,
    },
  },
}));
