import React, { useState } from 'react'
import NetworkGraph from './NetworkGraph'
import MoneyFlowSankey from './MoneyFlowSankey'
import CytoscapeGraph from './CytoscapeGraph'
import D3Sankey from './D3Sankey'
import AppStructureGraph from './AppStructureGraph'
import './DevTools.css'

function DevTools({ result }) {
    const [activeTab, setActiveTab] = useState('network')

    return (
        <div className="dev-tools-container">
            <div className="dev-tools-header">
                <span className="dev-badge">DEVELOPER MODE</span>
                <div className="dev-tabs">
                    <button
                        className={activeTab === 'network' ? 'active' : ''}
                        onClick={() => setActiveTab('network')}
                    >
                        관계도 (Force)
                    </button>
                    <button
                        className={activeTab === 'cytoscape' ? 'active' : ''}
                        onClick={() => setActiveTab('cytoscape')}
                    >
                        관계도 (Cytoscape)
                    </button>
                    <button
                        className={activeTab === 'sankey' ? 'active' : ''}
                        onClick={() => setActiveTab('sankey')}
                    >
                        자금 흐름 (Simple)
                    </button>
                    <button
                        className={activeTab === 'd3sankey' ? 'active' : ''}
                        onClick={() => setActiveTab('d3sankey')}
                    >
                        자금 흐름 (Pro/D3)
                    </button>
                    <button
                        className={activeTab === 'structure' ? 'active' : ''}
                        onClick={() => setActiveTab('structure')}
                    >
                        앱 구조도 (Tree)
                    </button>
                    {/* Radar moved to Detail Tab */}
                </div>
            </div>

            <div className="dev-content">
                {activeTab === 'network' && <NetworkGraph result={result} />}
                {activeTab === 'cytoscape' && <CytoscapeGraph result={result} />}
                {activeTab === 'sankey' && <MoneyFlowSankey result={result} />}
                {activeTab === 'd3sankey' && <D3Sankey result={result} />}
                {activeTab === 'structure' && <AppStructureGraph />}
            </div>

            <div className="dev-warning">
                이 기능은 실험적인 기능입니다. 실제 데이터와 일부 오차가 있을 수 있습니다.
            </div>
        </div>
    )
}

export default DevTools
