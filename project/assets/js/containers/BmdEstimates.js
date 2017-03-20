import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
    fetchBmdsIfNeeded,
    fetchBmdPlotIfNeeded,
    changeSelectedBmd,
} from 'actions/bmds';
import BmdEstimate from 'components/BmdEstimate';


class BmdEstimates extends React.Component {

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchBmdsIfNeeded());
    }

    onBmdEstimateMount(bmd){
        const { dispatch } = this.props;
        dispatch(fetchBmdPlotIfNeeded(bmd));
    }

    componentWillReceiveProps(nextProps) {
        const { dispatch } = this.props;
        if (!this.props.bmds.selectedObjectId &&
            nextProps.bmds.objects &&
            nextProps.bmds.objects.length>0){
            let id = nextProps.bmds.objects[0].id;
            dispatch(changeSelectedBmd(id));
        }
    }

    handlePillsClick(e){
        const { dispatch } = this.props;
        e.preventDefault();
        dispatch(changeSelectedBmd(parseInt(e.target.getAttribute('data-id'))));
    }

    renderPills(bmd){
        let className = (
             this.props.bmds.selectedObjectId &&
             this.props.bmds.selectedObjectId === bmd.id) ? 'active' : '',
            styles = {cursor: 'pointer'};
        return (
            <li key={bmd.id} className={className}>
                <a style={styles}
                   data-id={bmd.id}
                   onClick={this.handlePillsClick.bind(this)}>{bmd.name}</a>
            </li>
        );
    }

    render(){
        let objects = this.props.bmds.objects || [],
            selectedBmd = _.findWhere(
                this.props.bmds.objects,
                {id: this.props.bmds.selectedObjectId}),
            content = (objects.length > 0)?
                <p className='help-block'>Select a BMD estimate.</p>:
                <p className='help-block'>No BMD estimates have been created.</p>;

        if(selectedBmd){
            content = <BmdEstimate
                    object={selectedBmd}
                    onMount={this.onBmdEstimateMount.bind(this)} />;
        }

        return (
            <div className='row-fluid'>
                <div className='col-sm-2'>
                    <ul className='nav nav-pills nav-stacked'>
                        {objects.map(this.renderPills.bind(this))}
                    </ul>
                </div>
                <div className='col-sm-10'>
                    <div className='tab-content'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

function mapState(state) {
    return {
        config: state.config,
        bmds: state.bmds,
    };
}

export default connect(mapState)(BmdEstimates);
