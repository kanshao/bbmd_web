import React from 'react';

import h from 'utils/helpers';

import FormFieldError from './FormFieldError';


class DatasetEdit extends React.Component {

    loadDefaultRawData(e) {
        e.preventDefault();
        let defaultValues = '';
        switch (this.refs.data_type.value){
        case 'D':
            defaultValues = 'Dose\tN\tIncidence\n0\t75\t5\n1.96\t49\t1\n5.69\t50\t3\n29.75\t49\t14';
            break;
        case 'E':
            defaultValues = 'Dose\tResponse\n0\t0\n0\t0\n0\t0\n0\t0\n0\t0\n0\t0\n0\t0\n0\t0\n0\t0\n0\t0\n100\t1\n100\t1\n100\t0\n100\t0\n100\t0\n100\t0\n100\t0\n100\t0\n100\t0\n100\t0\n350\t1\n350\t1\n350\t1\n350\t1\n350\t1\n350\t0\n350\t0\n350\t0\n350\t0\n350\t0\n750\t1\n750\t1\n750\t1\n750\t1\n750\t1\n750\t1\n750\t1\n750\t1\n750\t0\n750\t0\n1100\t1\n1100\t1\n1100\t1\n1100\t1\n1100\t1\n1100\t1\n1100\t1\n1100\t1\n1100\t1\n1100\t1';
            break;
        case 'C':
            defaultValues = 'Dose\tN\tResponse\tStdev\n0\t111\t2.112\t\t0.235\n10\t142\t2.095\t\t0.209\n50\t143\t1.956\t\t0.231\n150\t93\t1.587\t\t0.263\n400\t42\t1.254\t\t0.159';
            break;
        case 'I':
            defaultValues = 'Dose\tResponse\n0\t14.71\n0\t13.19\n0\t14.11\n0\t14.12\n0\t13.8\n0\t11.59\n0\t12.65\n0\t14.21\n0\t13.69\n0\t13.21\n37.5\t15.22\n37.5\t14.07\n37.5\t15.18\n37.5\t15.31\n37.5\t15.61\n37.5\t14.38\n37.5\t14.1\n37.5\t13.38\n37.5\t14.08\n37.5\t13.6\n75\t14.03\n75\t12.75\n75\t13.34\n75\t12.81\n75\t13.35\n75\t16.32\n75\t14.8\n75\t14.3\n75\t13.53\n75\t13.54\n150\t15.36\n150\t15.06\n150\t14.35\n150\t14.46\n150\t16.32\n150\t12.45\n150\t13.91\n150\t13.48\n150\t14.38\n150\t13.45\n300\t15.24\n300\t16.21\n300\t17.19\n300\t19.4\n300\t18.76\n300\t22.74\n300\t16.95\n300\t20.06\n300\t22.93\n300\t19.74\n600\t25.69\n600\t26.58\n600\t23.73\n600\t28.53\n600\t30.25\n600\t29.7\n600\t22.63\n600\t29.43\n600\t25.22\n600\t30.51';
            break;
        default:
            return 'Dataset';
        }
        this.refs.raw_data.value = defaultValues;
        this.handleFieldChange();
    }

    handleFieldChange(){
        const variance_type = (this.refs.data_type.value==='C' && this.refs.variance_type)?
            this.refs.variance_type.value:
            'NA';
        this.props.handleFieldChange({
            data_type: this.refs.data_type.value,
            raw_data: this.refs.raw_data.value,
            variance_type,
        });
    }

    renderValidationErrors(errors){
        if (errors.length === 0) return null;
        return (
            <div className='alert alert-danger'>
                <ul>
                {errors.map(function(d){
                    return <li key={d}>{d}</li>;
                })}
                </ul>
            </div>
        );
    }

    renderDatasetLabel (){
        switch (this.props.formValues.data_type){
        case 'D':
            return 'Dataset [Dose N Incidence]';
        case 'E':
            return 'Dataset [Dose Response]';
        case 'C':
            return 'Dataset [Dose N Response Variance]';
        case 'I':
            return 'Dataset [Dose Response]';
        default:
            return 'Dataset';
        }
    }

    renderVarianceField (formValues, errs){
        if (this.props.formValues.data_type !== 'C') return null;
        return (
            <div className={h.getInputDivClass('variance_type', errs)}>
                <label>Variance type</label>
                <select
                    ref="variance_type"
                    value={formValues.variance_type}
                    onChange={this.handleFieldChange.bind(this)}
                    className="form-control"
                    name="variance_type">
                    <option value="SD">Standard deviation</option>
                    <option value="SE">Standard error</option>
                </select>
                <FormFieldError errors={errs.variance_type} />
            </div>
        );
    }

    render(){
        let { formValues, handleSave} = this.props,
            errs = this.props.errors || {},
            validationErrors = formValues.errors || [];
        return (
            <form>
                {this.renderValidationErrors(validationErrors)}
                <div className={h.getInputDivClass('data_type', errs)}>
                    <label>Dataset type</label>
                    <select
                        ref="data_type"
                        value={formValues.data_type}
                        onChange={this.handleFieldChange.bind(this)}
                        className="form-control"
                        name="data_type">
                        <option value="D">Dichotomous (summary)</option>
                        <option value="E">Dichotomous (individual)</option>
                        <option value="C">Continuous (summary)</option>
                        <option value="I">Continuous (individual)</option>
                    </select>
                    <FormFieldError errors={errs.data_type} />
                </div>

                {this.renderVarianceField(formValues, errs)}

                <div className={h.getInputDivClass('raw_data', errs)}>
                    <label>{this.renderDatasetLabel()}</label>
                    <textarea
                        ref="raw_data"
                        value={formValues.raw_data}
                        onChange={this.handleFieldChange.bind(this)}
                        style={{fontFamily : 'monospace'}}
                        className="form-control"
                        name="raw_data"
                        rows="8"></textarea>
                    <FormFieldError errors={errs.raw_data} />
                    <p className="help-block">
                        Add dose-response data here using spaces between values
                        (<a href="#" onClick={this.loadDefaultRawData.bind(this)}>load example</a>).
                        Headers are optional.
                        View example data-formats <a href='/static/docs/dataTemplates.xlsx'>here</a>.
                    </p>
                </div>

                <div className="form-group">
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        type="submit">Save dataset</button>
                </div>
            </form>
        );
    }

}

export default DatasetEdit;
