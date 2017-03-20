import React from 'react';

import DatasetEdit from 'containers/DatasetEdit';
import Execute from 'containers/Execute';
import ModelFits from 'containers/ModelFits';
import ModelSettingsEdit from 'containers/ModelSettingsEdit';
import BmdEstimates from 'containers/BmdEstimates';
import BmdEstimatesEdit from 'containers/BmdEstimatesEdit';
import PublicRunToggle from 'containers/PublicRunToggle';

import DatasetTable from './DatasetTable';
import DatasetPlot from './DatasetPlot';
import ModelSettings from './ModelSettings';


class AppTabs extends React.Component {

    renderReadContent(){
        return (
            <div className='tab-content' style={{paddingTop: '1em'}}>
                <div role='tabpanel' className='tab-pane active' id='dataset'>
                    <div className='row-fluid'>
                        <div className='col-md-6'>
                            <DatasetTable run={this.props.run.object} />
                        </div>
                        <div className='col-md-6'>
                            <DatasetPlot
                                run={this.props.run.object}
                                onWillMount={this.props.onDatasetPlotWillMount}/>
                        </div>
                    </div>
                </div>
                <div role='tabpanel' className='tab-pane' id='modelRun'>
                    <ModelSettings
                        run={this.props.run.object}
                        pystanVersion={this.props.pystanVersion} />
                </div>
                <div role='tabpanel' className='tab-pane' id='modelFits'>
                    <ModelFits isEditMode={false} />
                </div>
                <div role='tabpanel' className='tab-pane' id='bmdEstimates'>
                    <BmdEstimates  />
                </div>
            </div>
        );
    }

    renderEditContent(){
        return (
            <div className='tab-content' style={{paddingTop: '1em'}}>
                <div role='tabpanel' className='tab-pane active' id='dataset'>
                    <div className='row-fluid'>
                        <div className='col-md-6'>
                            <DatasetEdit run={this.props.run.object} />
                        </div>
                        <div className='col-md-6'>
                            <DatasetPlot
                                run={this.props.run.object}
                                onWillMount={this.props.onDatasetPlotWillMount}/>
                            <DatasetTable run={this.props.run.object} />
                        </div>
                    </div>
                </div>
                <div role='tabpanel' className='tab-pane' id='modelRun'>
                    <ModelSettingsEdit />
                </div>
                <div role='tabpanel' className='tab-pane' id='modelSettings'>
                    <ModelFits isEditMode={true} />
                </div>
                <div role='tabpanel' className='tab-pane' id='execute'>
                    <Execute />
                </div>
                <div role='tabpanel' className='tab-pane' id='modelFits'>
                    <ModelFits isEditMode={false} />
                </div>
                <div role='tabpanel' className='tab-pane' id='bmdEstimates'>
                    <BmdEstimatesEdit />
                </div>
            </div>
        );
    }

    renderEditTabs(){
        let datasetTabClass = (this.props.datasetValid) ? '' : 'disabled',
            datasetDataToggle = (this.props.datasetValid) ? 'tab' : 'dropdown',
            modelsTabClass = (this.props.allModelsExecuted) ? '' : 'disabled',
            modelsDataToggle = (this.props.allModelsExecuted) ? 'tab' : 'dropdown';
        return (
            <ul className='nav nav-tabs' role='tablist'>
                <li className='active'>
                    <a href='#dataset'
                        data-toggle='tab'>Dataset</a>
                </li>
                <li className={datasetTabClass}>
                    <a href='#modelRun'
                        data-toggle={datasetDataToggle}>MCMC settings</a>
                </li>
                <li className={datasetTabClass}>
                    <a href='#modelSettings'
                        data-toggle={datasetDataToggle}>Model settings</a>
                </li>
                <li className={datasetTabClass}>
                    <a href='#execute'
                        data-toggle={datasetDataToggle}>Execute model fit</a>
                </li>
                <li className={modelsTabClass}>
                    <a href='#modelFits'
                        data-toggle={modelsDataToggle}>Model fit results</a>
                </li>
                <li className={modelsTabClass}>
                    <a href='#bmdEstimates'
                        data-toggle={modelsDataToggle}>BMD estimates</a>
                </li>
                <li className="pull-right"
                     title="If public, anyone with this link can view (but not edit)">
                    <PublicRunToggle />
                </li>
            </ul>
        );
    }

    renderReadTabs(){
        return (
            <ul className='nav nav-tabs' role='tablist'>
                <li className='active'>
                    <a href='#dataset'
                        data-toggle='tab'>Dataset</a>
                </li>
                <li>
                    <a href='#modelRun'
                        data-toggle='tab'>MCMC settings</a>
                </li>
                <li>
                    <a href='#modelFits'
                        data-toggle='tab'>Model fit results</a>
                </li>
                <li>
                    <a href='#bmdEstimates'
                        data-toggle='tab'>BMD estimates</a>
                </li>
            </ul>
        );
    }

    render() {

        let tabs = (this.props.isEditMode)?
            this.renderEditTabs():
            this.renderReadTabs();

        let content = (this.props.isEditMode)?
            this.renderEditContent():
            this.renderReadContent();

        return (
            <div>
                {tabs}
                {content}
            </div>
        );
    }

}

AppTabs.propTypes = {
    run: React.PropTypes.object.isRequired,
    isEditMode: React.PropTypes.bool.isRequired,
    datasetValid: React.PropTypes.bool.isRequired,
    pystanVersion: React.PropTypes.string.isRequired,
    allModelsExecuted: React.PropTypes.bool.isRequired,
    onDatasetPlotWillMount: React.PropTypes.func.isRequired,
};

export default AppTabs;
