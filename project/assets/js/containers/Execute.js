import React from 'react';
import { connect } from 'react-redux';

import { execute } from 'actions/run';
import { fetchModelSettingsIfNeeded } from 'actions/models';
import ExecuteComponent from 'components/Execute';


class Execute extends React.Component {

    getChecks(){
        let tests = [];

        tests.push({
            passed: (this.props.run.dose && this.props.run.dose.length>0),
            text: 'A dataset has been created.',
        });

        tests.push({
            passed: true,
            text: 'MCMC settings have been saved.',
        });

        tests.push({
            passed: (this.props.models && this.props.models.length>0),
            text: 'At least one model has been added.',
        });

        return tests;
    }

    handleFetchModelSettings(){
        const { dispatch } = this.props;
        dispatch(fetchModelSettingsIfNeeded());
    }

    handleExecute(){
        const { dispatch } = this.props;
        dispatch(execute());
    }

    render(){
        const checks = this.getChecks();
        return <ExecuteComponent
            executionEndTime={this.props.executionEndTime}
            executionStartTime={this.props.executionStartTime}
            checks={checks}
            handleExecute={this.handleExecute.bind(this)}
            handleFetchModelSettings={this.handleFetchModelSettings.bind(this)}
            serverError={this.props.serverError} />;
    }

}

function mapState(state) {
    return {
        executionStartTime: state.run.executionStartTime,
        executionEndTime: state.run.executionEndTime,
        serverError: state.run.serverError,
        run: state.run.object,
        models: state.models.objects,
        bmds: state.bmds.objects,
    };
}
export default connect(mapState)(Execute);
