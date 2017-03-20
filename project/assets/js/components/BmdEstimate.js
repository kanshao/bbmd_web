import React from 'react';

import ModelFitPlot from './ModelFitPlot';
import BmdTable from './BmdTable';


class BmdEstimate extends React.Component {

    componentWillMount(){
        this.props.onMount(this.props.object);
    }

    componentDidUpdate(){
        this.props.onMount(this.props.object);
    }

    renderContentExecuted(object){
        return (
            <div>
                <h3>BMD estimates</h3>
                <ModelFitPlot plot_json={object.plot_json} />
                <h3>BMD summary table</h3>
                <BmdTable bmd={object} />
            </div>
        );
    }

    renderContentNotExecuted(){
        return <p className='help-block'>
            BMD has not yet been executed; please execute before attempting to view results.
        </p>;
    }

    render(){
        let object = this.props.object,
            content = (object.run_executed)?
                this.renderContentExecuted(object):
                this.renderContentNotExecuted();
        return (
            <div key={object.id}>
                <h2>{object.name}</h2>
                {content}
            </div>
        );
    }

}

BmdEstimate.propTypes = {
    object: React.PropTypes.object.isRequired,
    onMount: React.PropTypes.func.isRequired,
};

export default BmdEstimate;
