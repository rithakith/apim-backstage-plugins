/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  useState,
  cloneElement,
  forwardRef,
  type ReactNode,
  type ReactElement,
  type MouseEvent,
  type CSSProperties,
} from 'react';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import type { Icons } from '@material-table/core';
import { Link, Table } from '@backstage/core-components';
import { Wso2GatewayInfo } from '../../../api';
import { normalizeGatewayType } from '../../../utils/apiManagerUtils';

export function getApiTypeChipStyle(): CSSProperties {
  return {
    height: 22,
    backgroundColor: '#eceff1',
    color: '#455a64',
    border: '1px solid #cfd8dc',
    borderRadius: 12,
    fontSize: '0.7rem',
    fontWeight: 700,
    lineHeight: 1,
  };
}

const useTooltipStyles = makeStyles(theme => ({
  tooltip: {
    backgroundColor: 'rgba(97, 97, 97, 0.92)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 8,
    fontSize: '0.6875rem',
    fontFamily: theme.typography.fontFamily,
    lineHeight: '1.4em',
    pointerEvents: 'none',
  },
}));

function PointerTooltip({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactElement;
}) {
  const classes = useTooltipStyles();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const virtualElement = {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: position.y + 15,
      left: position.x,
      right: position.x,
      bottom: position.y + 15,
    }),
    clientWidth: 0,
    clientHeight: 0,
  };

  return (
    <>
      {cloneElement(children, {
        onMouseMove: (e: any) => {
          handleMouseMove(e);
          if (children.props.onMouseMove) children.props.onMouseMove(e);
        },
        onMouseEnter: (e: any) => {
          const target = e.currentTarget;
          if (target && target.scrollWidth > target.clientWidth) {
            setOpen(true);
          }
          if (children.props.onMouseEnter) children.props.onMouseEnter(e);
        },
        onMouseLeave: (e: any) => {
          setOpen(false);
          if (children.props.onMouseLeave) children.props.onMouseLeave(e);
        },
      })}
      <Popper
        open={open}
        anchorEl={virtualElement as any}
        placement="bottom-start"
        transition
        style={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper className={classes.tooltip} elevation={0}>
              {title}
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
}

export function renderNameWithTypeChip(
  label: string,
  to: string,
  type?: string,
): React.ReactNode {
  return (
    <Box
      display="flex"
      alignItems="center"
      style={{
        minWidth: 0,
        width: '100%',
      }}
    >
      <PointerTooltip title={label}>
        <Link
          to={to}
          style={{
            color: '#007acc',
            display: 'block',
            fontWeight: 'bold',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 8,
            transform: 'translateY(-2.5px)',
          }}
        >
          {label}
        </Link>
      </PointerTooltip>
      {type && (
        <Chip
          size="small"
          label={type.toUpperCase()}
          style={{
            ...getApiTypeChipStyle(),
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  );
}

export function renderTruncatedNameLink(
  label: string,
  to: string,
): React.ReactNode {
  return (
    <PointerTooltip title={label}>
      <Link
        to={to}
        style={{
          color: '#007acc',
          display: 'block',
          fontWeight: 'bold',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Link>
    </PointerTooltip>
  );
}

export function renderTruncatedContext(context?: string): React.ReactNode {
  if (!context) {
    return '';
  }

  return (
    <PointerTooltip title={context}>
      <span
        style={{
          display: 'block',
          maxWidth: 220,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {context}
      </span>
    </PointerTooltip>
  );
}

export function renderGatewayNames(
  gateways?: Wso2GatewayInfo[],
): React.ReactNode {
  if (!gateways?.length) {
    return 'WSO2';
  }

  const names = Array.from(
    new Set(gateways.map(gateway => normalizeGatewayType(gateway.gatewayType))),
  );

  return (
    <>
      {names.map((name, index) => (
        <div key={index} style={{ whiteSpace: 'nowrap' }}>
          {name}
        </div>
      ))}
    </>
  );
}

const HiddenTableIcon = forwardRef<SVGSVGElement>(() => null);

export const tableIconsWithoutSearchClear: Icons = {
  ...Table.icons,
  ResetSearch: HiddenTableIcon,
};
