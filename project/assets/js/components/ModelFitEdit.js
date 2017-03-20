import React from 'react';
import _ from 'underscore';

import h from 'utils/helpers';
import { POWER_BOUNDED_MODELS } from 'constants';

import Formula from './Formula';
import FormFieldError from './FormFieldError';
import FormButtons from './FormButtons';


class ModelFitEdit extends React.Component {

    componentDidMount() {
        this.handleModelTypeChange({target: this.refs.modelType});
    }

    handleModelTypeChange(e){
        this.refs.modelName.value = this.refs.modelType.value;
        this.props.handleModelTypeChange(e);
    }

    getModelTypeOptions(){
        switch(this.props.model_type){
        case 'D':
        case 'E':
            return [
                ['DLg', 'Logistic'],
                ['DPr', 'Probit'],
                ['DM1', 'Quantal linear'],
                ['DM2', 'Multistage (2nd order)'],
                ['DWe', 'Weibull'],
                ['DLl', 'LogLogistic'],
                ['DLp', 'LogProbit'],
                ['DHi', 'Dichotomous Hill'],
            ];
        case 'C':
        case 'I':
            return [
                ['CLi', 'Linear'],
                ['CPw', 'Power'],
                ['CMm', 'Michaelis Menten'],
                ['CHi', 'Hill'],
                ['CE2', 'Exponential 2'],
                ['CE3', 'Exponential 3'],
                ['CE4', 'Exponential 4'],
                ['CE5', 'Exponential 5'],
            ];
        }
    }

    renderLowerBound(errs){
        if (!_.contains(POWER_BOUNDED_MODELS, this.props.formValues.model_type)) return;
        return (
            <div className={h.getInputDivClass('power_lower_bound', errs)}>
                <label>Power parameter lower-bound</label>
                <select
                    className="form-control"
                    name="power_lower_bound"
                    onChange={this.props.handleFieldChange}
                    value={this.props.formValues.power_lower_bound}>
                    <option value="zero">0</option>
                    <option value="qtr">0.25</option>
                    <option value="pointFive">0.5</option>
                    <option value="threeQtr">0.75</option>
                    <option value="one">1.0</option>
                </select>
                <FormFieldError errors={errs.power_lower_bound} />
            </div>
        );
    }

    render(){
        let errs = this.props.errors || {},
            opts = this.getModelTypeOptions();
        return (
            <form>
                <div className={h.getInputDivClass('model_type', errs)}>
                    <label>Model type</label>
                    <select
                        ref='modelType'
                        className="form-control"
                        name="model_type"
                        onChange={this.handleModelTypeChange.bind(this)}
                        value={this.props.formValues.model_type}>
                        {opts.map((d)=>
                            <option key={d[0]} value={d[0]}>{d[1]}</option>
                        )}
                    </select>
                    <FormFieldError errors={errs.model_type} />
                </div>

                <Formula model_type={this.props.formValues.model_type} />

                <div className={h.getInputDivClass('name', errs)}>
                    <label>Model name</label>
                    <input
                        ref='modelName'
                        className="form-control"
                        name="name"
                        type="text"
                        onChange={this.props.handleFieldChange}
                        value={this.props.formValues.name}></input>
                    <FormFieldError errors={errs.name} />
                </div>

                {this.renderLowerBound(errs)}

                <FormButtons {...this.props} />
            </form>
        );
    }
}

ModelFitEdit.propTypes = {
    model_type: React.PropTypes.string.isRequired,
    isNew: React.PropTypes.bool.isRequired,
    formValues: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    handleFieldChange: React.PropTypes.func.isRequired,
    handleModelTypeChange: React.PropTypes.func.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    handleDelete: React.PropTypes.func.isRequired,
    handleCancel: React.PropTypes.func.isRequired,
};

export default ModelFitEdit;
