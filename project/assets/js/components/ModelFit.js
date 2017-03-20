import $ from 'jQuery';
import _ from 'underscore';
import React from 'react';

import h from 'utils/helpers';
import { POWER_BOUNDED_MODELS } from 'constants';

import Formula from './Formula';
import ModelFitPlot from './ModelFitPlot';


class ModelFit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {'showParameterPlot': false};
    }

    componentWillReceiveProps(props){
        let model = props.model;
        if (!model) return;
        let hasParameterPlot = !_.isUndefined(model.parameter_plot_json);
        if (this.state.showParameterPlot && !hasParameterPlot)
            this.setState({'showParameterPlot': false});
    }

    componentDidMount(){
        this.props.onModelFitWillMount(this.props.model.id);
    }

    componentDidUpdate(){
        this.props.onModelFitWillMount(this.props.model.id);
    }

    onClickShowParameterPlot(){
        this.props.onClickShowParameterPlot(this.props.model.id);
        this.setState({'showParameterPlot': true});
    }

    onClickHideParameterPlot(){
        this.setState({'showParameterPlot': false});
    }

    renderCorrelationMatrix(params, matrix){
        if (!params) return;
        let onCorrelationHover = this.onCorrelationHover.bind(this),
            offCorrelationHover = this.offCorrelationHover.bind(this);

        return (
            <table ref='corrTbl' className='corr-tbl'>
                <thead>
                    <tr>
                        <th></th>
                        {params.map(function(v){return <th className='corr-tbl-th-top' key={v}>{v}</th>;})}
                    </tr>
                </thead>
                <tbody>
                    {matrix.map(function(v1, i1){
                        return (
                            <tr key={i1}>
                                <th className='corr-tbl-th-left'>{params[i1]}</th>
                                {v1.map(function(v2, i2){
                                    let val, className;
                                    if (i2!=i1){
                                        val = h.printStatistic(v2);
                                        className = 'corr-tbl-cell';
                                    } else if (i2 == i1){
                                        val = '1';
                                        className = 'corr-tbl-cell corr-tbl-diag';
                                    }
                                    return <td onMouseEnter={onCorrelationHover}
                                        onMouseLeave={offCorrelationHover}
                                        className={className}
                                        key={i2}>{val}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    onCorrelationHover(e){
        let rowIdx = e.target.parentNode.rowIndex,
            colIdx = $(e.target).index()+1;
        if (!parseFloat(e.target.innerHTML, 10)) return;
        $(e.target).addClass('corr-tbl-hovered');
        $(this.refs.corrTbl).find(`tbody tr:nth-child(${rowIdx}) > th`).addClass('corr-tbl-hovered');
        $(this.refs.corrTbl).find(`tr th:nth-child(${colIdx})`).addClass('corr-tbl-hovered');
    }

    offCorrelationHover(e){
        $(this.refs.corrTbl).find('td, th').removeClass('corr-tbl-hovered');
    }

    renderModelParameterPlot(){
        let model = this.props.model;
        if (this.state.showParameterPlot){
            return (
                <div>
                    <ModelFitPlot plot_json={model.parameter_plot_json} />
                    <button className='btn btn-primary'
                        onClick={this.onClickHideParameterPlot.bind(this)}>
                        <i className='fa fa-eye-slash'></i> Hide parameter charts</button>
                </div>
            );
        } else {
            return <button className='btn btn-primary'
                onClick={this.onClickShowParameterPlot.bind(this)}>
                <i className='fa fa-eye'></i> Show parameter charts</button>;
        }
    }

    renderModelParameters(model){
        if (!_.contains(POWER_BOUNDED_MODELS, model.model_type)) return;
        return (
            <p>
                <strong>Power parameter lower-bound: </strong>
                <span>{model.power_lower_bound_float}</span>
            </p>
        );
    }

    renderExecuted(model){
        return (
            <div>
                <p>
                    <strong>Pystan version: </strong>
                    <span>{model.pystan_version}</span>
                </p>
                {this.renderModelParameters(model)}
                <pre>{model.fit_summary}</pre>
                <ModelFitPlot plot_json={model.plot_json} />
                <p>
                    <strong>Posterior predictive <i>p</i>-value for model fit: </strong>
                    {h.printStatistic(model.predicted_pvalue)}
                </p>
                <p>
                    <strong>Model weight: </strong>
                    {h.printPercentage(model.model_weight_scaler)}
                </p>
                <h4>Model formula:</h4>
                <Formula model_type={model.model_type} />
                <div id='formulaHolder'></div>
                <h4>Correlation matrix:</h4>
                {this.renderCorrelationMatrix(model.parameter_names, model.parameter_correlation)}
                <h4>Parameter charts:</h4>
                {this.renderModelParameterPlot()}
            </div>
        );
    }

    renderNotExecuted(){
        return <p className='help-block'>
            Model has not yet been executed; please execute before attempting to view results.
        </p>;
    }

    render(){
        let model = this.props.model;
        if (model === null) return null;
        let id = `modelFit${model.id}`,
            content = (model.run_executed)?
                this.renderExecuted(model):
                this.renderNotExecuted(model);

        return (
            <div key={model.id} id={id}>
                <h3>{model.name} fit summary</h3>
                {content}
            </div>
        );
    }

}

export default ModelFit;
