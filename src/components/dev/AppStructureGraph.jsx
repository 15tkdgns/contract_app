import React, { useMemo } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

function AppStructureGraph() {
    const elements = useMemo(() => [
        // Root
        { data: { id: 'App', label: 'Constract App', type: 'root' } },

        // Categories (Logical Groups)
        { data: { id: 'VisualLayer', label: 'Visualization Layer', type: 'layer' } },
        { data: { id: 'CatNet', label: 'Network Analysis', type: 'category' } },
        { data: { id: 'CatFlow', label: 'Finance Flow', type: 'category' } },
        { data: { id: 'CatRisk', label: 'Risk Analysis', type: 'category' } },
        { data: { id: 'CatMeta', label: 'Meta Tools', type: 'category' } },

        // Directories
        { data: { id: 'DirPages', label: '/pages', type: 'dir' } },
        { data: { id: 'DirComps', label: '/components', type: 'dir' } },
        { data: { id: 'DirDev', label: '/components/dev', type: 'dir' } },
        { data: { id: 'DirServices', label: '/services', type: 'dir' } },

        // Files - Pages
        { data: { id: 'UploadPage', label: 'UploadPage.jsx', type: 'file' } },
        { data: { id: 'ResultPage', label: 'ResultPage.jsx', type: 'file' } },

        // Files - Components
        { data: { id: 'ScoreHero', label: 'RiskSummaryPanel', type: 'file' } },
        { data: { id: 'Checklist', label: 'SmartChecklist', type: 'file' } },
        { data: { id: 'DevTools', label: 'DevTools.jsx', type: 'file' } },

        // Files - Dev Labs
        { data: { id: 'NetworkGraph', label: 'NetworkGraph', type: 'lab' } },
        { data: { id: 'CytoscapeGraph', label: 'CytoscapeGraph', type: 'lab' } },
        { data: { id: 'D3Sankey', label: 'D3Sankey', type: 'lab' } },
        { data: { id: 'RiskRadar', label: 'RiskRadarChart', type: 'lab' } },

        // Files - Services
        { data: { id: 'AnalysisService', label: 'analysisService.js', type: 'service' } },
        { data: { id: 'Patterns', label: 'fraudPatterns.json', type: 'data' } },

        // External
        { data: { id: 'GPT', label: 'OpenAI GPT-4o', type: 'api' } },
        { data: { id: 'Tesseract', label: 'Tesseract OCR', type: 'lib' } },

        // Edges - Directory
        { data: { source: 'App', target: 'DirPages' } },
        { data: { source: 'App', target: 'DirComps' } },
        { data: { source: 'App', target: 'DirServices' } },
        { data: { source: 'DirComps', target: 'DirDev' } },

        // Edges - File Containment
        { data: { source: 'DirPages', target: 'UploadPage' } },
        { data: { source: 'DirPages', target: 'ResultPage' } },
        { data: { source: 'DirComps', target: 'ScoreHero' } },
        { data: { source: 'DirComps', target: 'Checklist' } },
        { data: { source: 'DirComps', target: 'DevTools' } },

        { data: { source: 'DirDev', target: 'VisualLayer' } },

        { data: { source: 'VisualLayer', target: 'CatNet' } },
        { data: { source: 'VisualLayer', target: 'CatFlow' } },
        { data: { source: 'VisualLayer', target: 'CatRisk' } },
        { data: { source: 'VisualLayer', target: 'CatMeta' } },

        { data: { source: 'DirServices', target: 'AnalysisService' } },
        { data: { source: 'DirServices', target: 'Patterns' } },

        // Edges - Logic Flow (Dashed)
        { data: { source: 'UploadPage', target: 'AnalysisService', type: 'flow' } },
        { data: { source: 'AnalysisService', target: 'GPT', type: 'flow' } },
        { data: { source: 'AnalysisService', target: 'Patterns', type: 'flow' } },
        { data: { source: 'UploadPage', target: 'Tesseract', type: 'flow' } },
        { data: { source: 'AnalysisService', target: 'ResultPage', type: 'flow' } },

        { data: { source: 'ResultPage', target: 'DevTools', type: 'usage' } },
        { data: { source: 'DevTools', target: 'VisualLayer', type: 'usage' } }

    ], [])

    const layout = {
        name: 'breadthfirst',
        directed: true,
        padding: 30,
        spacingFactor: 1.2,
        animate: true
    }

    const styleSheet = [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'text-valign': 'bottom',
                'text-halign': 'center',
                'font-size': '10px',
                'color': '#eee',
                'width': 30,
                'height': 30,
                'background-color': '#666'
            }
        },
        {
            selector: 'node[type="root"]',
            style: { 'background-color': '#f5222d', 'width': 40, 'height': 40, 'font-size': '12px', 'font-weight': 'bold' }
        },
        {
            selector: 'node[type="layer"]',
            style: {
                'background-color': '#eb2f96',
                'shape': 'hexagon',
                'width': 120,
                'height': 40,
                'color': '#fff',
                'font-size': '12px',
                'font-weight': 'bold',
                'border-width': 2,
                'border-color': '#fff'
            }
        },
        {
            selector: 'node[type="category"]',
            style: { 'background-color': '#f5222d', 'width': 40, 'height': 40, 'font-size': '12px', 'font-weight': 'bold' }
        },
        {
            selector: 'node[type="dir"]',
            style: { 'background-color': '#faad14', 'shape': 'rectangle' }
        },
        {
            selector: 'node[type="file"]',
            style: { 'background-color': '#1890ff' }
        },
        {
            selector: 'node[type="lab"]',
            style: { 'background-color': '#722ed1' } // Purple
        },
        {
            selector: 'node[type="api"]',
            style: { 'background-color': '#52c41a', 'shape': 'hexagon' }
        },
        {
            selector: 'edge',
            style: {
                'width': 1,
                'line-color': '#555',
                'target-arrow-color': '#555',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        },
        {
            selector: 'edge[type="flow"]',
            style: {
                'line-style': 'dashed',
                'width': 2,
                'line-color': '#1890ff',
                'target-arrow-color': '#1890ff'
            }
        },
        {
            selector: 'edge[type="usage"]',
            style: {
                'line-style': 'dotted',
                'width': 2,
                'line-color': '#722ed1',
                'target-arrow-color': '#722ed1'
            }
        }
    ]

    return (
        <div style={{ width: '100%', height: '500px', background: '#222', borderRadius: '12px', overflow: 'hidden', padding: '10px' }}>
            <h4 style={{ color: '#fff', margin: '0 0 10px 10px' }}>App Structure Map</h4>
            <CytoscapeComponent
                elements={elements}
                style={{ width: '100%', height: 'calc(100% - 30px)' }}
                layout={layout}
                stylesheet={styleSheet}
                userZoomingEnabled={true}
            />
        </div>
    )
}

export default AppStructureGraph
