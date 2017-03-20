import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import { patchObject } from 'actions/run';
import ModelSettingsEditComponent from 'components/ModelSettingsEdit';
import h from 'utils/helpers';


class ModelSettingsEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = h.deepCopy(props.run);
    }

    handleFieldChange(e){
        let obj = {};
        obj[e.target.name] = h.getValue(e.target);
        this.setState(obj);
    }

    handleSave(e){
        e.preventDefault();
        let { dispatch } = this.props,
            id = this.props.run.id,
            patch = h.getPatch(this.props.run, this.state);

        patch = _.pick(patch, [
            'mcmc_iterations',
            'mcmc_num_chains',
            'mcmc_warmup_percent',
            'seed',
        ]);

        dispatch(patchObject(id, patch));
    }

    render(){
        return <ModelSettingsEditComponent
            formValues={this.state}
            errors={this.props.errors}
            handleFieldChange={this.handleFieldChange.bind(this)}
            handleSave={this.handleSave.bind(this)}
            pystanVersion={this.props.pystanVersion} />;
    }

}

function mapState(state) {
    return {
        run: state.run.object,
        errors: state.run.editObjectErrors,
        pystanVersion: state.config.pystan_version,
    };
}
export default connect(mapState)(ModelSettingsEdit);
