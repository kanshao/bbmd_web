import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
    fetchRunIfNeeded,
    fetchRunPlot,
} from 'actions/run';
import AppTabs from 'components/AppTabs';
import Loading from 'components/Loading';

import Header from './Header';


class App extends React.Component {

    componentWillMount() {
        const { dispatch} = this.props;
        dispatch(fetchRunIfNeeded());
    }

    onDatasetPlotWillMount(){
        const { dispatch, run } = this.props;
        dispatch(fetchRunPlot(run.object.url_plot));
    }

    datasetValid(){
        return (
            _.isArray(this.props.run.object.dose) &&
            this.props.run.object.dose.length>0
        );
    }

    allModelsExecuted(){
        return (
            this.props.models &&
            this.props.models.length>0 &&
            _.all(_.pluck(this.props.models, 'run_executed'))
        );
    }

    render() {
        var config = this.props.config,
            run = this.props.run;
        if (_.isNull(run.object)) return <Loading />;
        return (
            <div>
                <Header />
                <AppTabs run={run}
                         isEditMode={config.isEditMode}
                         datasetValid={this.datasetValid()}
                         pystanVersion={config.pystan_version}
                         allModelsExecuted={this.allModelsExecuted()}
                         onDatasetPlotWillMount={this.onDatasetPlotWillMount.bind(this)} />
            </div>
        );
    }

}

function mapState(state) {
    return {
        config: state.config,
        run: state.run,
        models: state.models.objects,
    };
}
export default connect(mapState)(App);
