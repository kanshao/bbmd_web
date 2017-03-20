import _ from 'underscore';
import React from 'react';

import h from 'utils/helpers';

import BmdEstimate from './BmdEstimate';
import FormFieldError from './FormFieldError';
import FormButtons from './FormButtons';
import ServerError from './ServerError';


class BmdEditEstimate extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getPriorWeightState(props.priorWeights);
    }

    componentWillReceiveProps(props){
        let newState = this.getPriorWeightState(props.priorWeights);
        this.state = newState;
        this.setState(newState);
    }

    getPriorWeightState(object){
        return h.deepCopy(object);
    }

    updateModelPrior(e){
        let obj = {};
        obj[parseInt(e.target.dataset.model_id)] = e.target.value;
        this.setState(obj);
    }

    renderPriors(defaultPrior, model){
        let weights = this.state,
            prior = (_.isUndefined(weights[model.id]))?
                defaultPrior:
                weights[model.id];

        return (
            <tr key={model.id}>
                <th>{model.name}</th>
                <td>
                    <input
                        data-model_id={model.id}
                        className="form-control prior_weights"
                        type="text"
                        onChange={this.updateModelPrior.bind(this)}
                        value={prior} />
                </td>
            </tr>
        );
    }

    getValidAdversityValueRange(){
        let subtype = this.props.formValues.subtype,
            act_type = this.props.formValues.adversity_ct_type,
            ah_type = this.props.formValues.adversity_hybrid_type,
            rngs = this.props.adversityRanges;

        switch(subtype){
        case 'H':
            switch(ah_type){
            case 'P':
                return rngs.quantile_domain;
            case 'A':
                return rngs.cutoff_domain_hybrid;
            default:
                return <p>Unknown values</p>;
            }
            break;
        case 'C':
            switch(act_type){
            case 'R':
                return rngs.relative_change_domain;
            case 'A':
                return rngs.absolute_change_domain;
            case 'C':
                return rngs.cutoff_domain;
            default:
                return <p>Unknown values</p>;
            }
            break;
        }
    }

    getHelpText(){
        let range = this.getValidAdversityValueRange(),
            isIncreasing = this.props.adversityRanges.is_increasing,
            direction = (isIncreasing) ? 'increasing' : 'decreasing',
            direction2   = (isIncreasing) ? 'increase' : 'decrease',
            subheading,
            helpText;

        range[0] = h.printStatistic(range[0]);
        range[1] = h.printStatistic(range[1]);

        switch(this.props.formValues.subtype){
        case 'H':
            switch(this.props.formValues.adversity_hybrid_type){
            case 'P':
                subheading = 'Percentile';
                helpText = `The responses have an ${direction} trend, please define adversity by using a quantile of the control group in the range of (${range[0]}, ${range[1]})`;
                break;
            case 'A':
                subheading = 'Absolute cutoff';
                helpText = `The responses have an ${direction} trend, please input a cutoff adversity level in the range of (${range[0]}, ${range[1]})`;
                break;
            default:
                return <p>Unknown values</p>;
            }
            break;
        case 'C':
            switch(this.props.formValues.adversity_ct_type){
            case 'R':
                subheading = 'Relative change';
                helpText = `The responses have an ${direction} trend, please input a relative increase in the range of (${range[0]}, ${range[1]})`;
                break;
            case 'A':
                subheading = 'Absolute change';
                helpText = `The responses have an ${direction} trend, please input an absolute ${direction2} in the range of (${range[0]}, ${range[1]})`;
                break;
            case 'C':
                subheading = 'Cutoff';
                helpText = `The responses have an ${direction} trend, please input a cutoff adversity level in the range of (${range[0]}, ${range[1]})`;
                break;
            default:
                return <p>Unknown values</p>;
            }
            break;
        }
        return (
            <p>
                <strong>{subheading}: </strong>
                <span>{helpText}</span>
            </p>
        );
    }

    getBmrRange(){
        let {bmr_domain, bmr_max_suggested} = this.props.adversityRanges,
            data_type = this.props.data_type;

        bmr_domain[0] = h.printStatistic(bmr_domain[0]);
        bmr_domain[1] = h.printStatistic(bmr_domain[1]);
        bmr_max_suggested = h.printStatistic(bmr_max_suggested);

        if (_.contains(['D', 'E'], data_type)){
            return `Suggested maximum of the highest incidence rate in the dataset: ${bmr_max_suggested}; any value in range (${bmr_domain[0]}, ${bmr_domain[1]}) is permitted.`;
        } else {
            return `Must be within the range of (${bmr_domain[0]}, ${bmr_domain[1]}).`;
        }
    }

    renderContinuousCentralTendencyOptions(errs){
        return (
            <div className='row'>
                <div className={'col-md-6 ' + h.getInputDivClass('adversity_ct_type', errs)}>
                    <label>Adversity measure</label>
                    <select
                        className="form-control"
                        name="adversity_ct_type"
                        onChange={this.props.handleFieldChange}
                        value={this.props.formValues.adversity_ct_type}>
                        <option value='R'>Relative change</option>
                        <option value='A'>Absolute change</option>
                        <option value='C'>Cutoff</option>
                    </select>
                    <FormFieldError errors={errs.adversity_ct_type} />
                </div>
                <div className={'col-md-6 ' + h.getInputDivClass('adversity_value', errs)}>
                    <label>Adversity value</label>
                    <input
                        className="form-control"
                        name="adversity_value"
                        type="text"
                        onChange={this.props.handleFieldChange}
                        value={this.props.formValues.adversity_value}></input>
                    <FormFieldError errors={errs.adversity_value} />
                </div>
                <div className='col-md-12 help-block'>
                    {this.getHelpText()}
                </div>
            </div>
        );
    }

    renderContinuousHybridOptions(errs){
        return (
            <div className='row'>
                <div className={'col-md-6 ' + h.getInputDivClass('adversity_hybrid_type', errs)}>
                    <label>Adversity measure</label>
                    <select
                        className="form-control"
                        name="adversity_hybrid_type"
                        onChange={this.props.handleFieldChange}
                        value={this.props.formValues.adversity_hybrid_type}>
                        <option value='P'>Control group percentile</option>
                        <option value='A'>Absolute cutoff value</option>
                    </select>
                    <FormFieldError errors={errs.adversity_hybrid_type} />
                </div>
                <div className={'col-md-6 ' + h.getInputDivClass('adversity_value', errs)}>
                    <label>Adversity value</label>
                    <input
                        className="form-control"
                        name="adversity_value"
                        type="text"
                        onChange={this.props.handleFieldChange}
                        value={this.props.formValues.adversity_value}></input>
                    <FormFieldError errors={errs.adversity_value} />
                </div>
                <div className='col-md-12 help-block'>
                    {this.getHelpText()}
                </div>
                <div className='col-md-12'>
                    {this.renderBmrField(errs)}
                </div>
            </div>
        );
    }

    renderContinuousOptions(errs){

        let subfields = (this.props.formValues.subtype === 'C')?
            this.renderContinuousCentralTendencyOptions(errs):
            this.renderContinuousHybridOptions(errs);

        return (
            <div>
            <div className={h.getInputDivClass('subtype', errs)}>
                <label>BMD estimation method</label>
                <select
                    className="form-control"
                    name="subtype"
                    onChange={this.props.handleFieldChange}
                    value={this.props.formValues.subtype}>
                    <option value='C'>Central tendency</option>
                    <option value='H'>Hybrid method (tails)</option>
                </select>
                <FormFieldError errors={errs.subtype} />
            </div>
            {subfields}
            </div>
        );
    }

    renderBmrField(errs){
        return (
            <div className={h.getInputDivClass('bmr', errs)}>
                <label>Benchmark response value</label>
                <input
                    className="form-control"
                    name="bmr"
                    type="text"
                    onChange={this.props.handleFieldChange}
                    value={this.props.formValues.bmr}></input>
                <p className='help-block'>{this.getBmrRange()}</p>
                <FormFieldError errors={errs.bmr} />
            </div>
        );
    }

    renderServerError(){
        return (this.props.serverError) ? <ServerError /> : null;
    }

    render(){
        let errs = this.props.errors || {},
            models = this.props.models || [],
            defaultPrior = 1.0 / Math.max(1, models.length),
            display = null,
            optsContent = (_.contains(['D', 'E'], this.props.data_type))?
                this.renderBmrField(errs):
                this.renderContinuousOptions(errs);

        if (this.props.object && this.props.object.run_executed){
            display = (
                <div>
                    <BmdEstimate
                        object={this.props.object}
                        onMount={this.props.onMount} />
                    <hr />
                </div>
            );
        }

        return (
            <div>
            {display}
            <form>
                <div className={h.getInputDivClass('name', errs)}>
                    <label>Model name</label>
                    <input
                        className="form-control"
                        name="name"
                        type="text"
                        onChange={this.props.handleFieldChange}
                        value={this.props.formValues.name}></input>
                    <FormFieldError errors={errs.name} />
                </div>

                {optsContent}

                <div className="form-group">
                    <label>Model-weight priors</label>
                    <table className="table table-condensed table-striped">
                        <thead>
                            <tr>
                                <th>Model</th>
                                <th>Prior weight</th>
                            </tr>
                        </thead>
                        <tbody className='priorTbl'>
                            {models.map(this.renderPriors.bind(this, defaultPrior))}
                        </tbody>
                    </table>
                    <p className="help-block">
                        Enter a value between 0 and 1 for each model, they must sum to
                        equal a value of 1.0. If a value is set to 0, then it will not
                        be included in the model-average. If the value is set to the
                        default value (1/N, where N=number of models), then weights
                        will be based purely on model-fit.
                    </p>
                </div>
                {this.renderServerError()}
                <FormButtons {...this.props} />
            </form>
            </div>
        );
    }
}

BmdEditEstimate.propTypes = {
    priorWeights: React.PropTypes.object.isRequired,
    models: React.PropTypes.array,
    isNew: React.PropTypes.bool.isRequired,
    formValues: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    handleSubmit: React.PropTypes.func.isRequired,
    handleDelete: React.PropTypes.func.isRequired,
    handleCancel: React.PropTypes.func.isRequired,
    onMount: React.PropTypes.func.isRequired,
    object: React.PropTypes.object,
    adversityRanges: React.PropTypes.object.isRequired,
    data_type: React.PropTypes.string.isRequired,
    serverError: React.PropTypes.bool.isRequired,
};

export default BmdEditEstimate;
