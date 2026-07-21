/*
 * Copyright 2026 WSO2 LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react';
import { EmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Wso2McpTool } from '../../../api';
import { useStyles } from './styles';

const MCP_TOOLS_ANNOTATION = 'wso2.com/mcp-tools';

function formatSchema(schemaDefinition: unknown): string {
  if (!schemaDefinition) return '';
  if (typeof schemaDefinition === 'string') {
    try {
      return JSON.stringify(JSON.parse(schemaDefinition), null, 2);
    } catch {
      return schemaDefinition;
    }
  }
  return JSON.stringify(schemaDefinition, null, 2);
}

function getToolSchema(tool: Wso2McpTool): unknown {
  const rawTool = tool as any;
  return (
    rawTool.schemaDefinition ||
    rawTool.inputSchema ||
    rawTool.payloadSchema ||
    rawTool.schema ||
    rawTool.parameters
  );
}

function getBackendOperation(tool: Wso2McpTool) {
  const rawTool = tool as any;
  return (
    rawTool.backendOperation ||
    rawTool.backendOperationMapping?.backendOperation
  );
}

export const EntityWso2McpToolsTab = () => {
    const classes = useStyles();
    const { entity } = useEntity();
    const mcpToolsRaw = entity.metadata.annotations?.[MCP_TOOLS_ANNOTATION];

    const mcpTools = useMemo(() => {
        if (!mcpToolsRaw) return [];
        try {
            return JSON.parse(mcpToolsRaw) as Wso2McpTool[];
        } catch (e) {
            return [];
        }
    }, [mcpToolsRaw]);

    if (mcpTools.length === 0) {
        return (
            <EmptyState
                title="No Tools"
                missing="info"
                description="This MCP server does not have tools available in the catalog."
            />
        );
    }

    return (
        <Box p={3}>
            {mcpTools.map((tool, index) => {
                const name = tool.name || 'Unnamed tool';
                const schema = formatSchema(getToolSchema(tool));
                const backendOperation = getBackendOperation(tool);
                const operationVerb = backendOperation?.verb;
                const operationTarget = backendOperation?.target;

                return (
                    <Accordion
                        key={`${name}-${index}`}
                        className={classes.accordion}
                        elevation={0}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            className={classes.summary}
                        >
                            <Box className={classes.summaryContent}>
                                <Typography variant="body1" className={classes.summaryName}>
                                    {name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    className={classes.summaryDescription}
                                >
                                    {tool.description || 'No description available'}
                                </Typography>
                                <Box className={classes.summaryMeta}>
                                    {operationVerb ? (
                                        <Chip
                                            label={operationVerb}
                                            size="small"
                                            className={classes.operationChip}
                                        />
                                    ) : (
                                        <Chip
                                            label="TOOL"
                                            size="small"
                                            className={classes.toolChip}
                                        />
                                    )}
                                    {operationTarget ? (
                                        <Typography variant="body2">{operationTarget}</Typography>
                                    ) : (
                                        <Typography variant="body2">{name}</Typography>
                                    )}
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" style={{ marginBottom: 16 }}>Tool Details</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box className={classes.fieldBox}>
                                        <Typography className={classes.fieldLabel}>Name</Typography>
                                        <Paper variant="outlined" className={classes.fieldValue}>
                                            <Typography>{name}</Typography>
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box className={classes.fieldBox}>
                                        <Typography className={classes.fieldLabel}>
                                            Description
                                        </Typography>
                                        <Paper variant="outlined" className={classes.fieldValue}>
                                            <Typography>
                                                {tool.description || 'No description available'}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box className={classes.fieldBox}>
                                        <Typography className={classes.fieldLabel}>
                                            Operation
                                        </Typography>
                                        <Paper variant="outlined" className={classes.fieldValue}>
                                            <Box className={classes.operationValue}>
                                                {operationVerb ? (
                                                    <Chip
                                                        label={operationVerb}
                                                        size="small"
                                                        className={classes.operationChip}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="TOOL"
                                                        size="small"
                                                        className={classes.toolChip}
                                                    />
                                                )}
                                                <Typography>{operationTarget || name}</Typography>
                                            </Box>
                                        </Paper>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography className={classes.fieldLabel}>Schema</Typography>
                                    {schema ? (
                                        <pre className={classes.schemaBlock}>{schema}</pre>
                                    ) : (
                                        <Paper variant="outlined" className={classes.fieldValue}>
                                            <Typography color="textSecondary">
                                                No schema available
                                            </Typography>
                                        </Paper>
                                    )}
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};
