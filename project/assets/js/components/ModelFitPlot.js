import _ from 'underscore';
import React from 'react';

import h from 'utils/helpers';

import Loading from './Loading';


class ModelFitPlot extends React.Component {

    render(){
        var plot_json = this.props.plot_json;
        if (_.isUndefined(plot_json)) return <Loading />;
        return <div className="bk-root">
            <div className="bk-plotdiv"
                 ref='plotHolder'
                 data-id={plot_json.render_items[0].elementid}></div>
        </div>;
    }

    renderBokeh(){
        const { plot_json } = this.props;
        if (plot_json) h.renderBokeh(this.refs.plotHolder, plot_json);
    }

    componentDidMount(){
        this.renderBokeh();
    }

    componentDidUpdate(){
        this.renderBokeh();
    }

}

export default ModelFitPlot;
