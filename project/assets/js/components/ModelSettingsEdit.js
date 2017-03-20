import React from 'react';

import h from 'utils/helpers';

import FormFieldError from './FormFieldError';


class ModelSettingsEdit extends React.Component {

    render(){
        let { formValues, handleFieldChange, handleSave} = this.props,
            errs = this.props.errors || {},
            pystanVersion = this.props.pystanVersion;
        return (
            <form>
                <div className='col-md-12'>
                    <p className='help-block'>
                        Markov Chain Monte Carlo (MCMC) settings using <a href="http://mc-stan.org/interfaces/pystan" target="_blank">Pystan</a> (version {pystanVersion})
                    </p>
                </div>
                <div className='col-md-6'>
                    <div className={h.getInputDivClass('mcmc_iterations', errs)}>
                        <label>Markov chain iterations (per chain)</label>
                        <input
                            required="true"
                            className="form-control"
                            name="mcmc_iterations"
                            type="number"
                            min="10000"
                            max="50000"
                            onChange={handleFieldChange}
                            value={formValues.mcmc_iterations}></input>
                        <FormFieldError errors={errs.mcmc_iterations} />
                        <p className="help-block">Between 10,000–50,000, inclusive.</p>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className={h.getInputDivClass('mcmc_warmup_percent', errs)}>
                        <label>Warmup percent (%)</label>
                        <input
                            required="true"
                            className="form-control"
                            name="mcmc_warmup_percent"
                            type="number"
                            min="10"
                            max="90"
                            onChange={handleFieldChange}
                            value={formValues.mcmc_warmup_percent}></input>
                        <FormFieldError errors={errs.mcmc_warmup_percent} />
                        <p className="help-block">
                            Between 10–90%, inclusive. This percent of
                            iterations are discarded from the beginning of each
                            chain, and not used for estimating the model
                            distributions.
                        </p>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className={h.getInputDivClass('mcmc_num_chains', errs)}>
                        <label>Number of Markov chains</label>
                        <input
                            required="true"
                            className="form-control"
                            name="mcmc_num_chains"
                            type="number"
                            min="1"
                            max="3"
                            onChange={handleFieldChange}
                            value={formValues.mcmc_num_chains}></input>
                        <FormFieldError errors={errs.mcmc_num_chains} />
                        <p className="help-block">Between 1–3, inclusive.</p>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className={h.getInputDivClass('seed', errs)}>
                        <label>Random seed</label>
                        <input
                            required="true"
                            className="form-control"
                            name="seed"
                            type="number"
                            min="0"
                            max="99999"
                            onChange={handleFieldChange}
                            value={formValues.seed}></input>
                        <FormFieldError errors={errs.seed} />
                        <p className="help-block">Between 0–99,999, inclusive.</p>
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-12">
                        <button
                            type="submit"
                            onClick={handleSave}
                            className="btn btn-primary">Save run settings</button>
                    </div>
                </div>

            </form>
        );
    }

}

ModelSettingsEdit.propTypes = {
    formValues: React.PropTypes.object.isRequired,
    errors: React.PropTypes.object,
    handleFieldChange: React.PropTypes.func.isRequired,
    handleSave: React.PropTypes.func.isRequired,
    pystanVersion: React.PropTypes.string.isRequired,
};

export default ModelSettingsEdit;
