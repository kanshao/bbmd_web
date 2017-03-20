import _ from 'underscore';
import React from 'react';

import h from 'utils/helpers';

import Loading from './Loading';


class DatasetPlot extends React.Component {

    componentWillMount() {
        this.props.onWillMount();
    }

    componentDidUpdate(){
        const { run } = this.props;
        if (!_.isUndefined(run.plot_json))
            h.renderBokeh(this.refs.plotHolder, run.plot_json);
    }

    renderPlot(){
        const { run } = this.props;
        if (_.isUndefined(run) || _.isUndefined(run.plot_json))
            return <Loading />;
        return <div ref='plotHolder'></div>;
    }

    render(requestPlot){
        return (
          <div>
            {this.renderPlot()}
          </div>
        );
    }

}

export default DatasetPlot;
